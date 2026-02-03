-- Retain device_events for 7 days
create extension if not exists pg_cron;

create or replace function public.cleanup_device_events_7d()
returns void
language sql
security definer
as $$
  delete from public.device_events
  where event_time < (now() - interval '7 days');
$$;

do $$
begin
  if not exists (
    select 1 from cron.job where jobname = 'device_events_retention_7d'
  ) then
    perform cron.schedule(
      'device_events_retention_7d',
      '0 3 * * *',
      'select public.cleanup_device_events_7d();'
    );
  end if;
end $$;
