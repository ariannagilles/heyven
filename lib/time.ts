export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "adesso";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} g fa`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} sett fa`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mesi fa`;
  return `${Math.floor(days / 365)} anni fa`;
}
