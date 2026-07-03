# Mobile & Device Responsive Redesign

## Goal Description

Transform the **Notworking** social app UI to be fully responsive across all devices (mobile phones, tablets, laptops, desktops) while preserving the premium aesthetic, dynamic interactions, and existing functionality (feed, profile, saved posts, groups, notifications, authentication flows). The redesign will ensure touch‑friendly controls, fluid layouts, appropriate typography, and a cohesive visual system that adapts gracefully to any viewport size.

---

## User Review Required

> [!IMPORTANT]
> Please review the following decisions and provide any preferences or constraints before we start implementation.
>
> 1. **CSS framework** – The project currently uses Tailwind CSS via CDN. Do you want to keep Tailwind, switch to a custom vanilla‑CSS design system, or adopt a hybrid approach?
> 2. **Navigation pattern** – For small screens we propose a collapsible hamburger menu (mobile drawer) that reveals the sidebar links. Confirm if this is acceptable or if you have a different navigation style in mind.
> 3. **Dark mode** – Should we add a dark‑mode toggle (auto‑detect based on OS) as part of the redesign?
> 4. **Breakpoints** – Tailwind default breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) are typically sufficient. Do you need any custom breakpoints?
> 5. **Font & Brand Colors** – The current design uses a custom palette. Confirm if we should keep the existing colors or explore a new harmonious palette.
>
> Answer the questions or provide any additional UI/UX preferences.

---

## Open Questions

- Do you require support for landscape orientation on tablets and phones?
- Are there any specific animations or micro‑interactions (e.g., button hover, heart pulse) you want to keep or enhance?
- Should the "Create Post" modal become a full‑screen sheet on mobile?
- Any constraints on page load size (e.g., limit extra CSS/JS payload)?

---

## Proposed Changes

### 1. Global Layout & Meta
- **[MODIFY] `index.html`** – Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- **[MODIFY] `shared/ui.js`** – Ensure `createPostElement` uses responsive utility classes (`w-full`, `max-w-md`, `mx-auto`).
- **[NEW] `src/css/responsive.css`** – Central stylesheet containing custom media queries, CSS variables for spacing, font‑sizes, and a mobile drawer implementation.

### 2. Navigation & Sidebar
- **[MODIFY] `index.html` / `feed.html` / other pages** – Replace static sidebar with a mobile‑first navigation bar that collapses into a hamburger icon on `<sm`.
- Add **drawer component** (`src/components/Drawer.js`) that slides from the left on mobile, contains profile links, group list, and settings.
- Update all pages to include the drawer markup and initialize it via a small JS module (`src/js/drawer.js`).

### 3. Post Cards (Feed, Profile, Saved)
- Refactor post card HTML in `shared/ui.js` to use Tailwind utility classes that are responsive (`flex-col sm:flex-row`, `gap-4`, `p-4 sm:p-6`).
- Ensure media (images/video) respects container width with `max-w-full h-auto` and uses `object-fit: cover`.
- Increase touch target size for like/comment/save buttons (`min-width: 44px; min-height: 44px`).
- Add responsive typography: `text-sm` on mobile, `text-base` on larger screens.

### 4. Forms & Inputs
- Adjust the comment input, post creation textarea, and search bar to be full‑width on mobile (`w-full`) and centered on desktop (`max-w-lg mx-auto`).
- Add `autocomplete` and proper `label` elements for accessibility.

### 5. Images & Icons
- Replace fixed‑size icons with Tailwind's `w-5 h-5` that scale via `sm:w-6 sm:h-6`.
- Use `srcset` for avatar images to serve appropriate resolutions.

### 6. Dark Mode (optional)
- Add CSS variables for colors in `:root` and `[data-theme="dark"]`.
- Provide a toggle button in the header that sets `document.documentElement.dataset.theme`.

### 7. Testing & QA
- **Automated** – Add a simple Cypress test suite to verify layout at breakpoints (`320px`, `768px`, `1024px`).
- **Manual** – Checklist for visual inspection on iOS, Android, and desktop browsers.

---

## Verification Plan

### Automated Tests
- Run `npm run cypress:run` (or equivalent) to capture screenshots of key pages at each breakpoint and compare against baseline.
- Ensure no console errors appear when resizing.

### Manual Verification
- Open the app on a mobile device (or emulator) and verify:
  1. Navigation drawer opens/closes smoothly.
  2. Post cards fill the width without horizontal scroll.
  3. Buttons are tappable (≥44 px).
  4. Heart icon retains red state after navigation.
  5. Dark mode toggles correctly (if enabled).

---

**Next Steps**
- Await your answers to the *User Review Required* questions.
- After approval, we will begin implementing the CSS, component updates, and responsive navigation.
