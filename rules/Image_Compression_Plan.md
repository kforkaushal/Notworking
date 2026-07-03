# Image Compression Plan — NotWorking Post Uploads

## Goal
Shrink image uploads on the post-creation flow (`feed.html`) before they hit Supabase Storage, without introducing visible quality loss for normal feed viewing.

## Reality Check on the Original Ask
The original target was "1MB image → 25KB, WebP, zero quality loss." That's a **40x reduction (97.5% smaller)**, which isn't physically achievable without visible quality loss — compression and image fidelity are a direct trade-off, not a setting you can bypass.

What's actually shipped instead is the best achievable version of the goal:
- **WebP** encoding (as requested) — typically 25–35% smaller than JPEG/PNG at equivalent visual quality on its own.
- **Resize** to a sane max dimension, since a phone photo's full resolution is far larger than anything the feed ever displays.
- Combined, this typically produces **70–90% smaller files** with no visible difference at normal viewing size — not 97.5%, but real, and without the artifacting a 40x squeeze would cause.

If a hard size ceiling is still required regardless of content (e.g., every image must be ≤25KB no matter what), that's supported as an opt-in stricter mode — see [Future: Hard Size Ceiling Mode](#future-hard-size-ceiling-mode).

## Where It Lives
All of this is implemented client-side in `feed.html`, inside the existing post-creation flow. No backend/Supabase changes were needed.

## How It Works

1. **User selects a file** (`file-input` change event fires).
2. **Existing validation runs first** (`validateFile()`) — MIME type allowlist, 50MB cap on the *original* file. This is unchanged from before.
3. **If it's an image** (and not a GIF — see [Exclusions](#exclusions)):
   - The image is decoded onto an off-screen `<canvas>`.
   - If either dimension exceeds `COMPRESS_MAX_DIMENSION` (1920px), it's scaled down, preserving aspect ratio.
   - The canvas is re-encoded via `canvas.toBlob()` as `image/webp` at `COMPRESS_QUALITY` (0.82).
   - The result replaces the file that will actually be uploaded (`selectedFile`), and the original filename's extension is swapped to `.webp`.
4. **The preview box shows real numbers**: e.g. `340 KB (was 2.1 MB, -84%)`. No estimated/fake savings are shown — it's the true post-compression size.
5. **The Post button is disabled during compression** so the old (or no) file can never be submitted mid-process.
6. **If it's a video**, it's uploaded unmodified — see [Video: Deliberately Out of Scope](#video-deliberately-out-of-scope).

## Configuration

All tunable in `feed.html`, near the top of the compression code:

| Constant | Default | Meaning |
|---|---|---|
| `COMPRESS_MAX_DIMENSION` | `1920` | Longest edge, in px, after resize |
| `COMPRESS_QUALITY` | `0.82` | WebP quality (0–1); sweet spot for "looks lossless" |
| `COMPRESS_MIN_QUALITY` | `0.5` | Floor used only if a hard `targetBytes` is requested (see below) |

## Safety Fallbacks

The function is designed to never make things worse or silently break uploads:

- **GIFs are skipped entirely** — re-encoding through canvas strips animation, so GIFs upload as-is.
- **Unsupported WebP encoding**: if a browser's `canvas.toBlob()` can't produce WebP, the original file is uploaded instead.
- **Compression regression guard**: if the "compressed" WebP somehow comes out *larger* than the original (can happen with already-tiny or very simple images), the original is used instead.
- **Decode failure**: if the image can't be loaded/decoded for any reason, the original file is uploaded and the error is logged to the console — the user's post is never blocked by a compression bug.

## Exclusions

| File type | Behavior | Why |
|---|---|---|
| GIF | Uploaded unmodified | Canvas re-encoding destroys animation |
| Video (mp4/webm/ogg) | Uploaded unmodified | See below |
| Any file that fails existing `validateFile()` checks | Rejected before compression is attempted | Unchanged from prior behavior |

## Video: Deliberately Out of Scope

Client-side video compression was considered and deliberately **not** implemented in this pass:

- Browsers have no simple, fast, native API for video transcoding/downscaling.
- The realistic option is a WASM build of ffmpeg (`ffmpeg.wasm`), which is a **~25MB+ download** and noticeably slow, especially on phones — a poor trade for a feature meant to make posting *lighter*, not heavier.
- A half-measure using `MediaRecorder` to re-capture a downscaled canvas stream is unreliable across browsers (audio sync issues, inconsistent codec support) and not worth shipping.

**Recommendation:** if video size becomes a real problem, handle it server-side (a Supabase Edge Function or a queued job that transcodes after upload) rather than blocking the browser during posting. Flagging this as a separate follow-up item, not a rejected idea.

## Future: Hard Size Ceiling Mode

The `compressImageToWebP()` function already accepts an optional `targetBytes` parameter for a stricter mode, not currently wired into the UI:

```js
// Example: force every image under 25KB, accepting quality loss to get there
await compressImageToWebP(file, { targetBytes: 25 * 1024 });
```

When set, it steps quality down in increments of 0.1 (down to `COMPRESS_MIN_QUALITY`) until the file fits under the target or the quality floor is hit — whichever comes first. **This will produce visible artifacts on detailed/busy photos** once it's forced that low; it's built but intentionally not turned on by default, since it contradicts "zero quality loss." Enable it only if a hard ceiling is a harder requirement than visual quality.

## Known Follow-Up (Not Yet Done)

- `profile.html`'s avatar upload currently has **no compression and no validation at all** (flagged separately in the site audit). The same `compressImageToWebP()` helper should be reused there once it's moved into `shared/ui.js` alongside the other de-duplication work already planned.
- HEIC (iPhone default photo format in some settings) is not explicitly handled — most browsers can't decode HEIC via `<img>`/canvas, so those files will silently fall back to uploading the original, unconverted. Worth testing on an actual iPhone upload if that format is common for your users.
