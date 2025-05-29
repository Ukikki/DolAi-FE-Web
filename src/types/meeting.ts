export interface Meeting {
  meetingId: string;
  title: string;
  startTime: string;
  inviteUrl: string;
  hostId?: string;
  createdAt?: string;
  updatedAt?: string;
  directoryId?: number;
  status?: "RESERVED" | "IN_PROGRESS" | "ENDED"; 
}