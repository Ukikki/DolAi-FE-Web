import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useUser } from "@/hooks/user/useUser";
import { Meeting } from "@/types/meeting";

export const useRecentMeetings = () => {
  const { isLoggedIn } = useUser();
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchRecent = async () => {
      try {
        const res = await axios.get("/meetings/history-recent");
        setRecentMeetings(res.data?.data ?? []);
      } catch (err) {
        console.error("recent meetings 에러:", err);
      }
    };

    fetchRecent();
  }, [isLoggedIn]);

  return { recentMeetings };
};