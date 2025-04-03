import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';

import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import DocumentsPage from "./documents/components/DocumentsPage";
import FolderDetailPage from "./documents/components/FolderDetailPage"; // 폴더 상세 페이지
import AuthCallback from "./pages/AuthCallback";
// import BackOffice from "./pages/BackOffice";
//import GraphView from "./components/GraphView";

import "./App.css";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("home");

  useEffect(() => {
    if (location.pathname === "/") setSelected("home");
    else if (location.pathname === "/meetings") setSelected("video");
    else if (location.pathname === "/documents") setSelected("document");
    // 라우트가 /folder/:folderId 일 때도 document로 표시할지, 별도 상태로 표시할지 결정
  }, [location.pathname]);

  // 로그인 유지
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const refreshToken = localStorage.getItem("refreshToken");

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // 로그인 유지 확인용
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("jwt", token);
        }

        // 토큰 만료로 인한 401 에러 방지 및 무한 루프 방지용 플래그 설정
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;
          try {
            const res = await axios.post("/auth/reissue", { refreshToken });

            const newAccessToken = res.data.data.tokens.accessToken;
            localStorage.setItem("jwt", newAccessToken);
            axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

            // 새 토큰 붙여서 재요청
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (err) {
            console.error("토큰 재발급 실패", err);
            localStorage.clear();
            window.location.href = "/"; // 실패 시 dashboard로
          }
        }

        return Promise.reject(error);
      }
    );

    // 언마운트 시 인터셉터 정리
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  
  return (

    <Routes>
      <Route path="/" element={<Dashboard selected={selected} navigate={navigate} />} />
      <Route path="/meetings" element={<Meetings navigate={navigate} />} />
      <Route path="/documents" element={<DocumentsPage selected={selected} navigate={navigate} />} />
      {/* 폴더 상세 페이지 */}
      <Route path="/folder/:folderId" element={<FolderDetailPage selected={selected} navigate={navigate} />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      {/* <BackOffice /> */}
    </BrowserRouter>
    // <div>
    //   <h1>GRAPH</h1>
        
    //     <GraphView/>
    // </div>
  );
}
