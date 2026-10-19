import type { CalendarEvent, MeetingRules } from "./types.js";

/**
 * RF-09 · Regla de reunión.
 * Cuenta como reunión si no está cancelado, no es de día completo, no fue rechazado,
 * está marcado como ocupado y cumple al menos una señal: asistentes, enlace o palabra clave.
 */
export function isMeeting(event: CalendarEvent, rules: MeetingRules): boolean {
  if (event.status === "cancelled") return false;
  if (event.allDay) return false;
  if (event.responseStatus === "declined") return false;
  if (event.transparency !== "opaque") return false;

  if (event.attendeesCount >= rules.minAttendees) return true;
  if (event.hasConferenceLink) return true;

  const title = event.title.toLocaleLowerCase("es");
  return rules.keywords.some((keyword) => title.includes(keyword.toLocaleLowerCase("es")));
}
