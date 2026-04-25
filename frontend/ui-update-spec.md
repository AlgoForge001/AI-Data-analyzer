# AI Analyzer — UI Update Spec
> Layout & Navigation Improvements based on design review

---

## 1. Sidebar Navigation Updates

### Current State
| Item | Status |
|------|--------|
| App Name (logo area) | ✅ Present |
| + New Analysis | ✅ Present |
| Recent Executions | ✅ Present (label only, no history yet) |
| Settings | ✅ Present (bottom) |

### Additions Needed

#### Add a **Search** tab
- Position: Below `+ New Analysis`, above `RECENT EXECUTIONS`
- Style: Same weight as other nav items
- Behaviour: Opens a search overlay / filters recent executions by keyword
- Icon: magnifying glass (consistent with top search bar — consider removing the top bar and consolidating here)

#### Add an **Analytics** tab
- Position: Below Search
- Style: Section header or nav item (match "RECENT EXECUTIONS" label style)
- Behaviour: Routes to an analytics/stats overview page (dataset count, analyses run, charts generated, etc.)

#### Rename / restructure "Recent Executions"
- Current label: `RECENT EXECUTIONS`
- Proposed label: `RECENTS` (shorter, cleaner)
- Add a **History** sub-item or link beneath it for full paginated history view
- Show last 5 runs inline; "View all →" link at the bottom of the list

#### Add a **User Details** section
- Position: Bottom of sidebar, above Settings
- Content: User name, plan badge (PRO), avatar thumbnail
- Clicking it expands a dropdown or routes to profile/account page

### Sidebar Structure (Final Order)
```
[Logo] AI Analyzer — PREMIUM

+ New Analysis

Search

Analytics

──────────────
RECENTS
  · [run 1]
  · [run 2]
  · View all →

──────────────  (spacer / push-to-bottom)

User Details
Settings
```

---

## 2. Main Dashboard Layout Updates

### Current State
- Single-column feel: file upload card (left) + prompt card (right) side by side
- Execute Analysis button centered below both cards
- No output area visible until after analysis runs

### Changes Needed

#### 2a. Introduce a **Results / Chat Panel** (right-side column)
- Appears **only after** Execute Analysis is clicked and analysis completes ✅ (keep this behaviour)
- When visible, split the main area into:
  - **Left (60%)** — existing upload + prompt + results/charts area
  - **Right (40%)** — Chat Feature panel (as shown in wireframe)
- The chat panel label: `Chat` or `Ask about this dataset`
- Include: message thread, text input, send button
- Highlighted with a subtle border (cyan `#00D4FF` or theme accent) to draw attention

#### 2b. Add a **Results Section** below Execute button
- Currently a grey placeholder box exists — activate it post-analysis
- Show: summary stats, generated charts, key insights
- Add tabs inside the results section: `Summary` | `Charts` | `Raw Data`

#### 2c. Top Bar refinements
- Move **Search** from standalone bar → integrate with sidebar Search tab (or keep top bar but remove redundancy)
- Keep: Notification bell, Settings gear, User Profile (top-right)
- Add: breadcrumb or page title ("Main Dashboard") below the top bar or as a section header

---

## 3. Tab / Page Additions

| Tab | Route Suggestion | Description |
|-----|-----------------|-------------|
| Main Dashboard | `/dashboard` | Current landing page — file upload + prompt + results |
| Analytics | `/analytics` | Usage stats, charts of past runs, dataset history |
| History | `/history` | Full paginated list of past analyses with filters |
| Search | `/search` (or modal) | Search across past datasets and analyses |
| User Details | `/profile` | Account info, plan, API key, preferences |
| Settings | `/settings` | Already present — keep at bottom |

---

## 4. Chat Feature Panel — Spec

> Appears as a right-side drawer/column after analysis completes.

### Layout
```
┌─────────────────────────────────┐
│  ✦ Chat about this dataset      │  ← header
├─────────────────────────────────┤
│                                 │
│   [AI message bubble]           │
│              [User message]     │
│   [AI message bubble]           │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [ Ask a question...    ] [→]   │  ← input + send
└─────────────────────────────────┘
```

### Behaviour
- Pre-populated with a summary message after analysis: _"I've analysed your dataset. Here's what I found…"_
- User can ask follow-up questions (e.g. "Show top 5 by revenue", "Create a bar chart")
- Responses appear as chat bubbles
- Panel can be collapsed via a `×` or `‹` toggle to reclaim space

---

## 5. Visual / Style Notes

| Element | Current | Recommended |
|---------|---------|-------------|
| Accent colour | Cyan `#00D4FF` | Keep — strong brand colour |
| Sidebar background | `#0D1117` | Keep |
| Card background | `#161B22` | Keep |
| Active sidebar item | Bold text only | Add left-border accent `3px solid #00D4FF` |
| "PRO ACCOUNT" badge | Magenta text | Keep — good contrast |
| Chat panel border | — | `1.5px solid #00D4FF` with subtle glow |
| Section separators in sidebar | — | Add `1px solid rgba(255,255,255,0.08)` divider lines |

---

## 6. Implementation Priority

| Priority | Item |
|----------|------|
| 🔴 High | Add Search + Analytics + History tabs to sidebar |
| 🔴 High | Add User Details section to sidebar bottom |
| 🟡 Medium | Chat panel (right column, post-analysis) |
| 🟡 Medium | Results section tabs: Summary / Charts / Raw Data |
| 🟢 Low | Active state styling for sidebar items |
| 🟢 Low | Breadcrumb / page title in main area |
| 🟢 Low | Consolidate top search bar with sidebar Search |

---

*Document version 1.0 — based on wireframe (Image 1) and working dashboard (Image 2)*
