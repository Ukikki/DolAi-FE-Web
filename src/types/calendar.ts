export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  status?: "RESERVED" | "IN_PROGRESS" | "ENDED";
}