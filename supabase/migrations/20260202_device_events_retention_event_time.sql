-- Update device_events retention to use real-world event_time (strict).
-- If event_time is null, fall back to created_at to avoid infinite retention.
create or replace function public.cleanup_device_events_7d()
returns void
language plpgsql
as $$
begin
  delete from public.device_events
  where coalesce(event_time, created_at) < now() - interval '7 days';
end;
$$;
