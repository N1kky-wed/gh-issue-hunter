// ── Background service worker ──
// Detects GitHub SPA navigations and re-injects the content script
// when the user lands on an /issues page without a full page reload.

const ISSUES_PATTERN = /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues/;

// Listen for tab URL updates (GitHub uses Turbo for client-side nav)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when the URL actually changes (not on every status update)
  if (!changeInfo.url) return;
  if (!ISSUES_PATTERN.test(changeInfo.url)) return;

  // Inject the content script into the tab
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  }).catch(() => {
    // Silently ignore errors (e.g., tab closed, permission denied)
  });
});
