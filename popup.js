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

// Toggle IDs that belong to mutually-exclusive groups
const GROUPS = {
  noPr: ['noPrHighlight', 'noPrHide', 'noPrDim'],
  hasPr: ['hasPrHighlight', 'hasPrHide', 'hasPrDim']
};

const settingsBody = document.getElementById('settingsBody');

// ── Update the disabled visual state ──
function updateDisabledState(isEnabled) {
  if (isEnabled) {
    settingsBody.classList.remove('is-off');
  } else {
    settingsBody.classList.add('is-off');
  }
}

// ── Load settings into checkboxes ──
chrome.storage.sync.get(DEFAULTS, (settings) => {
  for (const [key, val] of Object.entries(settings)) {
    const el = document.getElementById(key);
    if (el) el.checked = val;
  }
  updateDisabledState(settings.enabled);
});

// ── Determine which group a toggle belongs to ──
function getGroupOf(id) {
  for (const [, members] of Object.entries(GROUPS)) {
    if (members.includes(id)) return members;
  }
  return null;
}

// ── Attach listeners ──
const allToggles = Object.keys(DEFAULTS);
allToggles.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('change', () => {
    const group = getGroupOf(id);

    // Mutually exclusive: turning one ON turns siblings OFF
    if (el.checked && group) {
      group.forEach(member => {
        if (member !== id) {
          const other = document.getElementById(member);
          if (other) other.checked = false;
        }
      });
    }

    // Update disabled visual state when master toggle changes
    if (id === 'enabled') {
      updateDisabledState(el.checked);
    }

    // Build settings object from current checkbox states
    const settings = {};
    allToggles.forEach(k => {
      const input = document.getElementById(k);
      if (input) settings[k] = input.checked;
    });

    // Persist — content script picks this up via chrome.storage.onChanged
    chrome.storage.sync.set(settings);
  });
});
