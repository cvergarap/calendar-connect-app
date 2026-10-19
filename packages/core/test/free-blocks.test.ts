import { describe, expect, it } from "vitest";
import { freeBlocks, localTimeToUtc } from "../src/index.js";
import type { CalendarEvent, FreeBlockOptions } from "../src/index.js";

const DAY = "2026-10-19";
const MIN = 60 * 1000;
const options: FreeBlockOptions = {
  workWindow: { start: "08:00", end: "18:00" },
  minBlockMs: 90 * MIN,
  bufferMs: 10 * MIN,
};

function at(time: string): number {
  return localTimeToUtc(DAY, time);
}

function busy(start: string, end: string, overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: `${start}-${end}`,
    title: "Evento",
    category: "trabajo",
    start: at(start),
    end: at(end),
    allDay: false,
    status: "confirmed",
    responseStatus: "accepted",
    transparency: "opaque",
    attendeesCount: 1,
    hasConferenceLink: false,
    ...overrides,
  };
}

describe("freeBlocks (RF-11)", () => {
  it("devuelve el día completo cuando no hay eventos", () => {
    const result = freeBlocks([], DAY, options);

    expect(result.blocks).toEqual([{ start: at("08:00"), end: at("18:00") }]);
    expect(result.largest).toEqual({ start: at("08:00"), end: at("18:00") });
  });

  it("descuenta los eventos ocupados con buffer a cada lado", () => {
    // Ocupado: 09:00-10:00, 10:30-11:00, 14:00-14:30.
    // Con buffer de 10 min: 08:50-10:10, 10:20-11:10, 13:50-14:40.
    // Huecos: 08:00-08:50 (50 min), 11:10-13:50 (160 min), 14:40-18:00 (200 min).
    const events = [busy("09:00", "10:00"), busy("10:30", "11:00"), busy("14:00", "14:30")];

    const result = freeBlocks(events, DAY, options);

    expect(result.blocks).toEqual([
      { start: at("11:10"), end: at("13:50") },
      { start: at("14:40"), end: at("18:00") },
    ]);
    expect(result.largest).toEqual({ start: at("14:40"), end: at("18:00") });
  });

  it("descarta huecos menores al umbral, pero los sigue reportando como el mayor disponible", () => {
    // Ocupado 08:30-17:20 → con buffer 08:20-17:30. Huecos: 08:00-08:20 (20 min) y 17:30-18:00 (30 min).
    // Ninguno llega a 90 min; el mayor es 17:30-18:00.
    const events = [busy("08:30", "17:20")];

    const result = freeBlocks(events, DAY, options);

    expect(result.blocks).toEqual([]);
    expect(result.largest).toEqual({ start: at("17:30"), end: at("18:00") });
  });

  it("no bloquea con eventos de día completo, cancelados, rechazados ni libres", () => {
    const events = [
      busy("08:00", "18:00", { allDay: true }),
      busy("09:00", "10:00", { status: "cancelled" }),
      busy("10:00", "11:00", { responseStatus: "declined" }),
      busy("11:00", "12:00", { transparency: "transparent" }),
    ];

    const result = freeBlocks(events, DAY, options);

    expect(result.blocks).toEqual([{ start: at("08:00"), end: at("18:00") }]);
  });

  it("respeta un umbral configurable", () => {
    const events = [busy("09:00", "10:00"), busy("11:00", "12:00")];

    const result = freeBlocks(events, DAY, { ...options, minBlockMs: 30 * MIN });

    expect(result.blocks).toEqual([
      { start: at("08:00"), end: at("08:50") },
      { start: at("10:10"), end: at("10:50") },
      { start: at("12:10"), end: at("18:00") },
    ]);
  });
});
