# NotWorking — `feed.html` Audit & Improvement Plan

Scope: full line-by-line review of the uploaded `feed.html` (1,706 lines — markup + inline module script). `style.css`, `shared/ui.js`, `Data/firebase-client.js`, and `Data/supabase-client.js` were referenced but not uploaded, so a few items below are flagged as "verify in style.css" rather than confirmed.

---

## 1. Critical Issues (fix first)

### 1.1 XSS vulnerability — unescaped user content in `innerHTML`
Several places inject user-controlled text directly into `innerHTML` with no escaping:

- Comment rendering: `c.content`, `c.profiles.username` in `loadComments()`
- Search results: `user.full_name`, `user.username` in `performSearch()`

Anyone can set their display name, username, or a comment to something like `<img src=x onerror=alert(1)>` and it will execute in every other user's browser who views that comment or search result. On a public feed this is a real, exploitable stored-XSS bug, not theoretical.

**Fix:** write one small `escapeHtml(str)` helper and run every piece of user-generated text through it before interpolating into a template string, or build these nodes with `textContent` instead of `innerHTML` for the dynamic parts. This needs to be checked in `shared/ui.js`'s `createPostElement` too, since post content/author fields likely have the same issue.

### 1.2 Duplicate `id="logout-btn"` breaks mobile logout
`desktop-quick-nav`'s HTML (which contains `<a id="logout-btn">`) gets copied verbatim into `#mobile-quick-nav` via `innerHTML =`. That leaves **two elements with the same id** in the DOM — invalid HTML, and `document.getElementById('logout-btn')` (used later to attach the click handler) only ever returns the first (desktop) one. Result: **the logout link inside the mobile hamburger sidebar does nothing.**

**Fix:** don't clone by id. Either give the mobile copy of the nav a different id scheme (e.g., strip/reassign ids after cloning), or delegate the logout click at the container level instead of binding to one specific id.

### 1.3 Notification-sound listener re-added on every token refresh
Inside `onIdTokenChanged`, this runs every time it fires (not just first login — Firebase silently refreshes ID tokens roughly hourly):

```js
document.addEventListener('click', playSound, { once: true });
```

Each refresh adds a *new* one-time listener. After a few hours of an open tab, the next click can fire the notification sound multiple times at once. It also means a totally unrelated click (e.g., liking a post) can trigger an audible "ding" with no real notification behind it, which is confusing UX on its own.

**Fix:** register this listener exactly once (e.g., guard with a module-level `soundUnlocked` flag, or move it outside `onIdTokenChanged` entirely into a run-once init block).

### 1.4 `onIdTokenChanged` re-runs full page init on every silent refresh
The whole callback — profile fetch, all the `updateEl(...)` DOM writes, unread-count query, channel re-subscribes — re-executes on every token refresh, not just on login. Channels are cleaned up properly before re-subscribing (good), but the profile re-fetch and DOM rewrites are pure waste and can cause a visible flicker on long-lived tabs.

**Fix:** split "run once per session" (profile fetch, initial UI paint, onboarding check) from "run on every token refresh" (only `setSupabaseToken`).

---

## 2. Redundancy / Dead Code

| Item | Where | Action |
|---|---|---|
| Empty `<script>` with only a comment, no code | Just above the Firebase module script | Delete — literally does nothing |
| Near-identical optimistic-update pattern repeated 4x (like, follow, save, and their rollbacks) | `handlePostAction` | Extract a shared `optimisticToggle({ onOptimistic, apiCall, onRollback })` helper — cuts ~120 lines to ~30 and removes a class of copy-paste bugs |
| `profiles` query on login selects `bio, experience, skills` | `onIdTokenChanged` | None of these fields are used on this page — trim the `select()` to only `id, username, full_name, avatar_url` to cut payload size |
| 5 separate realtime channel subscriptions (posts, likes, comments, messages, notifications) | bottom of script | Not a bug, but every open tab holds 5 WebSocket subscriptions. Worth consolidating where Supabase allows multi-table filters on one channel, especially for mobile battery/data use |
| "Trending" hashtags and the "Join" button on Suggested Groups are non-functional placeholders (`href="#"`, no listener) | left/right sidebars | Either wire them up or mark clearly as "coming soon" so QA doesn't file it as a bug |

---

## 3. Production / Performance Issues (directly affect "responsiveness")

1. **Tailwind via CDN (`cdn.tailwindcss.com`)** — fine for prototyping, not for production. It ships the entire unpurged utility set to every visitor and compiles on the client on every page load, which is slower on mobile CPUs/networks specifically. Recommendation: move to the Tailwind CLI/build step and ship a purged, minified CSS file. This is the single highest-impact change for real mobile performance.
2. **No `loading="lazy"` on post/avatar images.** Every avatar and post image loads eagerly, competing with the initial page bundle. Add `loading="lazy"` to everything below the fold (all post/comment avatars, post media).
3. **No visible fallback if `Data/firebase-client.js`, `Data/supabase-client.js`, or `shared/ui.js` fail to load** (slow/offline mobile network). Currently the page would just sit there with a spinner forever. Add a timeout + "Couldn't load NotWorking. Check your connection and retry." message.
4. **Client-only file validation.** `validateFile()` checks type/size in the browser, which is good, but nothing stops a crafted request straight to the Supabase Storage API from bypassing it. Confirm Supabase Storage bucket policies also enforce max size / mime type server-side.

---

## 4. Mobile-Specific Responsiveness Checklist

I can't see the rendered layout or `style.css`, so treat these as things to verify, not confirmed bugs:

- [ ] Does `main` content have bottom padding (e.g. `pb-20`) so the last post/comment isn't hidden behind the fixed `mobile-bottom-nav`? Nothing in `feed.html` adds this spacing — it likely needs to live in `style.css` or be added here.
- [ ] The grid jumps straight from `grid-cols-1` (mobile) to `lg:grid-cols-4` (1024px+) with nothing in between. On tablets (768–1024px) you get the full single-column mobile layout, wasting the extra width. Consider a `md:` breakpoint that shows 2 columns (e.g., feed + one sidebar) before the full 3-column desktop layout kicks in.
- [ ] Confirm tap targets (three-dot menu, share icon, like icon) are ≥44×44px on mobile — Lucide icons at `w-5 h-5`/`w-6 h-6` with small padding can be borderline on small screens.
- [ ] Confirm the post-creation `<textarea rows="3">` doesn't force awkward scrolling on small screens — consider auto-grow on input.
- [ ] Confirm the `toast-container` (`fixed bottom-20 right-4`) doesn't overlap the bottom nav on very small screens (verify the `20` bottom offset matches the actual nav height in `style.css`).
- [ ] Confirm the mobile sidebar drawer (`w-72`) doesn't exceed viewport width on very narrow devices (<320px, still exists in parts of the market).

To fully audit these I'd need `style.css` and ideally a screenshot or the live URL (`notworking-in.vercel.app`) — happy to pull that in if you share it.

---

## 5. Minor / Polish

- Several `<img>` tags (nav/profile avatars) have no `alt` attribute — accessibility + SEO.
- `parseInt(x)` calls throughout omit the radix (`parseInt(x, 10)`) — not currently a bug, but it's a common source of subtle base-8-parsing bugs and worth standardizing.
- Infinite-scroll gate only checks the **first** `.search-bar` in the DOM (`document.querySelector('.search-bar').value`), which is the desktop one. If a mobile user is searching via the mobile search bar, this check won't see their term correctly since it always reads the desktop input. Should check whichever search bar is currently visible/active.
- `guest-join-banner` / logged-out state hides "Post" box but the mobile bottom-nav "Profile" tab still links straight to `profile.html` with no guest gate — worth confirming `profile.html` handles a logged-out visit gracefully.

---

## 6. Prioritized Action Plan

**Phase 1 — Security & correctness (do this before anything else)**
1. Fix the XSS holes (escape all user-generated text before `innerHTML` insertion) — comments, search results, and check `createPostElement` in `shared/ui.js`.
2. Fix the duplicate `logout-btn` id so mobile logout actually works.
3. Fix the notification-sound listener leak (guard against re-registration on token refresh).

**Phase 2 — Redundancy cleanup**
4. Remove the dead empty `<script>` block.
5. Extract the shared optimistic-update helper for like/follow/save.
6. Trim the profile `select()` to only needed columns.
7. Split "run once" vs "run every token refresh" logic in `onIdTokenChanged`.

**Phase 3 — Performance / mobile responsiveness**
8. Move off the Tailwind CDN to a built, purged CSS file.
9. Add `loading="lazy"` to post/comment/avatar images.
10. Add a load-failure fallback UI for the module script imports.
11. Verify/fix bottom padding so content isn't hidden behind the mobile nav.
12. Add a tablet-width (`md:`) layout step instead of jumping straight from 1 to 4 columns.
13. Fix the search-bar check in the infinite-scroll observer to respect whichever input is active.

**Phase 4 — Polish**
14. Add `alt` text to avatar/profile images.
15. Wire up or clearly label the placeholder "Trending" and "Join Group" links.
16. Standardize `parseInt(x, 10)` throughout.

---

## Next Steps

This audit only covers `feed.html`. Since you mentioned other pages are "little bit similar," most of these same patterns (optimistic-update duplication, `innerHTML` XSS risk, Tailwind CDN, missing lazy-loading) are almost certainly repeated across them. Once you share `style.css` and the other HTML pages (or the live Vercel URL), I can extend this same audit to the whole site and give you one consolidated fix list instead of doing it page-by-page.
