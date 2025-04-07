import { useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { Home, Video, FileText, Search, ChevronLeft, ChevronRight, LogOut } from "lucide-react";//search 나중에 추가
import styles from "../styles/documents.module.scss";       // documents.module.scss
import { useUser } from "../../hooks/useUser";
import { getProfileImageUrl } from "../../utils/getProfileImageUrl";

interface FolderDetailProps {
  selected: string;
  navigate: NavigateFunction;
}

/** 파일 데이터 타입 */
interface FileItem {
  id: number;
  name: string;
  type: string; // "docx", "pdf", "image", "txt", etc.
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
  // URL 파라미터로 폴더ID를 가져올 수 있음 (예: useParams), 여기서는 생략
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
  

  return (
    <div className="container">
      {/* 첫 번째 줄: 상단바 */}
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
        <div className="user-profile">
        {user?.profile_image ? (
            <img src={getProfileImageUrl(user?.profile_image)} style={{ width: "2.1vw", height: "2.1vw", borderRadius: "10px", cursor: "pointer"}} onClick={() => navigate("/settings")} />
            ): (
          <div style={{ width: "2.1vw", height: "2.1vw", borderRadius: "10px", cursor: "default"}} />
        )}</div></div>
      </header>

    {/* 두 번째 줄: 화살표(뒤로, 앞으로) + 폴더 아이콘 + 경로 + 검색창 */}
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

  {/* 오른쪽: "문서 검색" 텍스트 + 돋보기 아이콘 */}
  <div className={styles.rightSection}>
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
        {/* 사이드바: 선택된 파일 정보 표시 */}
        <aside className={styles.sidebar}>
          {selectedFile ? (
            <div className={styles.selectedFileDisplay}>
              <img
                src={fileIcons[selectedFile.type] || "/images/default.png"}
                alt={`${selectedFile.type} file`}
                className={styles.selectedFileIcon}
              />
              <h2 className={styles.fileTitle}>{selectedFile.name}</h2>
            </div>
          ) : (
            <h2 className={styles.fileTitle}>파일 선택</h2>
          )}

          {/* 나머지 사이드바 정보(예: 파일 정보, 색상 변경, 옵션 등) */}
          <div className={styles.info}>
            <h4>정보</h4>
          </div>
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
              <div className={styles.redCircle} />
              <div className={styles.yellowCircle} />
              <div className={styles.greenCircle} />
              <div className={styles.blueCircle} />
              <div className={styles.purpleCircle} />
              <div className={styles.pinkCircle} />
            </div>
          </div>

          <div className={styles.documentOptions}>
            <button className={styles.optionBtn}>
              <img src="/images/doc_pdf.png" alt="PDF 변환" className={styles.optionIcon} />
            </button>
            <button className={styles.optionBtn} >
              <img src="/images/doc_del.png" alt="삭제" className={styles.optionIcon} />
            </button>
            <button className={styles.optionBtn} >
              <img src="/images/doc_down.png" alt="다운받기" className={styles.optionIcon} />
            </button>
          </div>
        </aside>

        {/* 파일 목록: 파일들을 그리드로 표시 (파일 클릭 시 사이드바 업데이트) */}
        <section className={styles.fileGrid}>
          {fileList.map((file) => (
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
              <p className={styles.fileName}>{file.name}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
