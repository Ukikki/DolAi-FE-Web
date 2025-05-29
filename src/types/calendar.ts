export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  status: "SCHEDULED" | "ONGOING" | "ENDED";
}