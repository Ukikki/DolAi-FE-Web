import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import DocumentsPage from "./documents/components/DocumentsPage";
import FolderDetailPage from "./documents/components/FolderDetailPage"; // 폴더 상세 페이지
import Setting from "./pages/Setting";
import AuthCallback from "./pages/AuthCallback";
import RequestsPage from "./pages/RequestsPage";
import ToastManager from "./components/toast/ToastManager";
import NotificationListener from "./components/listeners/NotificationListener";
import BackOffice from "./pages/BackOffice";

import { useUser } from "./hooks/user/useUser";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("home");
  const { user } = useUser();
  //const isAdmin = user?.id! === '115262388928733391824';
  const isAdmin = user?.id! === '';

  useEffect(() => {
    if (location.pathname === "/") setSelected("home");
    else if (location.pathname === "/meetings") setSelected("video");
    else if (location.pathname === "/documents") setSelected("document");
    // 라우트가 /folder/:folderId 일 때도 document로 표시할지, 별도 상태로 표시할지 결정
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={isAdmin ? <Navigate to="/backOffice" /> : <Dashboard selected={selected} navigate={navigate} />} />
      <Route path="/meetings" element={<Meetings />} />
      
      <Route path="/documents" element={<DocumentsPage selected={selected} navigate={navigate} />} />
      <Route path="/folder/:folderId" element={<FolderDetailPage navigate={navigate} />} />

      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/settings/*" element={<Setting navigate={navigate} />}>
        <Route path="request" element={<RequestsPage onBack={() => navigate("/settings")} />} />
      </Route>
      <Route path="/backoffice" element={<BackOffice />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastManager>
        <NotificationListener />
        <AppContent />
      </ToastManager>
    </BrowserRouter>
  );
}