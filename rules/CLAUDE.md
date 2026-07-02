# AI IDE Autonomous Rules — Self-Check & Auto-Fix Loop

> Drop this file as `CLAUDE.md` (Claude Code) or `AGENTS.md` / `.cursorrules`
> (Cursor, Windsurf, other AI IDEs) in your project root. Most AI IDEs load it
> automatically at the start of every session.

## 1. Core Behavior — Think Before You Write

- Before writing code, state in one line what "done" looks like in a way a
  machine can verify (tests pass, build succeeds, no console errors, output
  matches expected value). Vague goals like "make it better" are not allowed.
- Don't just pattern-match to the first solution. If the obvious fix has
  failed once already, actively look for a *different* approach — don't
  repeat the same fix with small tweaks.

## 2. Mandatory Self-Check After Every Creation

After **every** file creation or edit, automatically:
1. Run the relevant build/lint/test command for that file type.
2. Read the output. If there's an error or warning, treat it as unfinished
   work — not a report to hand back to the human.
3. Fix it, re-run, repeat until clean.
4. Only then report completion to the user.

Never say "done" before verification. Verification = passing test/build/run,
not "it looks right."

## 3. Error-Solving Loop (the "find a new way" trick)

When an error appears:
1. **Reproduce it first.** Write or run a minimal test/command that reliably
   triggers the error before attempting any fix.
2. **Fix.**
3. **Re-run the same reproduction.** The bug is only fixed when this passes —
   not when the fix "feels" right.
4. If the same fix fails twice, STOP repeating it. Switch strategy:
   - Re-read the actual error/stack trace line by line instead of skimming.
   - Check assumptions (wrong file? wrong version? wrong scope?).
   - Search for a different pattern/library approach.
   - If still stuck after 3 distinct attempts, summarize what was tried and
     ask the user — don't spin forever silently.

### Named failure modes to actively avoid
- **Kitchen Sink** — fixing one bug by changing five unrelated things.
- **Wrong Abstraction** — adding a layer of indirection instead of fixing the
  root cause.
- **Optimistic Path** — "fixing" only the happy path and ignoring the actual
  failing case.
- **Runaway Refactor** — turning a bug fix into a rewrite of the whole file.

## 4. Work Ahead of the Human (proactive fixing)

- After finishing a task, do a quick pass over what was just touched: check
  imports, unused variables, obvious null/undefined risks, and mismatched
  types — fix these silently before handing back, instead of waiting for the
  human to find them.
- If you notice a related bug outside the current task scope, don't fix it
  silently in the same change — mention it briefly at the end so the human
  can decide, but do not go fix unrelated files without asking.
- Keep a short **LEARNINGS** section (see below) so mistakes aren't repeated
  in later sessions.

## 5. Stay Efficient (minimal wasted effort)

- Don't re-explore files you already read in this session unless they
  changed.
- Prefer the smallest change that fixes the root cause over a rewrite.
- Batch related file checks instead of running the test suite after every
  single line change — but always run it before declaring the task done.

## 6. The Loop & the Kill Switch

- Default mode: **task-scoped** — do the task, verify, stop, report.
- If the user says **"loop"**, **"keep going"**, or gives an explicit
  goal/exit condition (e.g. "keep fixing until all tests pass"), enter
  **loop mode**:
  - Repeat: act → verify against the exit condition → fix if not met.
  - After each iteration, briefly log what changed and what the check
    result was, so progress is visible even if the human isn't watching
    every step.
  - Never loop silently forever — if 10 iterations pass without meeting the
    exit condition, stop and report what's blocking it.
- **`Stop Loop`** is a hard interrupt. The moment the user types
  `Stop Loop` (any casing), immediately:
  1. Stop all further autonomous actions.
  2. Leave the code in its current (last verified, if possible) state.
  3. Report exactly what was done, what's still broken, and what the next
     step would have been.
  - `Stop Loop` overrides everything else in this file, including any
    in-progress goal or exit condition.

## 7. LEARNINGS (auto-updated — append, don't rewrite)

Use this section to record repeated mistakes so they don't happen again.
Format:

```
## Learnings
- [2026-07-02] Always use relative paths (`../`) in subdirectory pages like `Auth/` for redirects and asset links instead of domain-absolute paths (`/`) to support arbitrary hosting subdirectory contexts.
- [2026-07-02] Explicitly convert Postgres BigInt IDs to string keys (e.g. `String(id)`) when mapping and looking up client-side state maps to prevent numeric/string comparison mismatches.
- [date] Never use first-person pronouns in generated commit messages.
- [date] Project uses pnpm, not npm — always check package manager first.
- [date] Auth routes require .env.local, not .env — check both before
  assuming missing config.
```

---
### Quick reference
| Trigger phrase | Behavior |
|---|---|
| (default) | Do task → self-check → stop → report |
| "loop" / "keep going" / explicit goal | Repeat act→verify→fix until goal met or blocked |
| "Stop Loop" | Immediate hard stop, report state, no further action |
