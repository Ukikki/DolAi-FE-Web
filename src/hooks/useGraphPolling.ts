import { useEffect } from "react";

export const useGraphPolling = (
  meetingId: string | undefined,
  fetchGraph: (id: string) => void
) => {
  useEffect(() => {
    if (!meetingId) return;

    fetchGraph(meetingId);
    const interval = setInterval(() => {
      fetchGraph(meetingId);
    }, 7000);

    return () => clearInterval(interval);
  }, [meetingId, fetchGraph]);
};
