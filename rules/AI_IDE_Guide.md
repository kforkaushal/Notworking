# NotWorking Project: AI IDE Development Guide & Audit Report

**Target Audience:** AI IDE / Automated Code Refactoring Tools
**Project Scope:** Firebase/Supabase integrated Vanilla JS Social Network
**Objective:** Transform the current codebase into a massive, error-free, professional, and powerful application.

## 1. Executive Summary & Current State

The "NotWorking" application is a satire-themed social network for the unemployed, built with vanilla HTML/CSS/JavaScript, Tailwind CSS via CDN, and a dual-database architecture (Firebase for Auth/Firestore, Supabase for database, realtime, and storage).

While the application has a strong foundation and unique branding, the current codebase suffers from several critical issues that prevent it from running smoothly in production. The most significant problems involve incorrect relative file paths, broken authentication flows (specifically password resets), and malformed database schema scripts. Furthermore, the application lacks modern architectural patterns, relying on heavy inline scripting within HTML files.

## 2. Critical Errors & Immediate Fixes (The "Must-Fix" List)

These are the bugs currently breaking the application. The AI IDE must address these first to restore basic functionality.

### 2.1. Broken Relative Import Paths (Profile Page)
**File:** `profile.html` (Lines 186-187)
**Issue:** The profile page imports shared modules using `../Data/firebase-client.js`. Since `profile.html` resides in the root directory, this path resolves outside the site root, causing a 404 error and completely breaking the profile page.
**Fix:** Change imports to `./Data/firebase-client.js` and `./Data/supabase-client.js`.

### 2.2. Malformed Database Schema
**File:** `schema_update.sql` (Lines 20-37)
**Issue:** The `create table if not exists public.notifications` block contains duplicated column definitions for `id`, `user_id`, `actor_id`, and `type`. This will cause the migration to fail immediately, breaking groups, notifications, and deep-linking features.
**Fix:** Remove the duplicate lines (lines 26-29) to ensure a clean table creation.

### 2.3. Broken Password Reset Flow
**File:** `Auth/action.html` (Lines 103-138)
**Issue:** The `forgot-password.html` page successfully sends reset emails, but the landing page (`action.html`) only handles the `verifyEmail` mode. It falls into an "Unsupported Action" branch when a user clicks a password reset link. Furthermore, the reset password form UI is hardcoded as hidden and never wired up.
**Fix:** Add a `case 'resetPassword':` switch block. Implement `checkActionCode`, display the reset form, and use `confirmPasswordReset` upon submission.

### 2.4. Conflicting Auth Strategies
**File:** `Auth/setup.html` (Lines 119-148)
**Issue:** This page attempts to use `supabase.auth.setSession({ access_token: await user.getIdToken(), ... })`, which fails because Supabase's GoTrue cannot validate Firebase RS256 tokens. The rest of the app correctly uses the manual `setSupabaseToken` helper.
**Fix:** Replace `supabase.auth.setSession` with the shared `setSupabaseToken` helper.

### 2.5. Dead Code & Duplicated Logic (Feed Page)
**File:** `feed.html` (Lines 464-470)
**Issue:** The `createPost` function contains duplicated logic for clearing the input and file fields after a successful post.
**Fix:** Remove the duplicate lines (468-470).

## 3. Architectural & Professional Improvements

To make the project "massive and powerful," we must move beyond simple bug fixing and adopt professional software engineering standards.

### 3.1. Code Organization & Modularity
The current codebase relies heavily on inline `<script type="module">` blocks within HTML files, with massive amounts of logic repeated across pages (e.g., `createPostElement` is copied in `feed.html`, `save.html`, and `profile.html`).
**AI IDE Action Plan:**
- Extract all common UI rendering functions (like post creation, comment rendering) into a centralized `ui-components.js` file.
- Move complex business logic out of HTML files into dedicated service modules (e.g., `post-service.js`, `message-service.js`).
- Implement a simple Event Bus or Pub/Sub pattern to decouple UI updates from data fetching, making the app highly reactive and scalable.

### 3.2. Robust Error Handling & UX
The app currently relies on `alert()` boxes for errors, which is highly unprofessional.
**AI IDE Action Plan:**
- Implement a global toast notification system for all error and success messages.
- Add proper loading states (skeleton screens) instead of plain text loaders.
- Ensure all asynchronous operations have comprehensive `try/catch` blocks that log to a centralized error tracking service (e.g., Sentry).

### 3.3. Performance Optimization
The application currently loads duplicate SDKs and CSS in multiple places.
**AI IDE Action Plan:**
- Create a shared `head.html` or a build step to standardize meta tags, fonts, and CDN links across all pages.
- Implement true lazy loading for images and videos in the feed to reduce bandwidth consumption.
- Review the multiple Supabase realtime channels (currently 3+ on the feed page) to ensure they are unsubscribed properly during page transitions to prevent memory leaks.

### 3.4. Security & Data Integrity
**File:** `Data/supabase-client.js`
**Issue:** The Supabase client is configured with `persistSession: false`, forcing every page load to manually re-inject the Firebase token via `setSupabaseToken`.
**AI IDE Action Plan:**
- While the manual token injection is a clever workaround for Firebase/Supabase interoperability, it is fragile.
- Ensure all Supabase queries include strict Row Level Security (RLS) policies. Currently, many tables rely on the frontend to only query the correct data.
- Add input sanitization (e.g., using DOMPurify) before rendering user-generated content (comments, posts) to prevent XSS attacks.

## 4. Strategic Roadmap for AI Implementation

To execute these changes effectively, the AI IDE should follow this phased approach:

**Phase 1: Stabilization (Bug Fixes)**
1. Fix the `profile.html` relative import paths.
2. Correct the `schema_update.sql` file.
3. Wire up the password reset flow in `action.html`.
4. Align the auth strategy in `setup.html`.

**Phase 2: Refactoring (Modularity)**
1. Create a `shared/ui.js` module for common rendering (posts, comments, toasts).
2. Refactor `feed.html`, `save.html`, and `profile.html` to use the shared UI module.
3. Move realtime listeners into a dedicated `realtime-manager.js`.

**Phase 3: Polishing (Professionalism)**
1. Replace all `alert()` calls with a custom toast notification system.
2. Implement skeleton loaders for feed and profile loading states.
3. Add `meta` tags and proper 404 handling across all routes.
4. Standardize CSS variables (colors, spacing) in `style.css` to ensure design consistency.

By following this guide, the AI IDE can systematically transform the "NotWorking" project from a buggy prototype into a robust, professional-grade application ready for massive scale.
