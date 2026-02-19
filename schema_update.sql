-- 1. Create GROUPS table
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  image_url text,
  created_by text not null, -- references auth.users(id) theoretically, but we use text for flexibility with firebase
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add group_id to POSTS table
-- We use 'do' block to check if column exists to avoid errors on multiple runs
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'posts' and column_name = 'group_id') then
    alter table public.posts add column group_id uuid references public.groups(id);
  end if;
end $$;

-- 3. Create NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- The recipient
  actor_id text not null, -- The person who triggered it
  type text not null check (type in ('like', 'comment', 'follow', 'system')),
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- The recipient
  actor_id text not null, -- The person who triggered it
  type text not null check (type in ('like', 'comment', 'follow', 'system')),
  post_id bigint references public.posts(id) on delete cascade, -- Explicit link to posts (bigint)
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Foreign Keys
  constraint fk_notifications_user foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint fk_notifications_actor foreign key (actor_id) references public.profiles(id) on delete cascade
);

-- Note: We removed entity_id (text) and replaced it with post_id (bigint) to match posts.id type.
-- This allows strict FK enforcement and easy joins in Supabase.

-- 4. Enable RLS (Row Level Security) - Optional but recommended
alter table public.groups enable row level security;
alter table public.notifications enable row level security;

-- 5. Policies (Idempotent)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public groups are viewable by everyone' and tablename = 'groups') then
    create policy "Public groups are viewable by everyone" on public.groups for select using (true);
  end if;
  
  if not exists (select 1 from pg_policies where policyname = 'Users can create groups' and tablename = 'groups') then
    create policy "Users can create groups" on public.groups for insert with check (true);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can view their own notifications' and tablename = 'notifications') then
    create policy "Users can view their own notifications" on public.notifications for select using (auth.uid()::text = user_id);
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users can create notifications' and tablename = 'notifications') then
    create policy "Users can create notifications" on public.notifications for insert with check (true);
  end if;
end $$;

-- 6. Add is_private to PROFILES if needed for settings
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_private') then
    alter table public.profiles add column is_private boolean default false;
  end if;
end $$;
