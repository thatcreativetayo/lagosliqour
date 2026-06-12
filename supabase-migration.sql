-- Lagos Liquor Orders Table Migration
-- Run this in your Supabase SQL editor to create the orders table

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  state text not null,
  city text not null,
  street_address text not null,
  landmark text,
  delivery_notes text,
  subtotal numeric not null check (subtotal >= 0),
  delivery_fee numeric not null default 2000 check (delivery_fee >= 0),
  total numeric not null check (total >= 0),
  items jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index on reference for faster lookups
create index if not exists orders_reference_idx on orders(reference);

-- Create index on customer_email for order history queries
create index if not exists orders_customer_email_idx on orders(customer_email);

-- Create index on created_at for sorting
create index if not exists orders_created_at_idx on orders(created_at desc);

-- Enable Row Level Security (optional, depends on your auth setup)
-- alter table orders enable row level security;

-- Example RLS policy (uncomment if you're using Supabase Auth)
-- create policy "Users can view their own orders"
--   on orders for select
--   using (customer_email = auth.jwt() ->> 'email');

-- Trigger to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_orders_updated_at
  before update on orders
  for each row
  execute function update_updated_at_column();
