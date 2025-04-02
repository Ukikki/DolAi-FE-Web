import axios from "axios";

export const handleSocialLogout = () => {
  const token = localStorage.getItem("jwt");
  const refreshToken = localStorage.getItem("refreshToken");
  
  if(!token) {
    console.log("🔓 이미 로그아웃된 상태입니다.");
    return;
  }

  // 토큰 제거
  localStorage.removeItem("jwt");
  localStorage.removeItem("refreshToken");
  delete axios.defaults.headers.common["Authorization"];
  
  // 서버에도 로그아웃 요청
  if (refreshToken) {
    axios.post("/auth/logout", { refreshToken }).catch(console.error);
  }
  
  // 메인 화면으로 이동
  console.log('🔓로그아웃');
  window.location.href = "/";
};