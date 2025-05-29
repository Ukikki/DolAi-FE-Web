export interface CalendarEvent {
  meetingId: string;
  title: string;
  start: string;
  status: "SCHEDULED" | "ONGOING" | "ENDED";
  inviteUrl?: string;
}