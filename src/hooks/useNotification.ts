import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

export interface Notification {
  category: "친구" | "회의" | "일정";
  createdAt: string;
  title: string;
  targetUrl: string;
}

export const useNotification = () => {
  const [noti, setNoti] = useState<Notification[]>([]);

  useEffect(() => {
    axios.get("/notification")
      .then((res) => {
        setNoti(res.data.data);
      })
      .catch((err) => {
        console.error("알림 가져오기 실패", err);
      })
  }, []);

  return { noti };
};
