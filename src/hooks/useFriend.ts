import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Friend } from "@/types/friend";

// 친구 목록 가져오기
export function useFriend(isVisible: boolean) {
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    try {
      const res = await axiosInstance.get("/friends");
      setFriends(res.data.data.friends || []);
    } catch (err: any) {
      console.error("❌ 친구 목록 불러오기 실패", err);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchFriends();
    }
  }, [isVisible]);

  return { friends, refetch: fetchFriends };
}