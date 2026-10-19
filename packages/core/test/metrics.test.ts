import { describe, expect, it } from "vitest";
import { dayInterval, localTimeToUtc, meetingMetrics } from "../src/index.js";
import type { CalendarEvent, MeetingRules } from "../src/index.js";

const DAY = "2026-10-19";
const MIN = 60 * 1000;
const rules: MeetingRules = { minAttendees: 2, keywords: ["daily"] };

function at(time: string): number {
  return localTimeToUtc(DAY, time);
}

function event(
  overrides: Partial<CalendarEvent> & Pick<CalendarEvent, "start" | "end">,
): CalendarEvent {
  return {
    id: "evt",
    title: "Reunión",
    category: "trabajo",
    allDay: false,
    status: "confirmed",
    responseStatus: "accepted",
    transparency: "opaque",
    attendeesCount: 3,
    hasConferenceLink: false,
    ...overrides,
  };
}

describe("meetingMetrics (RF-10)", () => {
  it("suma la duración de una reunión simple", () => {
    const events = [event({ start: at("09:00"), end: at("10:00") })];

    const result = meetingMetrics(events, dayInterval(DAY), rules);

    expect(result.totalMs).toBe(60 * MIN);
    expect(result.byCategoryMs).toEqual({ trabajo: 60 * MIN });
  });

  it("cuenta el tiempo ocupado real cuando dos reuniones se solapan (RN-3)", () => {
    const events = [
      event({ start: at("09:00"), end: at("10:00"), category: "trabajo" }),
      event({ start: at("09:30"), end: at("10:30"), category: "estudio", hasConferenceLink: true }),
    ];

    const result = meetingMetrics(events, dayInterval(DAY), rules);

    expect(result.totalMs).toBe(90 * MIN);
    expect(result.byCategoryMs).toEqual({ trabajo: 60 * MIN, estudio: 60 * MIN });
  });

  it("recorta las reuniones al rango consultado", () => {
    const events = [event({ start: at("17:30"), end: at("19:00") })];
    const range = { start: at("17:00"), end: at("18:00") };

    expect(meetingMetrics(events, range, rules).totalMs).toBe(30 * MIN);
  });

  it("excluye eventos cancelados, rechazados, de día completo y marcados como libres", () => {
    const events = [
      event({ start: at("09:00"), end: at("10:00"), status: "cancelled" }),
      event({ start: at("10:00"), end: at("11:00"), responseStatus: "declined" }),
      event({ start: at("11:00"), end: at("12:00"), allDay: true }),
      event({ start: at("12:00"), end: at("13:00"), transparency: "transparent" }),
    ];

    expect(meetingMetrics(events, dayInterval(DAY), rules).totalMs).toBe(0);
  });

  it("excluye eventos sin señal de reunión (un asistente, sin enlace ni palabra clave)", () => {
    const events = [
      event({ start: at("09:00"), end: at("10:00"), attendeesCount: 1, title: "Revisar correo" }),
    ];

    expect(meetingMetrics(events, dayInterval(DAY), rules).totalMs).toBe(0);
  });

  it("cuenta un evento de un solo asistente si el título tiene la palabra clave", () => {
    const events = [
      event({ start: at("09:00"), end: at("09:15"), attendeesCount: 1, title: "Daily del equipo" }),
    ];

    expect(meetingMetrics(events, dayInterval(DAY), rules).totalMs).toBe(15 * MIN);
  });
});
