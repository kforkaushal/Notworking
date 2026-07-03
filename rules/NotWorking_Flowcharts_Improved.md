# Feature-by-Feature Flowcharts (Corrected & Improved)

This document breaks down the NotWorking application into individual flowcharts for each feature and function.

Each section below has been reviewed for syntax issues and missing edge cases. A short "What changed" note follows every diagram.

---

## 1. Authentication & Session Flow

```mermaid
graph TD
    A[Start: User lands on App] --> B{Firebase Auth Cached?}
    B -- Yes --> C[Read token via getIdToken]
    B -- No --> D[Show Login / Signup options]

    C --> C1{Token valid / not expired?}
    C1 -- Yes --> E[Call setSupabaseToken]
    C1 -- No --> C2[Silently refresh token via Firebase]
    C2 --> E

    E --> F["Session Active: proceed to Page Guard"]

    D -->|Click login| G[Email/Password Auth]
    D -->|Click Google auth| H[Google Popup Auth]
    D -->|Click signup| S[Create Account Form]

    G --> I{Auth successful?}
    H --> I
    S --> I

    I -- Yes --> C
    I -- No --> J[Show Auth Error Alert]
    J --> D

    F --> L[User clicks Logout]
    L --> M[Clear Firebase session + clear Supabase token]
    M --> D
```

**What changed:**
- The hyphenated label `Session Active - Go to Page Guard` was wrapped in quotes so Mermaid doesn't misparse the dash as part of a link. Reworded for clarity.
- Added a token-expiry check (`C1`) with a silent-refresh branch — the original assumed a cached token is always valid.
- The auth-error path (`J`) previously dead-ended. It now loops back to the login screen instead of leaving the user stuck.
- Added a Signup branch (the node existed as a label but had no actual flow).
- Added a Logout flow, which was missing entirely.

---

## 2. Profile Builder & Real-time Username Validator

```mermaid
graph TD
    A[User types in Username input] --> A1[Cancel any pending debounce timer]
    A1 --> B{Length >= 3 chars?}
    B -- No --> C[Show error text + disable Continue button]
    B -- Yes --> D[Show checking spinner]

    D --> E[Start new 400ms debounce timer]
    E --> F[Query Supabase: profiles SELECT id WHERE username = input]

    F --> F1{Query succeeded?}
    F1 -- No --> F2[Show 'Check failed, retry' + disable Continue]
    F1 -- Yes --> G{Conflicting profile found?}

    G -- Yes --> H[Set: Username Taken, disable Continue]
    G -- No --> I[Set: Username Available, enable Continue]

    H --> J[Hide spinner, show cross icon]
    I --> K[Hide spinner, show check icon]
```

**What changed:**
- Added debounce cancellation (`A1`) on every keystroke — without it, rapid typing fires overlapping timers/queries that can resolve out of order and show a stale result.
- Added a network/query-failure branch (`F1`); the original assumed the Supabase call always succeeds.

---

## 3. Post Creation & Media Upload Flow

```mermaid
graph TD
    A[User writes content / selects file] --> B[Click 'Post to the Void']
    B --> B1{Content empty AND no file?}
    B1 -- Yes --> B2[Show 'Add text or media' warning, stop]
    B1 -- No --> C{Is file selected?}

    C -- No --> D[Insert row directly in Supabase 'posts' table]
    C -- Yes --> C1{File type/size valid?}
    C1 -- No --> C2[Show 'Unsupported file / too large' error, stop]
    C1 -- Yes --> E[Extract extension, generate random file path]

    E --> F[Upload file to Supabase Storage bucket 'media', show progress bar]
    F --> G{Upload success?}

    G -- Yes --> H[Get public storage URL]
    H --> I[Insert row in 'posts' table with media_url and media_type]

    G -- No --> J[Show file upload error toast, stop loading spinner]

    D --> K{Insert succeeded?}
    I --> K
    K -- Yes --> L[Refresh feed, close post input box]
    K -- No --> M[Show 'Post failed' error toast, keep draft]
```

**What changed:**
- Added a guard against submitting an empty post (`B1`) — the original let a blank/no-file post reach the database.
- Added client-side file validation (`C1`) before upload, avoiding wasted storage calls on oversized or unsupported files.
- Added an upload progress indicator note on the storage step.
- Added a failure branch on the `posts` table insert (`K`) — previously any DB error here was unhandled and would silently drop the post.

---

## 4. Post Liking with Optimistic Rollbacks

```mermaid
graph TD
    A[User clicks Heart icon] --> A0{Request already in-flight for this post?}
    A0 -- Yes --> A1[Ignore click]
    A0 -- No --> B{Is heart currently red?}

    B -- Yes --> C[Optimistic: remove red heart, decrement counter]
    C --> D[Run Supabase DELETE query]
    D --> E{Query succeeds?}
    E -- Yes --> F[Done: like removed]
    E -- No --> G[Rollback: add red heart, increment counter, show error toast]

    B -- No --> H[Optimistic: add red heart, increment counter]
    H --> I[Run Supabase INSERT query]
    I --> J{Query succeeds?}
    J -- Yes --> K{Liker is not the post author?}
    K -- Yes --> K1[Create activity notification for post author]
    K -- No --> K2[Skip notification]
    J -- No --> L[Rollback: remove red heart, decrement counter, show error toast]
```

**What changed:**
- Added an in-flight request guard (`A0`) to prevent rapid double-clicks from racing two optimistic updates against each other.
- Added a self-like check (`K`) so users don't get a notification for liking their own post.

---

## 5. WebSocket Real-time Voice and Video Call Flow

```mermaid
graph TD
    A[User clicks Call icon] --> A1{Camera/mic permission granted?}
    A1 -- No --> A2[Show 'Permission denied' error, stop]
    A1 -- Yes --> B[Get local camera & microphone stream]
    B --> C[Send 'call-user' invite payload over WebSocket]
    C --> D[Show Ringing screen on Host side]
    D --> D1[Start 30s no-answer timeout]

    E[Receiver receives call payload] --> E1{Receiver already in another call?}
    E1 -- Yes --> E2[Auto-send 'call-busy' payload]
    E1 -- No --> F[Play ringtone audio]
    F --> G[Show Incoming Call prompt: Accept / Decline]

    E2 --> H2[Host: show 'User is busy', close ringing screen]
    D1 -->|Timeout expires| H3[Send 'call-timeout' payload, close ringing screen]

    G -->|Declines| H[Send 'call-declined' payload]
    H --> I[Close screens on both sides, stop ringtone]

    G -->|Accepts| J[Send 'call-accepted' payload]
    J --> K[Get local stream, initiate PeerConnection handshake]

    K --> L[Exchange WebRTC SDP offers/answers and ICE candidates]
    L --> M[Establish peer connection]
    M --> N[Display voice & video stream, stop ringtone]

    N --> O[Either user clicks Hang Up]
    O --> P[Send 'call-ended' payload, close PeerConnection, release media stream]
```

**What changed:**
- Added a permission-check branch (`A1`) — the original assumed `getUserMedia` always succeeds.
- Added a "receiver busy" path (`E1`/`E2`) — without it, a second incoming call while already on one would just show a confusing double prompt.
- Added a no-answer timeout (`D1`) so the caller isn't stuck on the ringing screen forever if the receiver never responds.
- Added a hang-up / call-end flow (`O`/`P`) — the original diagram never closed the connection or released the camera/mic after a call.

---

## 6. Social Follower & Notification System

```mermaid
graph TD
    A[User clicks Follow/Unfollow] --> A1{Target user is self?}
    A1 -- Yes --> A2[Disable button, do nothing]
    A1 -- No --> B{Current state: Following?}

    B -- Yes --> C[Optimistic: switch button to 'Follow']
    C --> D[Call DELETE on 'followers' table]
    D --> D1{Query succeeded?}
    D1 -- Yes --> E[Re-fetch following/follower counts]
    D1 -- No --> D2[Rollback button to 'Unfollow', show error toast]

    B -- No --> F[Optimistic: switch button to 'Unfollow']
    F --> G[Call INSERT on 'followers' table]
    G --> G1{Query succeeded, no duplicate?}
    G1 -- Yes --> H[Insert notification row in 'notifications']
    H --> E
    G1 -- No --> G2[Rollback button to 'Follow', show error toast]

    I[Supabase Realtime Listener detects changes] --> J{user_id matches receiver?}
    J -- Yes --> K[Increment unread bell badge count, trigger slide toast notification]
    J -- No --> L[Ignore event]

    M[Component unmounts] --> N[Unsubscribe Realtime Listener]
```

**What changed:**
- Added a self-follow guard (`A1`) — nothing stopped a user from following themselves in the original.
- Added query-result checks (`D1`, `G1`) with rollback on failure — the original had no optimistic-rollback safety net here, unlike the liking flow, so a failed insert/delete would leave the UI out of sync with the database.
- Added a duplicate-follow guard via the unique-constraint check in `G1`.
- Added listener cleanup (`M`/`N`) on component unmount — without unsubscribing, the Realtime listener leaks and can fire duplicate notifications after remount.

---

## Summary of Cross-Cutting Gaps Found

| Area | Issue in original | Fix applied |
|---|---|---|
| Auth | No token refresh, no logout, dead-end on error | Added refresh, logout, retry loop |
| Profile builder | No debounce cancellation, no network-failure case | Added both |
| Post creation | No empty-post guard, no file validation, no insert-failure handling | Added all three |
| Liking | No double-click guard, notifies on self-like | Added guard + self-check |
| Calling | No permission check, no busy state, no timeout, no hang-up | Added all four |
| Follow system | No self-follow guard, no rollback on failure, no listener cleanup | Added all three |
