import type { Interval } from "./types.js";

/**
 * Zona fija del usuario (America/Bogota, UTC-5, sin horario de verano).
 * Un desfase fijo hace el cálculo determinista y no depende de Intl ni de la zona del host.
 */
export const USER_UTC_OFFSET_HOURS = -5;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Inicio del día local `date` ("YYYY-MM-DD") expresado en ms UTC. */
export function localDateToUtc(date: string): number {
  const [y, m, d] = parseDate(date);
  return Date.UTC(y, m - 1, d) - USER_UTC_OFFSET_HOURS * HOUR_MS;
}

/** Instante de `time` ("HH:MM") en el día local `date`, en ms UTC. */
export function localTimeToUtc(date: string, time: string): number {
  return localDateToUtc(date) + parseMinutesOfDay(time) * MINUTE_MS;
}

/** Día local completo. */
export function dayInterval(date: string): Interval {
  const start = localDateToUtc(date);
  return { start, end: start + DAY_MS };
}

/** Semana ISO (lunes a domingo, hora local) que contiene `date`. */
export function weekInterval(date: string): Interval {
  const [y, m, d] = parseDate(date);
  // Día de la semana en hora local: 0 = lunes ... 6 = domingo.
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  const start = localDateToUtc(date) - weekday * DAY_MS;
  return { start, end: start + 7 * DAY_MS };
}

/** Mes calendario (hora local) que contiene `date`. */
export function monthInterval(date: string): Interval {
  const [y, m] = parseDate(date);
  const start = localDateToUtc(`${String(y)}-${pad(m)}-01`);
  const nextMonth = m === 12 ? `${String(y + 1)}-01-01` : `${String(y)}-${pad(m + 1)}-01`;
  return { start, end: localDateToUtc(nextMonth) };
}

function parseDate(date: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new RangeError(`Fecha inválida, se esperaba YYYY-MM-DD: ${date}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function parseMinutesOfDay(time: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    throw new RangeError(`Hora inválida, se esperaba HH:MM: ${time}`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
