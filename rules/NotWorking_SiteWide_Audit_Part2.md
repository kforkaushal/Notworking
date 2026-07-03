# NotWorking — Site-Wide Audit (Part 2)

Covers `groups.html`, `messages.html`, `notifications.html`, `profile.html`, read line-by-line, plus how they relate to the `feed.html` audit already delivered. Read this together with `NotWorking_Feed_Audit_And_Plan.md` — this document does not repeat feed.html's own items, it adds what's new and then gives one master plan for the whole site.

---

## 0. The One Thing to Fix Site-Wide First: Unescaped User Content in `innerHTML`

This is the same XSS pattern flagged in `feed.html`, and it is **everywhere** — confirmed in every single page reviewed:

| Page | Where |
|---|---|
| `groups.html` | Group `name` and `description` in group cards; member `name`/`username` in the members modal |
| `messages.html` | Chat message bubbles (`message.content`) — the most serious instance, since it's a private free-text field two users fully control; conversation list `full_name` / `last_message_content`; user-search results |
| `notifications.html` | Actor `full_name`, post content preview |
| `profile.html` | Same comment/search patterns as `feed.html`; skills/badges tags via `renderTags()` |

**This needs one fix, not five.** Write a single `escapeHtml()` (or a small `el(tag, text)` DOM-builder helper) in `shared/ui.js`, export it, and have every page import and use it for any interpolated user-generated string. Doing it once, centrally, is also how you avoid this regressing next time someone adds a feature.

---

## 1. The Other Big One: ~300 Lines of Logic Copy-Pasted Between Pages

`feed.html` and `profile.html` contain a **near-byte-for-byte duplicate** of:
- `createNotification()`
- `loadComments()`
- `handleCommentSubmit()`
- `handlePostAction()` (all 11 branches: three-dot menu, share menu, copy link, native share, about-post, follow/unfollow, save/unsave, delete, like, comment toggle, delete comment)
- the `inFlightLikes` guard

That's roughly 270–300 lines maintained in two places. This is exactly the kind of redundancy you asked about, and it's also a correctness risk: if you fix a bug in one copy (like the in-flight-like guard, which is already correctly present in both — good) but forget the other, the two pages silently drift apart. It already shows signs of this: `profile.html`'s delete-post handler additionally updates `#posts-count` (correct, since profile has that stat) while `feed.html`'s doesn't need to — that's a legitimate difference, but it also shows the copies aren't kept in perfect sync by design, which is fragile.

**Fix:** move all of the above into `shared/ui.js` as one exported `initPostInteractions({ container, currentUser, onDeleteExtra })` (or similar) that both pages call. `feed.html` and `profile.html` should each be responsible only for *fetching* the posts they show; the interaction logic (like/comment/follow/save/delete/share) should live in exactly one place.

---

## 2. `groups.html` — Specific Findings

- **XSS**: `group.name`, `group.description`, member `name` inserted raw into `innerHTML` (see §0).
- **Empty-name edge case**: `group.name.charCodeAt(0) % GRADIENTS.length` will produce `NaN` if `group.name` is ever an empty string (the form has `required`, but nothing stops an empty/whitespace-only name from reaching the DB via direct API access). Guard with `(group.name || '?').charCodeAt(0)`.
- **`.single()` vs `.maybeSingle()`**: not used incorrectly here, but worth checking if this pattern shows up in `Data/` helper files too — `.single()` throws when zero rows come back, which is usually not what you want for a "does this exist" check.
- Delete-group flow does client-side cascading deletes (`posts` then `groups`) — reasonable given "cascade may not cover app logic," but if the `posts` delete succeeds and the `groups` delete then fails, you're left with an orphaned group that lost all its posts. Low likelihood, but consider wrapping this in a Postgres function/transaction if data integrity here matters.

---

## 3. `messages.html` — Specific Findings

This page is actually in much better shape than the others for the things we flagged earlier — the WebRTC calling flow already implements busy-state, no-answer timeout, permission-denied handling, hang-up/cleanup, and mute/camera toggling. Good.

- **XSS in message bubbles** (§0) — highest-severity instance sitewide since it's free-text DMs.
- **Unhandled promise rejection on notification sound**: `notificationSound.play()` is wrapped in `try/catch`, but `.play()` returns a Promise — a synchronous `try/catch` does not catch an async rejection. If autoplay is blocked, this throws an unhandled promise rejection in the console on every attempt. Fix: `notificationSound.play().catch(() => {})`.
- **Redundant realtime subscriptions**: `globalMessagesChannel` and the per-conversation `messageSubscription` both listen for `INSERT` on `messages` with the same `receiver_id=eq.<uid>` filter — one updates the sidebar, the other renders the bubble. Functionally fine, but it's two live subscriptions doing overlapping work; consider having one listener update both the sidebar and, if it's the active conversation, the message list.
- **Dead UI**: the typing indicator (`#typing-indicator`) is fully built in markup/CSS but its JS is entirely commented out. It currently does nothing and never will until re-enabled. Either wire it up via a `broadcast` channel (the code comments describe exactly how) or delete the markup so it's not confusing to future you.
- **Mobile-specific**: the responsive show/hide between the conversation list and the active chat (`showChatWindow` / `showConvosList`) is implemented well and looks correct for mobile — this page's mobile handling is a good reference for the rest of the site.

---

## 4. `notifications.html` — Specific Findings

- **XSS**: actor `full_name` and truncated post-content preview inserted raw into `innerHTML` inside `getNotifMeta()` / `buildNotifEl()` (§0).
- Auto-marks all notifications read on page load, immediately after fetching for display — deliberate design (visiting the page clears the unread state), not a bug, just worth confirming it's the UX you want (some apps wait until the notification is actually scrolled into view or clicked instead of blanket-marking on load).
- Realtime new-notification handler re-fetches actor + post data per notification with two separate queries — fine at this scale, would be worth batching only if notification volume gets heavy.

---

## 5. `profile.html` — Specific Findings

- **XSS**: same comment/search pattern as `feed.html`, plus `renderTags()` inserting skill/badge strings raw (§0).
- **Avatar upload has no validation at all.** Unlike `feed.html`'s post-media upload (which has `validateFile()` checking MIME type and a 50MB cap), the avatar `<input type="file" id="avatar-file-input">` has **no `accept` attribute** and `uploadAvatarFile()` does zero client-side checks before pushing straight to Supabase Storage. Someone can "upload an avatar" that's a 2GB video file or an arbitrary file type. Apply the same `validateFile()` helper here (ideally the shared, de-duplicated version from §1).
- **`.single()` instead of `.maybeSingle()`** in `checkFollowStatus()` — when the viewer isn't already following the profile (the common case), `.single()` returns an error for zero rows. The code ignores the error and only checks `data`, so it still *works*, but it throws a console error on essentially every profile view of someone you don't follow. Switch to `.maybeSingle()`.
- **No pagination on a user's posts.** `fetchUserPosts()` fetches *all* of a user's posts in one query with no `range()`/limit, unlike the main feed's 5-per-page infinite scroll. For an active poster this becomes a large, slow, all-at-once payload — exactly the kind of thing that hurts on mobile networks. Recommend applying the same pagination pattern used in `feed.html`.
- **Full page reload after saving profile edits** (`window.location.reload()`) — works, but it's a heavier, slower way to reflect a save than just updating the DOM nodes you already have references to. Minor, but relevant to "make it more responsive."
- `localStorage.setItem('nw_username', ...)` is set here but never read anywhere in the five pages reviewed — either it's used by a page not yet shared with me, or it's dead code.

---

## 6. Site-Wide Patterns Worth Fixing Once, Everywhere

These apply across all five pages (confirmed present in at least 3 of 5):

1. **Tailwind via CDN** on every page — same production-performance issue noted for `feed.html`. Fix once by moving the whole site to a built/purged CSS bundle.
2. **No `loading="lazy"` on any avatar or post image**, sitewide.
3. **`parseInt(x)` without radix**, sitewide — standardize to `parseInt(x, 10)`.
4. **No load-failure fallback** if the Firebase/Supabase/`shared/ui.js` modules fail to fetch — every page just hangs with a spinner.
5. **Profile queries over-select** (`bio, experience, skills`) on pages that never display them (`groups.html`, `notifications.html`) — trim to what's actually used.
6. **Mobile bottom nav is duplicated markup on every page** (identical block, 5 copies). Not a bug, but a good candidate to move into a single JS-injected partial (or, if you're on a framework-free static setup, at minimum a `fetch()`-included HTML partial) so nav changes only need to happen once.

---

## 7. Updated Master Action Plan (All 5 Pages)

**Phase 1 — Security (do this before anything else, sitewide)**
1. Write one shared `escapeHtml()` helper in `shared/ui.js`; use it everywhere user-generated text is interpolated into `innerHTML` — comments, messages, search results, group name/description, notification text, profile skills/badges. This is the single highest-priority fix in the whole review.
2. Add the same file-type/size validation used for post media to the profile avatar upload.

**Phase 2 — De-duplication**
3. Extract the shared post-interaction logic (`handlePostAction`, `loadComments`, `handleCommentSubmit`, `createNotification`) out of `feed.html`/`profile.html` into `shared/ui.js`, imported by both.
4. Extract the mobile bottom nav into one reusable partial.
5. Fix the `feed.html`-specific redundancy items already listed in Part 1 (dead script tag, optimistic-update helper, trimmed profile query, split token-refresh logic).

**Phase 3 — Correctness / small bugs**
6. Switch `.single()` → `.maybeSingle()` wherever a "zero rows is a valid, expected outcome" check is being done (`profile.html`'s `checkFollowStatus`, and audit `Data/*.js` helpers for the same pattern).
7. Fix the notification-sound unhandled-promise-rejection in `messages.html` (`.play().catch(()=>{})`).
8. Guard `groups.html`'s gradient-index calculation against an empty group name.
9. Either wire up or remove the dead typing-indicator UI in `messages.html`.

**Phase 4 — Performance / mobile responsiveness**
10. Move off Tailwind CDN sitewide → built, purged CSS.
11. Add `loading="lazy"` to avatar/post images sitewide.
12. Add pagination to `profile.html`'s post list, matching the feed's pattern.
13. Add a load-failure fallback UI for module script imports, sitewide.
14. Revisit the tablet-breakpoint gap noted in the `feed.html` audit — check whether `groups.html`'s `md:grid-cols-2 lg:grid-cols-3` card grid (which already has a sensible tablet step) can be used as the reference pattern for the feed/profile layouts too.

**Phase 5 — Polish**
15. Standardize `parseInt(x, 10)` sitewide.
16. Add `alt` text to remaining images missing it.
17. Decide whether to wire up or remove: `groups.html`'s "Join" button state edge cases, `feed.html`'s placeholder "Trending" links, `profile.html`'s unused `nw_username` localStorage key.

---

## What I Still Haven't Seen

`style.css`, `shared/ui.js`, `Data/firebase-client.js`, `Data/supabase-client.js`, and the `Auth/*.html` pages (login/signup/setup) weren't included. `shared/ui.js` in particular matters a lot here since `createPostElement()` (used by both `feed.html` and `profile.html`) almost certainly renders post `content` and author names the same unescaped way as everything else — if so, that's the actual root of the XSS issue, in one place, which is good news for how much you have to touch to fix it. Worth sharing that file next if you want the full picture confirmed rather than inferred.
