-- Lagos Liquor Newsletter Table Migration
-- Run this in your Supabase SQL editor

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now(),
  is_active boolean default true
);

-- Create index on email for faster lookups
create index if not exists newsletter_email_idx on newsletter_subscribers(email);

-- Create index on subscribed_at for sorting
create index if not exists newsletter_subscribed_at_idx on newsletter_subscribers(subscribed_at desc);

-- Enable Row Level Security
alter table newsletter_subscribers enable row level security;

-- Allow anyone to insert (subscribe)
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

-- Only allow viewing own subscription
create policy "Users can view own subscription"
  on newsletter_subscribers for select
  using (email = current_setting('request.jwt.claims', true)::json->>'email');
