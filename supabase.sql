-- ENERGOAUTONOMY orders table for Supabase
create table if not exists orders (
  id bigserial primary key,
  order_id text unique not null,
  customer_name text,
  phone text,
  email text,
  city text,
  delivery text,
  payment_method text,
  payment_status text,
  order_status text default 'new',
  total numeric,
  currency text default 'UAH',
  items jsonb default '[]'::jsonb,
  comment text,
  payment_provider text,
  payment_invoice_id text,
  created_at timestamptz default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
