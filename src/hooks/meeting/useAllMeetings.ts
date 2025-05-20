import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useUser } from "@/hooks/user/useUser";
import { Meeting } from "@/types/meeting";

export const useAllMeetings = () => {
  const { isLoggedIn } = useUser();
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchAll = async () => {
      try {
        const res = await axios.get("/meetings/history");
        setAllMeetings(res.data?.data ?? []);
      } catch (err) {
        console.error("❌ 전체 회의 불러오기 실패:", err);
      }
    };

    fetchAll();
  }, [isLoggedIn]);

  return { allMeetings };
};
