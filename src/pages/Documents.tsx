import { useState } from "react";
import { Home, Video, FileText, LogOut } from "lucide-react";
import styles from "../styles/documents.module.scss";
import { handleSocialLogout } from "../utils/logout";

interface DocumentsProps {
  selected: string;
  navigate: (path: string) => void;
}

interface Folder {
  id: number;
  name: string;
  color: string;
}

// 12개 폴더 데이터
const folders: Folder[] = [
  { id: 1,  name: "20250304",    color: "pink" },
  { id: 2,  name: "blue folder", color: "blue" },
  { id: 3,  name: "green folder",color: "green" },
  { id: 4,  name: "yellow folder",color: "yellow" },
  { id: 5,  name: "red folder",   color: "red" },
  { id: 6,  name: "purple folder",color: "purple" },
  { id: 7,  name: "점심메뉴",     color: "pink" },
  { id: 8,  name: "저녁메뉴",     color: "blue" },
  { id: 9,  name: "돌아이회의",    color: "green" },
  { id: 10, name: "교슈님",      color: "yellow" },
  { id: 11, name: "여행",        color: "red" },
  { id: 12, name: "비밀",        color: "purple" },
];

// 색상별 폴더 아이콘 PNG 경로 매핑
const folderIcons: Record<string, string> = {
  pink:   "/images/pinkfolder.png",
  blue:   "/images/bluefolder.png",
  green:  "/images/greenfolder.png",
  yellow: "/images/yellowfolder.png",
  red:    "/images/redfolder.png",
  purple: "/images/purplefolder.png",
};

export default function Documents({ selected, navigate }: DocumentsProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <div className={styles.documentsContainer}>
      {/* 상단 네비게이션 */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="../images/main_logo.png" alt="DolAi Logo" />
        </div>

        <div className="navbar-center">
          <nav className="navbar-icons">
            <div className={`icon-container ${selected === "home" ? "selected" : ""}`} onClick={() => navigate("/")}>
              <Home style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className={`icon-container ${selected === "video" ? "selected" : ""}`} onClick={() => navigate("/meetings")}>
              <Video style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            <div className={`icon-container ${selected === "document" ? "selected" : ""}`} onClick={() => navigate("/documents")}>
              <FileText style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
          </nav>
        </div>

        <div className="navbar-right">
          <div className="icon-logout" onClick={handleSocialLogout}>
            <LogOut style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 좌측 사이드바 */}
        <aside className={styles.sidebar}>
          <h2 className={styles.folderTitle}>
            {selectedFolder ? `📁 ${selectedFolder}` : "문서 선택"}
          </h2>
          <div className={styles.fileInfo}>
            <p>
              <strong>유형:</strong> Microsoft Word (.docx)
            </p>
            <p>
              <strong>크기:</strong> 202KB
            </p>
            <p>
              <strong>생성일:</strong> 2024년 2월 8일 15:00
            </p>
            <p>
              <strong>수정일:</strong> 2024년 2월 8일 16:10
            </p>
          </div>
          <div className={styles.documentOptions}>
            <button className={styles.optionBtn}>📄 PDF 변환</button>
            <button className={styles.optionBtn}>🗑 삭제</button>
            <button className={styles.optionBtn}>🔗 공유하기</button>
          </div>
        </aside>

        {/* 오른쪽 폴더 목록 */}
        <div className={styles.folderGrid}>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={styles.folder}
              onClick={() => setSelectedFolder(folder.name)}
            >
              <img
                src={folderIcons[folder.color]}
                alt={`${folder.color} folder icon`}
                className={styles.folderIcon}
              />
              <p className={styles.folderName}>{folder.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
