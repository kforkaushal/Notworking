# AI IDE Error Resolution Protocol

## Objective
Your primary objective is to solve every error systematically instead of applying random fixes. Never guess. Every solution must be based on evidence collected from the project.

---

# Core Rules

1. Never stop after the first failed attempt.
2. Never modify unrelated files.
3. Never remove features just to eliminate an error.
4. Never replace working logic unless absolutely necessary.
5. Every fix must preserve existing functionality.
6. Think before changing code.
7. Always identify the real root cause before implementing a solution.

---

# Error Solving Workflow

## Step 1 — Read the Error Completely

Before writing any code:

- Read the entire error message.
- Read the stack trace.
- Identify
  - File
  - Line Number
  - Function
  - Package
  - Error Type

Do NOT ignore warning messages that may explain the actual issue.

---

## Step 2 — Find the Root Cause

Ask:

- Why did this happen?
- Which component produced this error?
- Is this caused by
  - Syntax?
  - Import?
  - Dependency?
  - Configuration?
  - Environment?
  - Runtime?
  - API?
  - Database?
  - Async?
  - Logic?

Never assume.

---

## Step 3 — Inspect Related Code

Before editing:

Read

- current file
- imported modules
- parent component
- child component
- configuration files
- environment variables
- package.json
- build configuration

Understand the complete execution flow.

---

## Step 4 — Generate Multiple Possible Causes

Produce at least 3 possible causes.

Example:

Cause 1
Missing environment variable

Cause 2
Incorrect import path

Cause 3
Package version mismatch

Then determine which one is actually responsible.

---

## Step 5 — Verify Before Fixing

Never immediately edit code.

Instead verify:

- file exists
- export exists
- variable exists
- API exists
- database schema
- route
- package version
- tsconfig
- vite.config
- webpack config
- Next.js config
- aliases
- environment

Only after verification implement changes.

---

## Step 6 — Implement Minimal Fix

Only change the code responsible.

Avoid:

❌ Refactoring entire files

❌ Rewriting components

❌ Massive formatting

❌ Renaming unrelated variables

Keep diffs as small as possible.

---

## Step 7 — Validate

After fixing

Check

- compilation
- lint
- type checking
- runtime
- browser console
- terminal output
- API response
- database query
- UI functionality

Confirm the original issue is gone.

---

## Step 8 — Regression Testing

Ensure the fix did NOT break

- existing features
- routes
- authentication
- API
- UI
- state
- database
- responsiveness

---

# If Error Persists

Do NOT repeat the same fix.

Instead

1. Re-read error
2. Collect new evidence
3. Compare previous attempt
4. Form new hypothesis
5. Try another verified solution

Never loop the same incorrect solution.

---

# Debugging Priority

Always investigate in this order:

1. Syntax Errors
2. Import Errors
3. Missing Dependencies
4. Type Errors
5. Configuration Errors
6. Environment Variables
7. Runtime Exceptions
8. API Failures
9. Database Errors
10. Business Logic Errors
11. Performance Issues

---

# Logging Strategy

If the issue is unclear:

Add temporary logging.

Examples:

- console.log
- console.table
- console.error
- debugger
- network inspection

Remove debugging logs after resolving the issue.

---

# Large Project Strategy

For large projects:

- Understand project architecture first.
- Search for existing implementations.
- Reuse existing utilities.
- Follow existing coding style.
- Do not introduce duplicate logic.

---

# Dependency Rules

Before installing a package:

Check

- Does the project already have it?
- Is there an existing alternative?
- Is it compatible with current versions?

Never install unnecessary packages.

---

# Git Safety

Before major changes:

Mentally identify:

- files to modify
- expected outcome
- rollback strategy

Keep changes atomic.

---

# Performance Rules

Never solve an error by introducing:

- unnecessary re-renders
- duplicated API calls
- memory leaks
- infinite loops
- blocking operations

---

# Security Rules

Never expose

- API keys
- secrets
- tokens
- passwords
- private credentials

Never disable authentication or validation simply to bypass an error.

---

# Communication Format

For every error provide:

## Error Summary

Short explanation.

---

## Root Cause

Explain why it happened.

---

## Evidence

Mention exactly what proved the diagnosis.

---

## Fix Plan

Describe the intended fix before implementation.

---

## Changes Made

List every modified file.

---

## Validation

Explain how the fix was verified.

---

## Remaining Risks

Mention any possible edge cases.

---

# Quality Checklist

Before finishing verify:

- Error resolved
- Project builds successfully
- No new warnings introduced
- No unrelated code changed
- Existing functionality preserved
- Code remains clean and maintainable
- Minimal diff achieved
- Security maintained
- Performance unaffected

---

# Golden Rule

> Never guess.
> Never patch blindly.
> Investigate → Verify → Fix → Validate → Test.
>
> Every code change must be intentional, evidence-based, minimal, and fully verified.