import type { Interval } from "./types.js";

/** Recorta un intervalo al rango indicado. Devuelve null si no hay solape. */
export function clip(interval: Interval, range: Interval): Interval | null {
  const start = Math.max(interval.start, range.start);
  const end = Math.min(interval.end, range.end);
  return start < end ? { start, end } : null;
}

/**
 * Une intervalos solapados o contiguos. Devuelve una lista ordenada y disjunta.
 * Base de RN-3: el tiempo ocupado real es la unión, nunca la suma.
 */
export function mergeIntervals(intervals: readonly Interval[]): Interval[] {
  const sorted = intervals
    .filter((i) => i.start < i.end)
    .slice()
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: Interval[] = [];
  for (const current of sorted) {
    const last = merged[merged.length - 1];
    if (last && current.start <= last.end) {
      merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, current.end) };
    } else {
      merged.push({ start: current.start, end: current.end });
    }
  }
  return merged;
}

/** Duración de la unión de los intervalos, en ms. */
export function unionDuration(intervals: readonly Interval[]): number {
  return mergeIntervals(intervals).reduce((sum, i) => sum + (i.end - i.start), 0);
}

/** Expande cada intervalo `buffer` ms a ambos lados. */
export function expand(intervals: readonly Interval[], buffer: number): Interval[] {
  return intervals.map((i) => ({ start: i.start - buffer, end: i.end + buffer }));
}

/** Partes de `range` que no están cubiertas por ningún intervalo de `busy`. */
export function subtract(range: Interval, busy: readonly Interval[]): Interval[] {
  const gaps: Interval[] = [];
  let cursor = range.start;
  for (const b of mergeIntervals(busy)) {
    if (b.end <= cursor) continue;
    if (b.start >= range.end) break;
    if (b.start > cursor) gaps.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (cursor < range.end) gaps.push({ start: cursor, end: range.end });
  return gaps;
}
