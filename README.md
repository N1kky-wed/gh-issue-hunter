<p align="center">
  <img src="icon128.png" alt="PR Filter Icon" width="80" />
</p>

<h1 align="center">GitHub PR Filter</h1>

<p align="center">
  <strong>Highlight, hide, or dim GitHub issues based on their pull request status.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/version-2.0-purple?style=flat-square" alt="Version 2.0" />
</p>

---

## What It Does

When browsing GitHub issue lists, it's hard to tell which issues already have pull requests linked and which ones are still waiting for a fix. This extension solves that:

- 🟢 **Green border + badge** → Issue has **no linked PR** (needs work)
- 🟣 **Purple border + badge** → Issue **has a linked PR** (in progress)

You can also **hide** or **dim** issues from either category to focus on what matters to you.

## Features

| Feature | Description |
|---------|-------------|
| ⚡ **On-Demand** | Extension does nothing until you activate it — no background noise |
| 🟢 **No-PR Highlight** | Green border + "no PR" badge on issues without pull requests |
| 🟣 **Has-PR Highlight** | Purple border + "has PR" badge on issues with linked PRs |
| 👁 **Hide** | Completely remove issues from view (no-PR or has-PR, your choice) |
| 🔅 **Dim** | Reduce opacity of issues you care less about |
| 🏷 **Badges** | Toggle "no PR" / "has PR" text badges on or off |
| 🔄 **Live Scan** | Automatically detects new issues as you scroll or navigate |
| 💾 **Persistent** | Your settings are saved and restored across sessions |

## Install (from source)

1. Clone or download this repo:
   ```bash
   git clone https://github.com/N1kky-wed/GitHub-PR-Filter.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked** and select the extension folder

5. Navigate to any GitHub issues page (e.g. `github.com/facebook/react/issues`)

6. Click the extension icon → flip **⚡ Activate** → done

## Usage

Click the extension icon in your toolbar to open the popup:

```
┌─────────────────────────────┐
│  ⚡ Activate          [OFF] │  ← Master switch
├─────────────────────────────┤
│  ISSUES WITHOUT PR          │
│  ✦ Highlight          [ON]  │  ← Green border + badge
│  ✕ Hide               [OFF] │  ← Remove from view
│  ◐ Dim                [OFF] │  ← Reduce opacity
├─────────────────────────────┤
│  ISSUES WITH PR             │
│  ✦ Highlight          [ON]  │  ← Purple border + badge
│  ✕ Hide               [OFF] │
│  ◐ Dim                [OFF] │
├─────────────────────────────┤
│  EXTRA                      │
│  ⟳ Live Scan          [ON]  │  ← Auto-detect on scroll
│  🏷 Show Badges        [ON]  │  ← Toggle text badges
└─────────────────────────────┘
```

> **Highlight / Hide / Dim are mutually exclusive** within each group — enabling one automatically disables the others.

## How It Detects PRs

The extension checks multiple DOM signals to reliably detect linked pull requests:

| Signal | Selector |
|--------|----------|
| PR references button | `button[class*="ClosedByPullRequestsReferences"]` |
| Aria label | `button[aria-label*="linked PR"]` |
| PR metadata slot | `[data-testid="list-row-linked-pull-requests"]` with children |
| PR octicon | `svg.octicon-git-pull-request` |
| Legacy hovercard | `a[data-hovercard-type="pull_request"]` |
| Legacy link | `a[href*="/pull/"]` |

## Project Structure

```
├── manifest.json       # Extension manifest (v3)
├── content.js          # Injected into GitHub issue pages
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic & settings management
├── icon16.png          # Toolbar icon
├── icon32.png          # Toolbar icon (2x)
├── icon48.png          # Extensions page icon
└── icon128.png         # Detail page icon
```

## Permissions

| Permission | Why |
|------------|-----|
| `activeTab` | Access the current GitHub tab to apply styling |
| `storage` | Save your toggle preferences across sessions |

No data is collected. No network requests are made. Everything runs locally.

## Browser Support

- ✅ Google Chrome
- ✅ Chromium-based browsers (Edge, Brave, Arc, Vivaldi, Opera)
- ❌ Firefox (uses a different extension format)

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT — do whatever you want with it. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built to scratch my own itch. If it helps you too, star the repo ⭐</sub>
</p>
