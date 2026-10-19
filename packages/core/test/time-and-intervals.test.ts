import { describe, expect, it } from "vitest";
import {
  clip,
  localDateToUtc,
  mergeIntervals,
  monthInterval,
  subtract,
  unionDuration,
  weekInterval,
} from "../src/index.js";

const HOUR = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR;

describe("zona horaria del usuario (UTC-5 fijo)", () => {
  it("el inicio del día local 2026-10-19 es 05:00 UTC", () => {
    expect(localDateToUtc("2026-10-19")).toBe(Date.UTC(2026, 9, 19, 5));
  });

  it("rechaza fechas con formato inválido", () => {
    expect(() => localDateToUtc("19/10/2026")).toThrow(RangeError);
  });
});

describe("semana y mes", () => {
  it("la semana ISO empieza en lunes, en hora local", () => {
    // 2026-10-19 es lunes; 2026-10-25 es domingo de la misma semana.
    const monday = localDateToUtc("2026-10-19");

    expect(weekInterval("2026-10-19").start).toBe(monday);
    expect(weekInterval("2026-10-25").start).toBe(monday);
    expect(weekInterval("2026-10-25").end).toBe(monday + 7 * DAY_MS);
  });

  it("el mes cubre desde el día 1 local hasta el día 1 del mes siguiente", () => {
    const result = monthInterval("2026-10-19");

    expect(result.start).toBe(localDateToUtc("2026-10-01"));
    expect(result.end).toBe(localDateToUtc("2026-11-01"));
    expect((result.end - result.start) / DAY_MS).toBe(31);
  });

  it("el mes de diciembre cruza al año siguiente", () => {
    expect(monthInterval("2026-12-05").end).toBe(localDateToUtc("2027-01-01"));
  });
});

describe("intervalos", () => {
  it("une intervalos solapados y contiguos", () => {
    const merged = mergeIntervals([
      { start: 0, end: 10 },
      { start: 5, end: 20 },
      { start: 20, end: 30 },
      { start: 40, end: 50 },
    ]);

    expect(merged).toEqual([
      { start: 0, end: 30 },
      { start: 40, end: 50 },
    ]);
  });

  it("la duración de la unión no cuenta dos veces el solape", () => {
    expect(
      unionDuration([
        { start: 0, end: 60 },
        { start: 30, end: 90 },
      ]),
    ).toBe(90);
  });

  it("recorta un intervalo al rango y devuelve null si no hay solape", () => {
    expect(clip({ start: 0, end: 100 }, { start: 50, end: 150 })).toEqual({ start: 50, end: 100 });
    expect(clip({ start: 0, end: 10 }, { start: 20, end: 30 })).toBeNull();
  });

  it("resta los intervalos ocupados de un rango", () => {
    const gaps = subtract({ start: 0, end: 100 }, [
      { start: 10, end: 20 },
      { start: 15, end: 30 },
      { start: 90, end: 200 },
    ]);

    expect(gaps).toEqual([
      { start: 0, end: 10 },
      { start: 30, end: 90 },
    ]);
  });
});
