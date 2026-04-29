# javaX Dashboard — Implementation Spec
> Handoff document for Antigravity · Version 1.0
(use svg , emoji not   allowed)
---

## Overview of Changes

| # | Change | Priority |
|---|--------|----------|
| 1 | Remove top-bar user info & bell icon | 🔴 High |
| 2 | Move user info to bottom of left navbar | 🔴 High |
| 3 | Collapse Profile & Settings into user info popover | 🔴 High |
| 4 | Collapsible left navbar (hide/show toggle) | 🔴 High |
| 5 | Bottom input panel (ChatGPT-style) | 🔴 High |
| 6 | Post-upload two-column layout (Charts + Chat) | 🔴 High |

---

## Change 1 — Remove Top Bar User Info & Bell Icon

### What to remove
- The entire top-right section containing:
  - 🔔 Bell (notification icon)
  - 👤 Avatar + "Admin User / Administrator" label + chevron

### What to keep
- The "Main Dashboard" page title text (top-left of main content area) — keep as a static heading or breadcrumb

### Implementation notes
- Delete the `<header>` or top-bar component that renders these elements
- If the notification bell has functionality (unread count, dropdown), **preserve the logic** — it will be re-attached to the user info card in Change 2
- CSS: remove any `padding-top` or `margin-top` on the main content area that was compensating for the top bar height

---

## Change 2 — User Info Card at Bottom of Left Navbar

### Target location
Bottom of the left sidebar, pinned with `position: sticky` or flexbox `margin-top: auto`

### Card layout
```
┌─────────────────────────────┐
│  [Avatar]  Admin User       │  ← name
│            Administrator    │  ← role/badge
│                         [🔔]│  ← bell icon (moved here)
└─────────────────────────────┘
```

### Behaviour
- The card is always visible at the bottom of the sidebar regardless of scroll position
- Clicking anywhere on the card opens the **User Popover** (see Change 3)
- Bell icon sits inside or adjacent to the card and opens a notifications dropdown on click (independent of the popover)
- Unread badge on bell: small red dot over the icon

### CSS notes
```css
.sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.user-info-card {
  margin-top: auto;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
}
```

---

## Change 3 — Profile & Settings as User Info Popover

### Remove from sidebar
- `Profile` nav item
- `Settings` nav item
- The `ACCOUNT` section label

### Add: User Info Popover
Triggered by clicking the user info card (Change 2). Opens as a popover/floating menu **above** the card (direction: upward).

### Popover layout
```
┌──────────────────────────┐
│  👤  Admin User          │
│      admin@javax.io      │
│      Administrator       │
├──────────────────────────┤
│  ⚙️  Settings            │
│  👤  Profile             │
│  🌙  Dark / Light Mode   │
├──────────────────────────┤
│  🚪  Log Out             │
└──────────────────────────┘
```

### Behaviour
- Opens on click, closes on outside click or `Escape`
- Popover anchors to the top-left edge of the user info card, opens upward
- Each row is a clickable link/button routing to the respective page
- Log Out is styled in a muted red to differentiate it as a destructive action

### Implementation notes
- Use a floating UI library (e.g. Floating UI / Popper.js) or a simple absolute-positioned div with `bottom: 100%`
- Trap focus inside the popover for accessibility (keyboard navigation)
- Add `role="menu"` and `aria-haspopup="true"` attributes

---

## Change 4 — Collapsible Left Navbar

### Collapsed state
- Sidebar width: `56px` (icon-only)
- Show only icons for each nav item, no labels
- User info card collapses to avatar only
- Logo area collapses to icon mark only

### Expanded state
- Sidebar width: `200px` (current state)
- Show icons + labels
- Full user info card

### Toggle button
- A small `‹` / `›` arrow button pinned to the **right edge of the sidebar**, vertically centred
- On hover: subtle highlight
- On click: toggles collapsed/expanded state
- The toggle button remains visible in both states

### Behaviour details
- Smooth CSS transition: `width: 200ms ease`
- Main content area adjusts with `margin-left` or flex to fill the freed space
- Collapsed state: nav item labels hidden with `opacity: 0` + `width: 0` (not `display: none` — preserve layout during animation)
- Tooltips on hover in collapsed state showing the nav item label
- Save the collapsed/expanded preference to `localStorage` so it persists across sessions

### Implementation notes
```css
.sidebar {
  width: var(--sidebar-width, 200px);
  transition: width 200ms ease;
}

.sidebar.collapsed {
  --sidebar-width: 56px;
}

.nav-label {
  transition: opacity 150ms ease;
}

.sidebar.collapsed .nav-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}
```

---

## Change 5 — Bottom Input Panel (ChatGPT-Style)

### Remove
- The existing two-card layout (Upload Dataset card + Analysis Prompt card side by side)
- The standalone `Execute Analysis` button in the centre of the page
- The existing grey placeholder box below the button

### Add: Floating Bottom Input Bar
Pinned to the bottom of the main content area (not the full viewport — constrained within the main panel).

### Input bar layout
```
┌────────────────────────────────────────────────────────────────────────┐
│  [📎 Upload]   [ Describe what you want to analyse...                ] [⚡ Execute] │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed component breakdown

#### 📎 Upload button (left)
- Icon-button: paperclip or upload icon
- On click: opens native file picker (CSV, XLSX, JSON)
- Also supports drag-and-drop onto the input bar itself
- After a file is selected: show a file chip/pill inside the bar
  ```
  [📄 sales_data.csv  ×]   [ Describe what you want...  ]   [⚡ Execute]
  ```
- The `×` on the chip removes the selected file

#### Prompt textarea (centre)
- Placeholder: `e.g., 'Identify top 5 regions by revenue growth...'`
- Auto-expands vertically as the user types (up to ~4 lines max, then scrolls)
- `Enter` = new line, `Ctrl/Cmd + Enter` = Execute
- Single-line by default, expands on focus/typing

#### ⚡ Execute button (right)
- Disabled state (greyed out) when: no file uploaded OR prompt is empty
- Active/enabled when both are provided
- On click: triggers analysis, button shows loading spinner, label changes to "Analysing..."
- Same terracotta/burnt-orange colour as current button

### Input bar container styles
```css
.input-bar-wrapper {
  position: sticky;
  bottom: 24px;
  margin: 0 auto;
  max-width: 860px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
```

### Before any file is uploaded
- Main content area above the input bar shows:
  - App name/tagline or welcome message centred
  - Optional: recent analyses list (from History)
  - The two-card layout is **gone** — replaced by this minimal welcome state

---

## Change 6 — Post-Upload Two-Column Layout

### Trigger
After the user clicks **Execute Analysis** and the analysis completes, the main content area transitions to a two-column layout.

### Column layout
```
┌──────────────────────────────────┬───────────────────────────┐
│                                  │                           │
│   RESULTS COLUMN (60%)           │   CHAT COLUMN (40%)       │
│                                  │                           │
│   · Generated charts             │   · Conversation thread   │
│   · Summary insights             │   · Follow-up prompts     │
│   · Tabs: Summary/Charts/Data    │   · Context-aware AI      │
│                                  │                           │
└──────────────────────────────────┴───────────────────────────┘
                    [Bottom input bar — full width]
```

### Results Column (left, 60%)

#### Contents
1. **Analysis summary card** — key metrics pulled from the dataset (e.g. row count, date range, detected columns)
2. **Generated charts** — rendered visualisations from the AI analysis
3. **Tab bar** at the top of the column:
   - `Summary` — text insights, bullet points
   - `Charts` — all visualisations
   - `Raw Data` — table view of the uploaded dataset (paginated)

#### Scroll behaviour
- This column scrolls independently
- New results append to the bottom as the AI streams output
- Smooth scroll-to-bottom on new content

### Chat Column (right, 40%)

#### Contents
- **Header**: "Chat about this dataset" with a small AI/sparkle icon
- **Message thread**: scrollable list of AI + user messages
- **First message** (auto-populated on analysis complete):
  > "I've analysed your dataset. Here's a summary of what I found…"
- **Input area** at the bottom of the chat column: text field + send button (separate from the main bottom input bar)

#### Chat input (inside chat column)
```
┌─────────────────────────────────────┐
│  [ Ask a follow-up question...  ][→]│
└─────────────────────────────────────┘
```

#### Chat column border
- Subtle left border: `1px solid var(--border-color)` to visually separate from results
- Or a light background differentiation: `background: rgba(0,0,0,0.02)`

### Layout transition
- When analysis completes: animate the main area from single-column to two-column
  ```css
  .main-content {
    display: grid;
    grid-template-columns: 1fr;
    transition: grid-template-columns 300ms ease;
  }

  .main-content.results-active {
    grid-template-columns: 60fr 40fr;
  }
  ```
- The bottom input bar remains full-width across both columns
- Subsequent analyses (user runs another prompt): new results append to the results column, chat continues in the chat column

### Resizable columns (optional enhancement)
- Add a drag handle between the two columns (`cursor: col-resize`)
- Min width per column: 320px
- Save split ratio to `localStorage`

---

## State Summary

| App State | Layout |
|-----------|--------|
| Initial / No file | Centred welcome + bottom input bar |
| File selected, no analysis yet | File chip in input bar, prompt area ready |
| Analysis running | Loading state in results area, bottom bar shows "Analysing..." |
| Analysis complete | Two-column: Results (left) + Chat (right) + bottom bar (full width) |
| Subsequent analysis | Results column updates, chat column continues conversation |

---

## Component Checklist for Antigravity

- [ ] Remove top-bar header component
- [ ] Add `UserInfoCard` component to sidebar bottom
- [ ] Build `UserPopover` component (Settings, Profile, Logout)
- [ ] Move bell icon + notification logic into `UserInfoCard`
- [ ] Add sidebar collapse toggle button + animation
- [ ] Save sidebar state to `localStorage`
- [ ] Build `BottomInputBar` component (upload, prompt, execute)
- [ ] Implement file chip/pill with remove action
- [ ] Disable Execute button until file + prompt both present
- [ ] Remove old upload card + prompt card + execute button from page
- [ ] Build `ResultsColumn` component with tabs (Summary / Charts / Raw Data)
- [ ] Build `ChatColumn` component with message thread + inline input
- [ ] Implement two-column grid transition on analysis complete
- [ ] Wire chat column first message to analysis output
- [ ] Ensure bottom input bar stays full-width across both columns
- [ ] Test collapsed sidebar + two-column layout at various viewport widths
- [ ] Accessibility pass: focus trapping in popover, keyboard nav, ARIA labels

---

## Design Tokens to Maintain

| Token | Value |
|-------|-------|
| Primary action colour | Terracotta / `#C1563A` (Execute button) |
| Background | Off-white / `#F5F0EA` |
| Card background | White / `#FFFFFF` |
| Sidebar background | White / `#FFFFFF` |
| Border colour | `#E5E0D8` |
| Active nav item | Soft grey pill `#F0EBE3` with left accent border |
| Font | Current (keep as-is) |

---

*Spec version 1.0 — based on JavaX dashboard screenshot, April 2026*
*Prepared for handoff to Antigravity*