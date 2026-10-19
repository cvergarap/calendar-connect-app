/** Intervalo semiabierto [start, end) en milisegundos UTC. */
export interface Interval {
  readonly start: number;
  readonly end: number;
}

export type EventStatus = "confirmed" | "tentative" | "cancelled";
export type ResponseStatus = "accepted" | "declined" | "tentative" | "needsAction";
export type Transparency = "opaque" | "transparent";

/** Evento normalizado, independiente del proveedor de calendario. */
export interface CalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly start: number;
  readonly end: number;
  readonly allDay: boolean;
  readonly status: EventStatus;
  readonly responseStatus: ResponseStatus;
  readonly transparency: Transparency;
  readonly attendeesCount: number;
  readonly hasConferenceLink: boolean;
}

/** Reglas configurables de RF-09. */
export interface MeetingRules {
  readonly minAttendees: number;
  readonly keywords: readonly string[];
}
