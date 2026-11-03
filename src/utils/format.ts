/**
 * Date and queue display format utilities
 */

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTokenNumber(prefix: string, seq: number): string {
  const padded = String(seq).padStart(3, '0');
  return prefix ? `${prefix}-${padded}` : padded;
}

export function formatTime(timestamp?: number): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateAndTime(timestamp?: number): string {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min${Math.round(minutes) === 1 ? '' : 's'}`;
  }
  const hrs = Math.floor(minutes / 60);
  const rem = Math.round(minutes % 60);
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}
