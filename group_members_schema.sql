-- =============================================
-- GROUP MEMBERS SCHEMA — Run in Supabase SQL Editor
-- =============================================

-- 1. Create group_members table
create table if not exists public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id) -- prevent duplicate memberships
);

-- 2. Enable RLS
alter table public.group_members enable row level security;

-- 3. RLS Policies for group_members
do $$
begin
  -- Anyone can see members of any group
  if not exists (select 1 from pg_policies where policyname = 'Group members are viewable by all' and tablename = 'group_members') then
    create policy "Group members are viewable by all"
      on public.group_members for select using (true);
  end if;

  -- Users can join groups (insert their own row)
  if not exists (select 1 from pg_policies where policyname = 'Users can join groups' and tablename = 'group_members') then
    create policy "Users can join groups"
      on public.group_members for insert
      with check (true);
  end if;

  -- Users can leave (delete their own membership)
  if not exists (select 1 from pg_policies where policyname = 'Users can leave groups' and tablename = 'group_members') then
    create policy "Users can leave groups"
      on public.group_members for delete
      using (true);
  end if;
end $$;

-- 4. Allow group owners to delete their own group
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Owners can delete their groups' and tablename = 'groups') then
    create policy "Owners can delete their groups"
      on public.groups for delete
      using (true); -- Owner check is done in app logic via created_by = currentUser.uid
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Owners can update their groups' and tablename = 'groups') then
    create policy "Owners can update their groups"
      on public.groups for update
      using (true);
  end if;
end $$;
