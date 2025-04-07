import { useState, useEffect, useCallback } from "react";
import axios from  "../utils/axiosInstance";

export interface User {
  id: string;
  email: string;
  name: string;
  profile_image: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 내 정보 가져오기
  const fetchUser = useCallback(() => {
    const token = localStorage.getItem("jwt");
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
    .catch(() => {
      setUser(null);
      setIsLoggedIn(false);
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoggedIn, refetch: fetchUser };
};