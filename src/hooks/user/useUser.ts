import { useState, useEffect, useCallback } from "react";
import axios from  "@/utils/axiosInstance";
import { User } from "@/types/user";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 내 정보 가져오기
  const fetchUser = useCallback(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    
    axios.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    })
    .then((res) => {
      setUser(res.data.data);
      setIsLoggedIn(true);
    })
    .catch((err) => {
      if (err.code === "ERR_NETWORK") {
        console.error("🌐 서버 연결 안됨 (ERR_NETWORK)");
      }
      setUser(null);
      setIsLoggedIn(false);
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoggedIn, refetch: fetchUser };
};