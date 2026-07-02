-- ================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- Run this in Supabase SQL Editor to make the feed live-update
-- without manual page refreshes!
-- ================================================================

do $$
begin
  -- Try to add public.posts to replication
  begin
    alter publication supabase_realtime add table public.posts;
  exception when duplicate_object then
    -- Already in publication, safe to ignore
    null;
  end;

  -- Try to add public.likes to replication
  begin
    alter publication supabase_realtime add table public.likes;
  exception when duplicate_object then
    -- Already in publication, safe to ignore
    null;
  end;

  -- Try to add public.comments to replication
  begin
    alter publication supabase_realtime add table public.comments;
  exception when duplicate_object then
    -- Already in publication, safe to ignore
    null;
  end;
end $$;
