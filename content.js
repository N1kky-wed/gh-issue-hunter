// ── Default settings ──
const DEFAULTS = {
  enabled: false,
  noPrHighlight: true,
  noPrHide: false,
  noPrDim: false,
  hasPrHighlight: true,
  hasPrHide: false,
  hasPrDim: false,
  liveScan: true,
  showBadges: true
};

let currentSettings = { ...DEFAULTS };
let observer = null;
let isApplying = false;
let debounceTimer = null;

// ── Inject a <style> block for badge styles ──
const styleEl = document.createElement('style');
styleEl.textContent = `
  .pr-filter-badge {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
    vertical-align: middle;
    line-height: 18px;
    pointer-events: none;
  }
  .pr-filter-badge.no-pr {
    background: #3fb950;
    color: #0d1117;
  }
  .pr-filter-badge.has-pr {
    background: #8957e5;
    color: #fff;
  }
`;
document.head.appendChild(styleEl);

// ── Finds the outermost list-item wrapper for hiding ──
// Structure: div.ListItems-module__listItem > div.IssueRow-module__row > li
function getOuterWrapper(rowEl) {
  // Walk up to find the ListItems wrapper
  let el = rowEl;
  for (let i = 0; i < 3; i++) {
    if (!el.parentElement) break;
    if (el.parentElement.className && el.parentElement.className.includes &&
        el.parentElement.className.includes('ListItems-module__listItem')) {
      return el.parentElement;
    }
    el = el.parentElement;
  }
  // Fallback: return the row itself
  return rowEl;
}

// ── Detect if an issue row has a linked PR ──
function hasPullRequest(item) {
  // 1. Check for the ClosedByPullRequestsReferences button
  if (item.querySelector('button[class*="ClosedByPullRequestsReferences"]')) return true;
  if (item.querySelector('button[aria-label*="linked PR"]')) return true;

  // 2. Check data-testid="list-row-linked-pull-requests" — if it has child elements, it has a PR
  const prSlot = item.querySelector('[data-testid="list-row-linked-pull-requests"]');
  if (prSlot && prSlot.children.length > 0) return true;

  // 3. Check for the git-pull-request octicon (but NOT the issue-opened one)
  if (item.querySelector('svg.octicon-git-pull-request')) return true;

  // 4. Legacy fallbacks
  if (item.querySelector('a[data-hovercard-type="pull_request"]')) return true;
  if (item.querySelector('a[href*="/pull/"]')) return true;

  return false;
}

// ── Clean up all applied styles and badges ──
function cleanUp() {
  if (isApplying) return;
  isApplying = true;
  if (observer) observer.disconnect();

  try {
    // Clean IssueRow divs (border/padding/opacity)
    document.querySelectorAll('div[class*="IssueRow-module__row"]').forEach(row => {
      row.style.borderLeft = '';
      row.style.paddingLeft = '';
      row.style.opacity = '';
    });
    // Clean outer wrappers (display)
    document.querySelectorAll('div[class*="ListItems-module__listItem"]').forEach(wrapper => {
      wrapper.style.display = '';
    });
    // Remove badges
    document.querySelectorAll('.pr-filter-badge').forEach(b => b.remove());
  } finally {
    isApplying = false;
  }
}

// ── Core tagging logic ──
function tagIssues() {
  if (!currentSettings.enabled) {
    cleanUp();
    stopObserver();
    return;
  }

  if (isApplying) return;
  isApplying = true;
  if (observer) observer.disconnect();

  try {
    // Select the IssueRow divs — these are the visible row containers
    const rows = document.querySelectorAll('div[class*="IssueRow-module__row"]');

    rows.forEach(row => {
      const hasPR = hasPullRequest(row);
      const outerWrapper = getOuterWrapper(row);

      // ── Clear previous styling ──
      row.style.borderLeft = '';
      row.style.paddingLeft = '';
      row.style.opacity = '';
      outerWrapper.style.display = '';
      row.querySelectorAll('.pr-filter-badge').forEach(b => b.remove());

      // ── Apply rules ──
      if (!hasPR) {
        // === No PR ===
        if (currentSettings.noPrHide) {
          outerWrapper.style.display = 'none';
          return;
        }
        if (currentSettings.noPrDim) {
          row.style.opacity = '0.45';
        }
        if (currentSettings.noPrHighlight) {
          row.style.borderLeft = '3px solid #3fb950';
          row.style.paddingLeft = '6px';
        }
        if (currentSettings.showBadges && (currentSettings.noPrHighlight || (!currentSettings.noPrDim && !currentSettings.noPrHide))) {
          addBadge(row, 'no PR', 'no-pr');
        }
      } else {
        // === Has PR ===
        if (currentSettings.hasPrHide) {
          outerWrapper.style.display = 'none';
          return;
        }
        if (currentSettings.hasPrDim) {
          row.style.opacity = '0.45';
        }
        if (currentSettings.hasPrHighlight) {
          row.style.borderLeft = '3px solid #8957e5';
          row.style.paddingLeft = '6px';
        }
        if (currentSettings.showBadges && (currentSettings.hasPrHighlight || (!currentSettings.hasPrDim && !currentSettings.hasPrHide))) {
          addBadge(row, 'has PR', 'has-pr');
        }
      }
    });
  } finally {
    isApplying = false;
    if (currentSettings.enabled && currentSettings.liveScan && observer) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

function addBadge(row, text, cls) {
  // Find the issue title link
  const titleEl = row.querySelector('a[data-testid="issue-pr-title-link"]')
    || row.querySelector('a[class*="Title-module__anchor"]')
    || row.querySelector('h3 a');
  if (titleEl && !row.querySelector(`.pr-filter-badge.${cls}`)) {
    const badge = document.createElement('span');
    badge.className = `pr-filter-badge ${cls}`;
    badge.textContent = text;
    titleEl.after(badge);
  }
}

// ── Debounced version for the observer ──
function debouncedTagIssues() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => tagIssues(), 300);
}

// ── Mutation observer for live scanning ──
function startObserver() {
  if (observer) observer.disconnect();
  observer = new MutationObserver(() => debouncedTagIssues());
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// ── React to settings changes from popup (via storage) ──
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;

  for (const [key, { newValue }] of Object.entries(changes)) {
    if (key in currentSettings) {
      currentSettings[key] = newValue;
    }
  }

  tagIssues();

  if (currentSettings.enabled && currentSettings.liveScan) {
    startObserver();
  } else if (!currentSettings.enabled) {
    stopObserver();
  }
});

// ── Init: do nothing unless enabled ──
chrome.storage.sync.get(DEFAULTS, (settings) => {
  currentSettings = { ...DEFAULTS, ...settings };

  if (currentSettings.enabled) {
    tagIssues();
    if (currentSettings.liveScan) {
      startObserver();
    }
  }
});
