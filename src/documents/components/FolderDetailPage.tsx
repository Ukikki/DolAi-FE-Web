import { useState, useEffect } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { Home, Video, FileText, Search } from "lucide-react";
import styles from "../styles/documents.module.scss";
import { useUser } from "../../hooks/user/useUser";
import { getProfileImageUrl } from "../../utils/getProfileImageUrl";
import SortMenu from "./SortMenu";
import DeleteTodoModal from "@/components/modal/DeleteTodoModal";

import axios from "@/utils/axiosInstance";

interface FolderDetailProps {
  navigate: NavigateFunction;
}

interface FileItem {
  id: number;
  name: string;
  type: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
}

interface Folder {
  id: number;
  name: string;
  parentDirectoryId: string | null;
  type: "PERSONAL" | "SHARED";
  color?: string;
}

interface DocumentMetaData {
  type: string;
  size: string;
  createdAt: string;
  updatedAt: string;
  meetingTitle?: string;
  participants: { name: string; email: string }[];
  summary?: string;
}

const fileIcons: Record<string, string> = {
  docx: "/images/bluedocx.png",
  pdf: "/images/redpdf.png",
  image: "/images/png.png",
  txt: "/images/purpletxt.png",
};

export default function FolderDetailPage({ navigate }: FolderDetailProps) {
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [folderList, setFolderList] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [documentMeta, setDocumentMeta] = useState<DocumentMetaData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useUser();
  const { folderId } = useParams();
  const selected: number = Number(folderId);

  useEffect(() => {
    if (!selected || isNaN(selected)) return;

    axios
      .get(`/directories/${selected}/documents`)
      .then((res) => {
        const docs = res.data.data.documents.map((doc: any) => ({
          id: doc.documentId,
          name: doc.title,
          type: doc.fileType.toLowerCase(),
        }));
        setFileList(docs.filter((doc: FileItem) => doc.name));
      })
      .catch((err) => {
        console.error("📛 문서 목록 조회 실패:", err);
        setFileList([]);
      });
  }, [selected]);

  useEffect(() => {
    const stored = localStorage.getItem("folderList");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFolderList(parsed);
      const found = parsed.find((f: any) => f.id === selected);
      if (found) setFolderName(found.name);
    }
  }, [selected]);

  useEffect(() => {
    if (!selectedFile) {
      setDocumentMeta(null);
      return;
    }

    axios
      .get(`/document/${selectedFile.id}/metadata`)
      .then((res) => setDocumentMeta(res.data.data))
      .catch((err) => {
        console.error("📛 문서 메타데이터 조회 실패:", err);
        setDocumentMeta(null);
      });
  }, [selectedFile]);

  function handleSortChange(newSortKey: string, newSortOrder: string) {
    setSortKey(newSortKey);
    setSortOrder(newSortOrder);
  }

  function handleDeleteDocument() {
    if (!selectedFile) return;
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    if (!selectedFile) return;

    axios
      .delete(`/documents/${selectedFile.id}`)
      .then(() => {
        setFileList((prev) => prev.filter((file) => file.id !== selectedFile.id));
        setSelectedFile(null);
      })
      .catch((err) => {
        console.error("문서 삭제 실패:", err);
        alert("문서를 삭제하지 못했습니다.");
      })
      .finally(() => setShowDeleteModal(false));
  }

  function cancelDelete() {
    setShowDeleteModal(false);
  }

  //워드 열기
  const handleOpenViewer = async (documentId: number) => {
    try {
      const res = await axios.get(`/documents/${documentId}/view-office`);
      const viewerUrl = res.data.data;
      window.open(viewerUrl, "_blank"); // 새 탭에서 열기
    } catch (error) {
      console.error("문서 뷰어 열기 실패:", error);
      alert("문서를 열 수 없습니다.");
    }
  };
  // 파일 다운받기
  const handleDownload = async (documentId: number) => {
    try {
      const res = await axios.get(`/documents/${documentId}/download-docx`);
      const fileUrl = res.data.data;
      // 링크를 만들어 자동으로 클릭시켜 다운로드
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = ""; // S3에서 Content-Disposition 설정이 없다면 파일명 추가 가능
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("문서 다운로드 실패:", error);
      alert("문서를 다운로드할 수 없습니다.");
    }
  };
  
  const handleViewPdf = (documentId: number) => {
    const backendBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
    window.open(`${backendBaseUrl}/documents/${documentId}/view-pdf`, "_blank");
  };
  
  
  
  

  const filteredFiles = fileList.filter((file) =>
    (file.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = filteredFiles.slice().sort((a, b) => {
    const compare = a.name.localeCompare(b.name);
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div className="container">
      {/* 상단 네비게이션 */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="../images/main_logo.png" alt="DolAi Logo" />
        </div>
        <div className="navbar-center">
          <nav className="navbar-icons">
            <div className="icon-container" onClick={() => navigate("/")}>
              <Home style={{ width: "1.72vw", height: "1.72vw" }} />
            </div>
            <div className="icon-container" onClick={() => navigate("/meetings")}>
              <Video style={{ width: "1.72vw", height: "1.72vw" }} />
            </div>
            <div className="icon-container" onClick={() => navigate("/documents")}>
              <FileText style={{ width: "1.72vw", height: "1.72vw" }} />
            </div>
          </nav>
        </div>
        <div className="navbar-right">
          <div className="user-profile">
            {user?.profile_image ? (
              <img
                src={getProfileImageUrl(user.profile_image)}
                style={{ width: "2.1vw", borderRadius: "10px", cursor: "pointer" }}
                onClick={() => navigate("/settings")}
              />
            ) : (
              <div style={{ width: "2.1vw", borderRadius: "10px" }} />
            )}
          </div>
        </div>
      </header>

      {/* 경로 & 검색 */}
      <div className={styles.navbarSecondRow}>
        <div className={styles.leftSection}>
          <img src="/images/doc_move_left.png" className={styles.arrowIcon} onClick={() => navigate(-1)} />
          <img src="/images/doc_move_right.png" className={styles.arrowIcon} onClick={() => navigate(1)} />
          <div className={styles.path} onClick={() => navigate("/documents")} style={{ cursor: "pointer" }}>
  <img src="/images/bluefolder.png" alt="folder" className={styles.docsFolderIcon} />
  <span className={styles.pathText}>Docs &gt; {folderName || "문서화면"}</span>
</div>

        </div>
        <div className={styles.rightSection}>
          <SortMenu sortKey={sortKey} sortOrder={sortOrder} onSortChange={handleSortChange} />
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="문서 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <Search className={styles.searchIcon} />
          </div>
        </div>
      </div>

      {/* 본문 */}
      <main className="main">
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          {selectedFile ? (
            <div className={styles.selectedFolderDisplay}>
              <img
                src={fileIcons[selectedFile.type] || "/images/default.png"}
                alt={selectedFile.type}
                className={styles.selectedFileIcon}
              />
              <h2 className={styles.fileTitle}>
                {selectedFile.name.replace(/\.[^/.]+$/, "")}
              </h2>
            </div>
          ) : (
            <h2 className={styles.fileTitle}>파일 선택</h2>
          )}

          {/* 문서 메타 정보 */}
          <div className={styles.info}>문서 정보</div>
          <div className={styles.fileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>유형</span>
              <span className={styles.value}>{documentMeta?.type ?? "-"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>크기</span>
              <span className={styles.value}>{documentMeta?.size ?? "-"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>생성일</span>
              <span className={styles.value}>{documentMeta?.createdAt ?? "-"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>수정일</span>
              <span className={styles.value}>{documentMeta?.updatedAt ?? "-"}</span>
            </div>
            <div className={styles.infoRow}>
  <span className={styles.label}>요약</span>

<div className={styles.summaryBox}>
  <span className={styles.summaryValue}>{documentMeta?.summary ?? "-"}</span>
</div></div>


          </div>

          {/* 삭제/다운 아이콘 */}
          <div className={styles.documentOptions}>
          <img
  src="/images/doc_pdf.png"
  alt="PDF"
  title="PDF 보기"
  className={styles.optionIcon}
  onDoubleClick={() => selectedFile && handleViewPdf(selectedFile.id)}
/>

            <img src="/images/doc_del.png" alt="삭제" className={styles.optionIcon} onClick={handleDeleteDocument} />
            <img
  src="/images/doc_down.png"
  alt="다운"
  className={styles.optionIcon}
  onDoubleClick={() => selectedFile && handleDownload(selectedFile.id)}
/>
          </div>

          {/* 삭제 모달 */}
          {showDeleteModal && selectedFile && (
            <DeleteTodoModal
            message={`정말 <strong style="color:red">${selectedFile.name.replace(/\.[^/.]+$/, "")}</strong> 문서를 삭제하시겠습니까?`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
          )}
        </aside>

        {/* 문서 리스트 */}
        <section className={styles.fileGrid}>
        {sortedFiles.map((file) => (
  <div
    key={file.id}
    className={styles.fileItem}
    onClick={() => setSelectedFile(file)}
    onDoubleClick={() => handleOpenViewer(file.id)}
  >
    <img
      src={fileIcons[file.type.toLowerCase()] || "/images/default.png"}
      alt={file.type}
      className={styles.fileIcon}
    />
    <p className={styles.folderName}>{file.name}</p>
  </div>
))}

        </section>
      </main>
    </div>
  );
}
