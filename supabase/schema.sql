create table if not exists public.inventory_imports (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  inventory_sheet text not null default 'INVENTARIO VALORIZADO',
  movement_sheet text not null default 'LMA',
  imported_by uuid,
  imported_at timestamptz not null default now(),
  row_count integer not null default 0,
  movement_row_count integer not null default 0,
  status text not null default 'completed'
);

create table if not exists public.inventory_items (
  id text primary key,
  import_id uuid references public.inventory_imports(id) on delete set null,
  warehouse text not null,
  ceco text,
  status text not null,
  item_group text not null,
  code text not null,
  description text not null,
  entries numeric not null default 0,
  exits numeric not null default 0,
  balance numeric not null default 0,
  unit_value numeric not null default 0,
  total_value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_code_idx on public.inventory_items(code);
create index if not exists inventory_items_warehouse_idx on public.inventory_items(warehouse);
create index if not exists inventory_items_group_idx on public.inventory_items(item_group);
create index if not exists inventory_items_status_idx on public.inventory_items(status);
create index if not exists inventory_items_ceco_idx on public.inventory_items(ceco);

create table if not exists public.inventory_movements (
  id bigserial primary key,
  item_code text not null,
  movement_date date,
  document text,
  document_number text,
  warehouse text,
  entry_qty numeric not null default 0,
  exit_qty numeric not null default 0,
  balance_qty numeric not null default 0,
  unit_value numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_code_date_idx
  on public.inventory_movements(item_code, movement_date desc);

create table if not exists public.qr_scan_events (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id text references public.inventory_items(id) on delete cascade,
  scanned_by uuid,
  scanned_at timestamptz not null default now(),
  expected_warehouse text,
  reported_warehouse text,
  action text not null default 'view'
    check (action in ('view', 'confirm_location', 'report_difference')),
  notes text
);

create index if not exists qr_scan_events_item_idx
  on public.qr_scan_events(inventory_item_id, scanned_at desc);

alter table public.inventory_imports enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.qr_scan_events enable row level security;

drop policy if exists "authenticated read imports" on public.inventory_imports;
create policy "authenticated read imports"
  on public.inventory_imports for select
  to authenticated
  using (true);

drop policy if exists "authenticated read inventory" on public.inventory_items;
create policy "authenticated read inventory"
  on public.inventory_items for select
  to authenticated
  using (true);

drop policy if exists "authenticated read movements" on public.inventory_movements;
create policy "authenticated read movements"
  on public.inventory_movements for select
  to authenticated
  using (true);

drop policy if exists "authenticated read scan events" on public.qr_scan_events;
create policy "authenticated read scan events"
  on public.qr_scan_events for select
  to authenticated
  using (true);

drop policy if exists "authenticated insert scan events" on public.qr_scan_events;
create policy "authenticated insert scan events"
  on public.qr_scan_events for insert
  to authenticated
  with check (scanned_by = auth.uid() or scanned_by is null);
