import axios from "axios";

// axios 인스턴스 생성
const instance = axios.create({
  baseURL: "http://localhost:8081", // 백엔드 주소
  withCredentials: true,
});

// 로그인 token 만료시 처리될 로직 인터셉터 등록
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      // 토큰 만료시 로그아웃 대신 재발급 요청
      try {
        const res = await axios.post("http://localhost:8081/auth/reissue", null, { 
        headers: {
        "Refresh-Token": refreshToken,
        },
      });
      const newAccessToken = res.data.data.accessToken;
      localStorage.setItem("jwt", newAccessToken);

      // 인스턴스 기본 헤더 & 재요청 헤더 모두 갱신
      instance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      console.log("♻️ 토큰 재발급 성공!");

      return instance(originalRequest); // 재요청
    } catch (err) {
      console.error("토큰 재발급 실패", err);
    }
  }

  return Promise.reject(error);
  }
);

export default instance;
