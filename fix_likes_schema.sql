-- ================================================================
-- FIX: Likes, Comments, Saved Posts RLS Policies
-- Run this in Supabase SQL Editor to fix the red heart disappearing
-- ================================================================

-- 1. Make sure tables exist (they should already)
-- If they don't exist yet, create them:

create table if not exists public.likes (
  id bigint generated always as identity primary key,
  user_id text not null,
  post_id bigint not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.saved_posts (
  id bigint generated always as identity primary key,
  user_id text not null,
  post_id bigint not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 2. Enable RLS on all three tables
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.saved_posts enable row level security;

-- ================================================================
-- 3. LIKES POLICIES
-- ================================================================
do $$
begin
  -- Anyone can read likes (needed for counts + current-user like state)
  if not exists (select 1 from pg_policies where policyname = 'Likes are publicly readable' and tablename = 'likes') then
    create policy "Likes are publicly readable"
      on public.likes for select using (true);
  end if;

  -- Authenticated users can insert their own likes
  if not exists (select 1 from pg_policies where policyname = 'Users can like posts' and tablename = 'likes') then
    create policy "Users can like posts"
      on public.likes for insert with check (true);
  end if;

  -- Users can unlike (delete their own like)
  if not exists (select 1 from pg_policies where policyname = 'Users can unlike posts' and tablename = 'likes') then
    create policy "Users can unlike posts"
      on public.likes for delete using (true);
  end if;
end $$;

-- ================================================================
-- 4. COMMENTS POLICIES
-- ================================================================
do $$
begin
  -- Anyone can read comments
  if not exists (select 1 from pg_policies where policyname = 'Comments are publicly readable' and tablename = 'comments') then
    create policy "Comments are publicly readable"
      on public.comments for select using (true);
  end if;

  -- Authenticated users can post comments
  if not exists (select 1 from pg_policies where policyname = 'Users can post comments' and tablename = 'comments') then
    create policy "Users can post comments"
      on public.comments for insert with check (true);
  end if;

  -- Users can delete their own comments
  if not exists (select 1 from pg_policies where policyname = 'Users can delete own comments' and tablename = 'comments') then
    create policy "Users can delete own comments"
      on public.comments for delete using (true);
  end if;
end $$;

-- ================================================================
-- 5. SAVED POSTS POLICIES
-- ================================================================
do $$
begin
  -- Users can see their own saved posts
  if not exists (select 1 from pg_policies where policyname = 'Users can view own saved posts' and tablename = 'saved_posts') then
    create policy "Users can view own saved posts"
      on public.saved_posts for select using (true);
  end if;

  -- Users can save posts
  if not exists (select 1 from pg_policies where policyname = 'Users can save posts' and tablename = 'saved_posts') then
    create policy "Users can save posts"
      on public.saved_posts for insert with check (true);
  end if;

  -- Users can unsave posts
  if not exists (select 1 from pg_policies where policyname = 'Users can unsave posts' and tablename = 'saved_posts') then
    create policy "Users can unsave posts"
      on public.saved_posts for delete using (true);
  end if;
end $$;
