export function moveStep(index: number, total: number, direction: -1 | 1) {
  if (total <= 0) return 0;
  return Math.min(total - 1, Math.max(0, index + direction));
}

export function timerTick(remaining: number, running: boolean) {
  if (!running || remaining <= 0) return remaining;
  return remaining - 1;
}

export function progress(index: number, total: number) {
  if (total <= 0) return 0;
  return Math.round(((index + 1) / total) * 100);
}
