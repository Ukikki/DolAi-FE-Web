import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useUser } from "@/hooks/user/useUser";
import { Meeting } from "@/types/meeting";

export const useMeetingData = () => {
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

  const fetchAllMeetings = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.get("/meetings/history");
      console.log(res.data.data);
      return res.data?.data ?? [];
    } catch (err) {
      console.error("전체 회의 불러오기 실패:", err);
      return [];
    } 
  };

  return { recentMeetings, fetchAllMeetings };
};