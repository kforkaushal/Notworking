-- ====================================================================
-- RANDOMIZE POST IDS
-- Run this script in the Supabase SQL Editor to make post IDs randomized.
-- This prevents sequential ID predictability (enumeration) and avoids collisions,
-- without breaking foreign keys or column types in likes, comments, saved_posts, and notifications.
-- ====================================================================

-- 1. Remove the auto-increment identity from the 'id' column of 'posts' if it exists
ALTER TABLE public.posts ALTER COLUMN id DROP IDENTITY IF EXISTS;

-- 2. Set the default value to a randomized 64-bit positive bigint
-- This generates a random 19-digit positive number in the range [1000000000000000000, 9000000000000000000).
-- Max signed bigint value is 9223372036854775807, so this is fully safe.
ALTER TABLE public.posts ALTER COLUMN id SET DEFAULT (floor(1000000000000000000 + random() * 8000000000000000000)::bigint);
