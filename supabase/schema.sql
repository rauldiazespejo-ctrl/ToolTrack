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

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  role text not null default 'requester'
    check (role in ('admin', 'warehouse_lead', 'requester', 'supervisor', 'maintenance', 'auditor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ceco text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.asset_requests (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id text references public.inventory_items(id) on delete set null,
  item_code text not null,
  description text not null,
  warehouse text not null,
  ceco text,
  item_group text not null,
  quantity numeric not null default 1,
  requested_by uuid,
  requested_by_name text not null default 'Usuario no informado',
  contract text not null default 'Sin contrato informado',
  needed_at date,
  priority text not null default 'normal'
    check (priority in ('normal', 'urgent', 'critical')),
  status text not null default 'pending_approval'
    check (status in (
      'pending_approval',
      'approved',
      'warehouse_queue',
      'ready_to_dispatch',
      'dispatched',
      'closed',
      'quote_required',
      'rejected'
    )),
  availability_status text not null default 'needs_review'
    check (availability_status in ('available', 'needs_review', 'out_of_stock', 'blocked')),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists asset_requests_status_idx
  on public.asset_requests(status, created_at desc);
create index if not exists asset_requests_item_idx
  on public.asset_requests(inventory_item_id, created_at desc);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  asset_request_id uuid references public.asset_requests(id) on delete cascade,
  item_code text,
  description text not null,
  contract text,
  requested_by uuid,
  status text not null default 'pending_quote'
    check (status in ('pending_quote', 'quoted', 'purchase_approved', 'purchased', 'received', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.asset_documents (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id text references public.inventory_items(id) on delete cascade,
  document_type text not null
    check (document_type in ('certificate', 'calibration', 'maintenance', 'inspection', 'manual', 'warranty')),
  document_number text,
  provider text,
  issued_at date,
  expires_at date,
  file_url text,
  status text not null default 'not_loaded'
    check (status in ('valid', 'expiring', 'expired', 'rejected', 'not_loaded', 'not_applicable')),
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists asset_documents_item_expiry_idx
  on public.asset_documents(inventory_item_id, expires_at);

create table if not exists public.maintenance_events (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id text references public.inventory_items(id) on delete cascade,
  event_type text not null
    check (event_type in ('preventive', 'corrective', 'calibration', 'inspection', 'block', 'release')),
  performed_at date,
  next_due_at date,
  provider text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  asset_request_id uuid references public.asset_requests(id) on delete set null,
  dispatched_by uuid,
  received_by_name text,
  warehouse text,
  contract text,
  status text not null default 'prepared'
    check (status in ('prepared', 'dispatched', 'received', 'returned', 'cancelled')),
  dispatched_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.dispatch_items (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid references public.dispatches(id) on delete cascade,
  inventory_item_id text references public.inventory_items(id) on delete set null,
  item_code text not null,
  quantity numeric not null default 1,
  document_check_status text not null default 'not_required'
    check (document_check_status in ('valid', 'missing', 'expired', 'not_required')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role text,
  recipient_user uuid,
  title text not null,
  body text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.inventory_imports enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.qr_scan_events enable row level security;
alter table public.profiles enable row level security;
alter table public.contracts enable row level security;
alter table public.asset_requests enable row level security;
alter table public.quote_requests enable row level security;
alter table public.asset_documents enable row level security;
alter table public.maintenance_events enable row level security;
alter table public.dispatches enable row level security;
alter table public.dispatch_items enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

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

drop policy if exists "authenticated read profiles" on public.profiles;
create policy "authenticated read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "authenticated read contracts" on public.contracts;
create policy "authenticated read contracts"
  on public.contracts for select
  to authenticated
  using (true);

drop policy if exists "authenticated read asset requests" on public.asset_requests;
create policy "authenticated read asset requests"
  on public.asset_requests for select
  to authenticated
  using (true);

drop policy if exists "authenticated insert asset requests" on public.asset_requests;
create policy "authenticated insert asset requests"
  on public.asset_requests for insert
  to authenticated
  with check (requested_by = auth.uid() or requested_by is null);

drop policy if exists "authenticated read quote requests" on public.quote_requests;
create policy "authenticated read quote requests"
  on public.quote_requests for select
  to authenticated
  using (true);

drop policy if exists "authenticated insert quote requests" on public.quote_requests;
create policy "authenticated insert quote requests"
  on public.quote_requests for insert
  to authenticated
  with check (requested_by = auth.uid() or requested_by is null);

drop policy if exists "authenticated read documents" on public.asset_documents;
create policy "authenticated read documents"
  on public.asset_documents for select
  to authenticated
  using (true);

drop policy if exists "authenticated read maintenance" on public.maintenance_events;
create policy "authenticated read maintenance"
  on public.maintenance_events for select
  to authenticated
  using (true);

drop policy if exists "authenticated read dispatches" on public.dispatches;
create policy "authenticated read dispatches"
  on public.dispatches for select
  to authenticated
  using (true);

drop policy if exists "authenticated read dispatch items" on public.dispatch_items;
create policy "authenticated read dispatch items"
  on public.dispatch_items for select
  to authenticated
  using (true);

drop policy if exists "authenticated read notifications" on public.notifications;
create policy "authenticated read notifications"
  on public.notifications for select
  to authenticated
  using (recipient_user = auth.uid() or recipient_user is null);

drop policy if exists "authenticated read audit log" on public.audit_log;
create policy "authenticated read audit log"
  on public.audit_log for select
  to authenticated
  using (true);
