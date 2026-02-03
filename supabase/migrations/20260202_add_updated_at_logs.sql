-- Add updated_at timestamps for aggregation logs to improve freshness tracking.
-- This ensures each sync updates the row and the web can show "last updated".

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table if exists public.app_usage_logs
  add column if not exists updated_at timestamptz default now();

alter table if exists public.screen_time_logs
  add column if not exists updated_at timestamptz default now();

alter table if exists public.network_logs
  add column if not exists updated_at timestamptz default now();

alter table if exists public.bluetooth_logs
  add column if not exists updated_at timestamptz default now();

alter table if exists public.storage_logs
  add column if not exists updated_at timestamptz default now();

update public.app_usage_logs
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

update public.screen_time_logs
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

update public.network_logs
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

update public.bluetooth_logs
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

update public.storage_logs
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

drop trigger if exists set_updated_at_app_usage_logs on public.app_usage_logs;
create trigger set_updated_at_app_usage_logs
before insert or update on public.app_usage_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_screen_time_logs on public.screen_time_logs;
create trigger set_updated_at_screen_time_logs
before insert or update on public.screen_time_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_network_logs on public.network_logs;
create trigger set_updated_at_network_logs
before insert or update on public.network_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_bluetooth_logs on public.bluetooth_logs;
create trigger set_updated_at_bluetooth_logs
before insert or update on public.bluetooth_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_storage_logs on public.storage_logs;
create trigger set_updated_at_storage_logs
before insert or update on public.storage_logs
for each row execute function public.set_updated_at();
