import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import {
  Home,
  Video,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import "/Users/hansung/Desktop/DolAi/DolAi-FE/src/App.css"; 
import styles from "../styles/documents.module.scss";      
import SortMenu from "./SortMenu";

interface DocumentsProps {
  selected: string;
  navigate: NavigateFunction;
}

interface Folder {
  id: number;
  name: string;
  color: string;
}

const initialFolders: Folder[] = [
  { id: 1,  name: "20250304",    color: "yellow" },
  { id: 2,  name: "red folder",  color: "red" },
  { id: 3,  name: "green folder",color: "green" },
  { id: 4,  name: "blue folder", color: "blue" },
  { id: 5,  name: "purple folder", color: "purple" },
  { id: 6,  name: "pink folder", color: "pink" },
  { id: 7,  name: "점심메뉴",     color: "yellow" },
  { id: 8,  name: "저녁메뉴",     color: "red" },
  { id: 9,  name: "돌아이회의",   color: "green" },
  { id: 10, name: "교슈님",       color: "blue" },
  { id: 11, name: "여행",         color: "purple" },
  { id: 12, name: "비밀",         color: "pink" },
];

const folderIcons: Record<string, string> = {
  red:     "/images/redfolder.png",
  yellow:  "/images/yellowfolder.png",
  green:   "/images/greenfolder.png",
  blue:    "/images/bluefolder.png",
  purple:  "/images/purplefolder.png",
  pink:    "/images/pinkfolder.png",
};

export default function DocumentsPage({ selected, navigate }: DocumentsProps) {
  // 폴더 목록 상태
  const [folderList] = useState<Folder[]>(initialFolders);
  // 선택된 폴더 (단일 클릭 시 사이드바에 표시)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  // 선택된 폴더 객체
  const selectedFolderObj = folderList.find((f) => f.name === selectedFolder);

  // 폴더 색상 변경 함수 (예시)
  function handleColorChange(newColor: string) {
    if (!selectedFolderObj) return;
    // 선택된 폴더의 색상을 업데이트 (여기서는 사이드바 표시용 예시)
    // 실제 기능에 따라 추가 로직 작성 가능
  }

  // 더블 클릭 시 상세 페이지로 이동
  function handleFolderClick(folder: Folder) {
    setSelectedFolder(folder.name);
    navigate(`/folder/${folder.id}`);
  }

  return (
    <div className="container">
      {/* 첫 번째 줄: 로고 + 네비게이션 아이콘 */}
      <header className="navbar">
        <img src="../images/main_logo.png" alt="DolAi Logo" />
        <nav className="navbar-icons">
          <div
            className={`icon-container ${selected === "home" ? "selected" : ""}`}
            onClick={() => navigate("/")}
          >
            <Home size={33} style={{ cursor: "pointer" }} />
          </div>
          <div
            className={`icon-container ${selected === "video" ? "selected" : ""}`}
            onClick={() => navigate("/meetings")}
          >
            <Video size={33} style={{ cursor: "pointer" }} />
          </div>
          <div
            className={`icon-container ${selected === "document" ? "selected" : ""}`}
            onClick={() => navigate("/documents")}
          >
            <FileText size={33} style={{ cursor: "pointer" }} />
          </div>
        </nav>
      </header>

      {/* 두 번째 줄: 화살표(뒤로/앞으로) + 폴더 아이콘 + 경로 + 검색창 + 정렬 */}
      <div className={styles.navbarSecondRow}>
        <div className={styles.leftSection}>
          <ChevronLeft
            size={24}
            className={styles.arrowIcon}
            onClick={() => navigate(-1)}
          />
          <ChevronRight
            size={24}
            className={styles.arrowIcon}
            onClick={() => navigate(1)}
          />
          <img
            src="/images/bluefolder.png"
            alt="Docs folder"
            className={styles.docsFolderIcon}
          />
          <span className={styles.pathText}>Docs &gt; 문서화면</span>
        </div>
        <div className={styles.rightSection}>

          <SortMenu />
          
          {/* 문서 검색 박스 */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchText}>문서 검색</span>
            <img 
              src="/images/search.png" 
              alt="돋보기 아이콘" 
              className={styles.searchIcon} 
            />
          </div>
        </div>
      </div>

      {/* 메인 영역 */}
      <main className="main">
        {/* 좌측 사이드바 */}
        <aside className={styles.sidebar}>
          {selectedFolderObj ? (
            <div className={styles.selectedFolderDisplay}>
              <img
                src={folderIcons[selectedFolderObj.color]}
                alt={`${selectedFolderObj.color} folder`}
                className={styles.selectedFolderIcon}
              />
              <h2 className={styles.folderTitle}>{selectedFolderObj.name}</h2>
            </div>
          ) : (
            <h2 className={styles.folderTitle}>문서 선택</h2>
          )}

          <div className={styles.info}>
            <h4>정보</h4>
          </div>
          <div className={styles.fileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>유형</span>
              <span className={styles.value}>Microsoft Word (.docx)</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>크기</span>
              <span className={styles.value}>202KB</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>생성일</span>
              <span className={styles.value}>2024년 2월 8일 15:00</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>수정일</span>
              <span className={styles.value}>2024년 2월 8일 16:10</span>
            </div>
          </div>

          <div className={styles.info}>
            <h5>색상</h5>
            <div className={styles.colorOptions}>
              <div className={styles.redCircle} onClick={() => handleColorChange("red")} />
              <div className={styles.yellowCircle} onClick={() => handleColorChange("yellow")} />
              <div className={styles.greenCircle} onClick={() => handleColorChange("green")} />
              <div className={styles.blueCircle} onClick={() => handleColorChange("blue")} />
              <div className={styles.purpleCircle} onClick={() => handleColorChange("purple")} />
              <div className={styles.pinkCircle} onClick={() => handleColorChange("pink")} />
            </div>
          </div>

          <div className={styles.documentOptions}>
            <button className={styles.optionBtn}>
              <img 
                src="/images/File.png" 
                alt="PDF 변환" 
                className={styles.optionIcon} 
              />
              PDF 변환
            </button>
            <button className={styles.optionBtn}>
              <img 
                src="/images/delete.png" 
                alt="삭제" 
                className={styles.optionIcon} 
              />
              삭제
            </button>
            <button className={styles.optionBtn}>
              <img 
                src="/images/download.png" 
                alt="공유하기" 
                className={styles.optionIcon} 
              />
              공유하기
            </button>
          </div>
        </aside>

        {/* 폴더 목록 (CSS Grid) */}
        <section className={styles.folderGrid}>
          {folderList.map((folder) => (
            <div
              key={folder.id}
              className={styles.folderItem}
              onClick={() => setSelectedFolder(folder.name)}
              onDoubleClick={() => handleFolderClick(folder)}
            >
              <img
                src={folderIcons[folder.color]}
                alt={`${folder.color} folder`}
                className={styles.folderIcon}
              />
              <p className={styles.folderName}>{folder.name}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
