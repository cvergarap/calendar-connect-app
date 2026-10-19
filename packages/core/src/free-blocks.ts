import { expand, subtract } from "./intervals.js";
import { localTimeToUtc } from "./time.js";
import type { CalendarEvent, Interval } from "./types.js";

/** Horario laboral en formato "HH:MM" en la zona del usuario. */
export interface WorkWindow {
  readonly start: string;
  readonly end: string;
}

export interface FreeBlockOptions {
  readonly workWindow: WorkWindow;
  /** Umbral mínimo de un bloque, en ms (por defecto 90 min). */
  readonly minBlockMs: number;
  /** Margen a cada lado de cada evento ocupado, en ms (por defecto 10 min). */
  readonly bufferMs: number;
}

export interface FreeBlocksResult {
  /** Bloques libres de al menos `minBlockMs`, ordenados por inicio. */
  readonly blocks: Interval[];
  /** Hueco libre más grande del día, aunque sea menor al umbral. Null si no hay ninguno. */
  readonly largest: Interval | null;
}

/**
 * RF-11 · Bloques de productividad continua en un día local.
 * Descuenta todos los eventos ocupados (no solo reuniones) con su buffer a cada lado.
 * Los eventos de día completo no bloquean el día: el horario laboral sigue libre salvo
 * que tengan un intervalo horario. Los eventos "libre" o rechazados tampoco bloquean.
 */
export function freeBlocks(
  events: readonly CalendarEvent[],
  date: string,
  options: FreeBlockOptions,
): FreeBlocksResult {
  const workRange: Interval = {
    start: localTimeToUtc(date, options.workWindow.start),
    end: localTimeToUtc(date, options.workWindow.end),
  };

  const busy = events
    .filter((e) => e.status !== "cancelled")
    .filter((e) => !e.allDay)
    .filter((e) => e.responseStatus !== "declined")
    .filter((e) => e.transparency === "opaque")
    .map((e) => ({ start: e.start, end: e.end }));

  const gaps = subtract(workRange, expand(busy, options.bufferMs));

  const blocks = gaps.filter((gap) => gap.end - gap.start >= options.minBlockMs);
  const largest = gaps.reduce<Interval | null>(
    (best, gap) => (best === null || gap.end - gap.start > best.end - best.start ? gap : best),
    null,
  );

  return { blocks, largest };
}
