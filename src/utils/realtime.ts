type RealtimePayload = {
  new?: { id?: string | number | null } | null;
  old?: { id?: string | number | null } | null;
  commit_timestamp?: string | number | null;
  eventType?: string | null;
  type?: string | null;
  table?: string | null;
  table_name?: string | null;
};

export const DEFAULT_EVENT_DEDUPE_WINDOW_MS = 300;

export function buildRealtimeEventKey(payload: RealtimePayload, includeTable = false): string {
  const id = payload?.new?.id ?? payload?.old?.id ?? payload?.commit_timestamp ?? '';
  const eventType = payload?.eventType ?? payload?.type ?? 'unknown';
  const table = payload?.table ?? payload?.table_name ?? 'unknown';
  return includeTable ? `${table}:${eventType}:${id}` : `${eventType}:${id}`;
}

export function createEventDeduper(windowMs = DEFAULT_EVENT_DEDUPE_WINDOW_MS): (key: string) => boolean {
  let lastKey = '';
  let lastAt = 0;
  return function shouldProcess(key: string): boolean {
    const now = Date.now();
    if (key === lastKey && now - lastAt < windowMs) {
      return false;
    }
    lastKey = key;
    lastAt = now;
    return true;
  };
}
