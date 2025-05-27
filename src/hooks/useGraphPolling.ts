import { useEffect } from "react";
import { useGraph } from "./useGraph";

export const useGraphPolling = (meetingId: string | undefined) => {
  const { fetchGraph } = useGraph();

  useEffect(() => {
    if (!meetingId) return;

    fetchGraph(meetingId);

    const interval = setInterval(() => {
      fetchGraph(meetingId);
    }, 7000);

    return () => {
      clearInterval(interval);
    };
  }, [meetingId, fetchGraph]);
};