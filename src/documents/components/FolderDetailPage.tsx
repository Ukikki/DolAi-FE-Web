import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import {
  Home,
  Video,
  FileText,
  Search,
} from "lucide-react";
import styles from "../styles/documents.module.scss";
import { useUser } from "../../hooks/useUser";
import { getProfileImageUrl } from "../../utils/getProfileImageUrl";
import SortMenu from "./SortMenu"; // 정렬 메뉴 컴포넌트 추가

interface FolderDetailProps {
  selected: string;
  navigate: NavigateFunction;
}

/** 파일 데이터 타입 */
interface FileItem {
  id: number;
  name: string;
  type: string; // "docx", "pdf", "image", "txt", 등...
}

/** 파일 형식별 아이콘 경로 매핑 */
const fileIcons: Record<string, string> = {
  docx: "/images/bluedocx.png",
  pdf: "/images/redpdf.png",
  image: "/images/png.png",
  txt: "/images/purpletxt.png",
  // 필요에 따라 추가
};

export default function FolderDetailPage({ selected, navigate }: FolderDetailProps) {
  // URL 파라미터로 폴더ID를 사용할 수 있음 (예: useParams), 여기서는 생략
  // const { folderId } = useParams<{ folderId: string }>();

  // 예시 파일 목록
  const [fileList] = useState<FileItem[]>([
    { id: 1, name: "점심메뉴 문서.docx", type: "docx" },
    { id: 2, name: "점심메뉴 설명서.pdf", type: "pdf" },
    { id: 3, name: "점심메뉴 사진.png", type: "image" },
    { id: 4, name: "점심메뉴 메모.txt", type: "txt" },
  ]);

  // 선택된 파일 상태
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const { user } = useUser(); // 로그인 상태 함수

  // 정렬 및 검색 관련 상태 추가
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // 정렬 변경 핸들러 (SortMenu에서 호출)
  function handleSortChange(newSortKey: string, newSortOrder: string) {
    setSortKey(newSortKey);
    setSortOrder(newSortOrder);
  }

  // 검색어에 따른 파일 필터링
  const filteredFiles = fileList.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 정렬 (여기서는 파일 이름 기준 정렬) , 나중에 파일 크기, 수정일, 생성일 순서로 정렬
  const sortedFiles = filteredFiles.slice().sort((a, b) => {
    const compare = a.name.localeCompare(b.name);
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div className="container">
      {/* 첫 번째 줄: 상단바 */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="../images/main_logo.png" alt="DolAi Logo" />
        </div>

        <div className="navbar-center">
          <nav className="navbar-icons">
            <div
              className={`icon-container ${selected === "home" ? "selected" : ""}`}
              onClick={() => navigate("/")}
            >
              <Home style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div
              className={`icon-container ${selected === "video" ? "selected" : ""}`}
              onClick={() => navigate("/meetings")}
            >
              <Video style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div
              className={`icon-container ${selected === "document" ? "selected" : ""}`}
              onClick={() => navigate("/documents")}
            >
              <FileText style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
          </nav>
        </div>

        <div className="navbar-right">
          <div className="user-profile">
          {user?.profile_image ? (
            <img src={getProfileImageUrl(user?.profile_image)} style={{ width: "2.1vw", borderRadius: "10px", cursor: "pointer"}} onClick={() => navigate("/settings")} />
            ): (
            <div style={{ width: "2.1vw", borderRadius: "10px", cursor: "default"}} />
          )}</div></div>
      </header>

      {/* 두 번째 줄: 뒤로/앞으로 화살표, 폴더 아이콘, 경로, 정렬 메뉴 및 검색 입력창 */}
      <div className={styles.navbarSecondRow}>
        <div className={styles.leftSection}>
        <img src="/images/doc_move_left.png" className={styles.arrowIcon} onClick={() => navigate(-1)} />
        <img src="/images/doc_move_right.png" className={styles.arrowIcon} onClick={() => navigate(1)} />
          <div className={styles.path}>
            <img src="/images/bluefolder.png" alt="Docs folder" className={styles.docsFolderIcon} />
            <span className={styles.pathText}>Docs &gt; 문서화면</span>
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

      {/* 메인 영역 */}
      <main className="main">
        {/* 사이드바: 선택된 파일 정보 표시 */}
        <aside className={styles.sidebar}>
          {selectedFile ? (
            <div className={styles.selectedFolderDisplay}>
              <img
                src={
                  fileIcons[selectedFile.type] || "/images/default.png"
                }
                alt={`${selectedFile.type} file`}
                className={styles.selectedFileIcon}
              />
              <h2 className={styles.fileTitle}>{selectedFile.name}</h2>
            </div>
          ) : (
            <h2 className={styles.fileTitle}>파일 선택</h2>
          )}

          {/* 나머지 사이드바 정보 */}
          <div className={styles.info}>정보</div>
          <div className={styles.fileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>유형</span>
              <span className={styles.value}>txt</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>크기</span>
              <span className={styles.value}>202KB</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>생성</span>
              <span className={styles.value}>
                2024년 2월 8일 15:00
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>수정일</span>
              <span className={styles.value}>
                2024년 2월 8일 16:10
              </span>
            </div>
          </div>

          <div className={styles.documentOptions}>
              <img src="/images/doc_pdf.png" alt="PDF 변환" className={styles.optionIcon} />
              <img src="/images/doc_del.png" alt="삭제" className={styles.optionIcon} />
              <img src="/images/doc_down.png" alt="다운받기" className={styles.optionIcon} />
          </div>
        </aside>

        {/* 파일 목록: 파일들을 그리드로 표시 (파일 클릭 시 사이드바 업데이트) */}
        <section className={styles.fileGrid}>
          {sortedFiles.map((file) => (
            <div
              key={file.id}
              className={styles.fileItem}
              onClick={() => setSelectedFile(file)}
            >
              <img
                src={fileIcons[file.type] || "/images/default.png"}
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
