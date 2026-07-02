-- ================================================================
-- CLEAN RE-CREATE: Likes, Comments, Saved Posts RLS Policies
-- Run this in Supabase SQL Editor to fix the red heart issue.
-- This uses DROP POLICY IF EXISTS to guarantee policies are created
-- cleanly without being blocked by existing policies of the same name.
-- ================================================================

-- 1. Ensure RLS is enabled on all tables
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.saved_posts enable row level security;

-- ================================================================
-- 2. LIKES POLICIES
-- ================================================================
drop policy if exists "Likes are publicly readable" on public.likes;
create policy "Likes are publicly readable"
  on public.likes for select using (true);

drop policy if exists "Users can like posts" on public.likes;
create policy "Users can like posts"
  on public.likes for insert with check (true);

drop policy if exists "Users can unlike posts" on public.likes;
create policy "Users can unlike posts"
  on public.likes for delete using (true);

-- ================================================================
-- 3. COMMENTS POLICIES
-- ================================================================
drop policy if exists "Comments are publicly readable" on public.comments;
create policy "Comments are publicly readable"
  on public.comments for select using (true);

drop policy if exists "Users can post comments" on public.comments;
create policy "Users can post comments"
  on public.comments for insert with check (true);

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments"
  on public.comments for delete using (true);

-- ================================================================
-- 4. SAVED POSTS POLICIES
-- ================================================================
drop policy if exists "Users can view own saved posts" on public.saved_posts;
create policy "Users can view own saved posts"
  on public.saved_posts for select using (true);

drop policy if exists "Users can save posts" on public.saved_posts;
create policy "Users can save posts"
  on public.saved_posts for insert with check (true);

drop policy if exists "Users can unsave posts" on public.saved_posts;
create policy "Users can unsave posts"
  on public.saved_posts for delete using (true);
