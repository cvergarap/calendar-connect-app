import { clip, unionDuration } from "./intervals.js";
import { isMeeting } from "./meetings.js";
import type { CalendarEvent, Interval, MeetingRules } from "./types.js";

export interface MeetingMetrics {
  /** Tiempo ocupado real en reuniones, en ms (RN-3: unión de intervalos). */
  readonly totalMs: number;
  /** Lo mismo por categoría; cada categoría se une por separado. */
  readonly byCategoryMs: Readonly<Record<string, number>>;
}

/**
 * RF-10 · Horas de reunión dentro de un rango.
 * El total es la unión de todas las reuniones: dos reuniones solapadas, aunque sean de
 * categorías distintas, no cuentan dos veces.
 */
export function meetingMetrics(
  events: readonly CalendarEvent[],
  range: Interval,
  rules: MeetingRules,
): MeetingMetrics {
  const clipped: { interval: Interval; category: string }[] = [];
  for (const event of events) {
    if (!isMeeting(event, rules)) continue;
    const interval = clip(event, range);
    if (interval) clipped.push({ interval, category: event.category });
  }

  const byCategoryMs: Record<string, number> = {};
  const categories = new Set(clipped.map((c) => c.category));
  for (const category of categories) {
    const intervals = clipped.filter((c) => c.category === category).map((c) => c.interval);
    byCategoryMs[category] = unionDuration(intervals);
  }

  return {
    totalMs: unionDuration(clipped.map((c) => c.interval)),
    byCategoryMs,
  };
}
