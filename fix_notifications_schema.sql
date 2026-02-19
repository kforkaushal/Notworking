-- FIX: Alter existing table instead of ignoring it
-- Run this to fix the "Error loading notifications"

do $$
begin
    -- 1. Add 'post_id' column if it's missing (BigInt to match posts.id)
    if not exists (select 1 from information_schema.columns where table_name = 'notifications' and column_name = 'post_id') then
        alter table public.notifications add column post_id bigint references public.posts(id) on delete cascade;
    end if;

    -- 2. Add 'group_id' to posts if missing (Safety check)
    if not exists (select 1 from information_schema.columns where table_name = 'posts' and column_name = 'group_id') then
        alter table public.posts add column group_id uuid references public.groups(id);
    end if;

    -- 3. Ensure FKs exist for notifications (Safety check)
    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_notifications_user') then
        alter table public.notifications add constraint fk_notifications_user foreign key (user_id) references public.profiles(id) on delete cascade;
    end if;

    if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_notifications_actor') then
        alter table public.notifications add constraint fk_notifications_actor foreign key (actor_id) references public.profiles(id) on delete cascade;
    end if;

end $$;

-- 4. Enable RLS if not enabled
alter table public.notifications enable row level security;
alter table public.groups enable row level security;

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
