import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import DocumentsPage from "./documents/components/DocumentsPage";
import FolderDetailPage from "./documents/components/FolderDetailPage"; // 폴더 상세 페이지
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

  return (
    <Routes>
      <Route path="/" element={<Dashboard selected={selected} navigate={navigate} />} />
      <Route path="/meetings" element={<Meetings selected={selected} navigate={navigate} />} />
      <Route path="/documents" element={<DocumentsPage selected={selected} navigate={navigate} />} />
      {/* 폴더 상세 페이지 */}
      <Route path="/folder/:folderId" element={<FolderDetailPage selected={selected} navigate={navigate} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
