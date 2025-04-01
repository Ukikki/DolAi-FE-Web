import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import {
  Home,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  // 추후 수정일, 생성일, 파일 크기 등의 속성이 추가되면 필드도 함께 추가하세요.
}

const initialFolders: Folder[] = [
  { id: 1, name: "20250304", color: "yellow" },
  { id: 2, name: "red folder", color: "red" },
  { id: 3, name: "green folder", color: "green" },
  { id: 4, name: "blue folder", color: "blue" },
  { id: 5, name: "purple folder", color: "purple" },
  { id: 6, name: "pink folder", color: "pink" },
  { id: 7, name: "점심메뉴", color: "yellow" },
  { id: 8, name: "저녁메뉴", color: "red" },
  { id: 9, name: "돌아이회의", color: "green" },
  { id: 10, name: "교슈님", color: "blue" },
  { id: 11, name: "여행", color: "purple" },
  { id: 12, name: "비밀", color: "pink" },
];

const folderIcons: Record<string, string> = {
  red: "/images/redfolder.png",
  yellow: "/images/yellowfolder.png",
  green: "/images/greenfolder.png",
  blue: "/images/bluefolder.png",
  purple: "/images/purplefolder.png",
  pink: "/images/pinkfolder.png",
};

export default function DocumentsPage({ selected, navigate }: DocumentsProps) {
  // localStorage에서 폴더 목록 불러오기 (없으면 initialFolders)
  const [folderList, setFolderList] = useState<Folder[]>(() => {
    const stored = localStorage.getItem("folderList");
    return stored ? JSON.parse(stored) : initialFolders;
  });
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // 빈 영역 우클릭(폴더 추가)용 컨텍스트 메뉴 좌표
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // 정렬 상태
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // 모달(팝업) 관련: 폴더 추가
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const selectedFolderObj = folderList.find((f) => f.name === selectedFolder);

  // folderList 상태가 변경되면 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("folderList", JSON.stringify(folderList));
  }, [folderList]);

  // 빈 영역 우클릭 시: 폴더 추가 메뉴 표시
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // 빈 영역 우클릭 메뉴에서 "폴더 추가" 클릭 시 모달 표시
  const handleAddFolder = () => {
    setShowAddFolderModal(true);
    setContextMenuPos(null);
  };

  // 모달에서 "추가" 버튼 클릭 시 새 폴더 생성
  const handleConfirmAddFolder = () => {
    if (newFolderName.trim() !== "") {
      const newFolder: Folder = {
        id: folderList.length ? Math.max(...folderList.map((f) => f.id)) + 1 : 1,
        name: newFolderName.trim(),
        color: "yellow", // 기본 색상 지정 (필요시 변경 가능)
      };
      setFolderList([...folderList, newFolder]);
    }
    setShowAddFolderModal(false);
    setNewFolderName("");
  };

  // SortMenu에서 정렬 값 변경 시 호출
  function handleSortChange(newSortKey: string, newSortOrder: string) {
    setSortKey(newSortKey);
    setSortOrder(newSortOrder);
  }

  // 사이드바의 "폴더 삭제" 버튼 클릭 시, 선택된 폴더 삭제
  function handleDeleteFolder() {
    if (!selectedFolderObj) return;
    if (window.confirm(`정말 ${selectedFolderObj.name} 폴더를 삭제하시겠습니까?`)) {
      const updatedFolders = folderList.filter((f) => f.id !== selectedFolderObj.id);
      setFolderList(updatedFolders);
      setSelectedFolder(null);
    }
  }

  // 폴더 색상 변경 (예시)
  function handleColorChange(newColor: string) {
    if (!selectedFolderObj) return;
    // 선택한 폴더의 색상을 변경하는 로직 추가
  }

  // 폴더 선택 및 이동
  function handleFolderClick(folder: Folder) {
    setSelectedFolder(folder.name);
    navigate(`/folder/${encodeURIComponent(folder.name)}`);
  }

  // 다운로드: 선택된 폴더(빈 폴더)를 ZIP 파일로 다운로드
  function handleDownloadFolder() {
    if (!selectedFolderObj) {
      alert("다운받을 폴더가 선택되지 않았습니다.");
      return;
    }
    const fileName = selectedFolderObj.name;
    // 최소한의 빈 ZIP 파일 (End of central directory record 22바이트)
    const emptyZipHeader = new Uint8Array([
      0x50, 0x4B, 0x05, 0x06,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00,
    ]);
    const blob = new Blob([emptyZipHeader], { type: "application/zip" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName + ".zip";
    link.click();
  }

  // 검색어 필터링 및 정렬 처리
  const filteredFolders = folderList.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedFolders = filteredFolders.slice().sort((a, b) => {
    let compare = 0;
    if (sortKey === "name") {
      compare = a.name.localeCompare(b.name);
    } else {
      compare = a.name.localeCompare(b.name);
    }
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div
      className="container"
      onClick={() => {
        setContextMenuPos(null);
      }}
    >
      <header className="navbar">
        <img src="../images/main_logo.png" alt="DolAi Logo" />
        <nav className="navbar-icons">
          <div
            className={`icon-container ${selected === "home" ? "selected" : ""}`}
            onClick={() => navigate("/")}
          >
            <Home style={{ width: "1.71875vw", height: "1.71875vw", cursor: "pointer" }} />
          </div>
          <div
            className={`icon-container ${selected === "video" ? "selected" : ""}`}
            onClick={() => navigate("/meetings")}
          >
            <Video style={{ width: "1.71875vw", height: "1.71875vw", cursor: "pointer" }} />
          </div>
          <div
            className={`icon-container ${selected === "document" ? "selected" : ""}`}
            onClick={() => navigate("/documents")}
          >
            <FileText style={{ width: "1.71875vw", height: "1.71875vw", cursor: "pointer" }} />
          </div>
        </nav>
      </header>

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
          <span className={styles.pathText}>Docs &gt; </span>
        </div>
        <div className={styles.rightSection}>
          <SortMenu
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
          <input
            type="text"
            placeholder="문서 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchWrapper}
          />
        </div>
      </div>

      <main className="main">
        <aside className={styles.sidebar}>
          {selectedFolderObj ? (
            <div className={styles.selectedFolderDisplay}>
              <img
                src={folderIcons[selectedFolderObj.color]}
                alt={`${selectedFolderObj.color} folder`}
                className={styles.selectedFolderIcon}
              />
              <h2 className={styles.folderTitle}>{selectedFolderObj.name}</h2>
              <div className={styles.sidebarButtons}>
                
              </div>
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
              <div
                className={styles.redCircle}
                onClick={() => handleColorChange("red")}
              />
              <div
                className={styles.yellowCircle}
                onClick={() => handleColorChange("yellow")}
              />
              <div
                className={styles.greenCircle}
                onClick={() => handleColorChange("green")}
              />
              <div
                className={styles.blueCircle}
                onClick={() => handleColorChange("blue")}
              />
              <div
                className={styles.purpleCircle}
                onClick={() => handleColorChange("purple")}
              />
              <div
                className={styles.pinkCircle}
                onClick={() => handleColorChange("pink")}
              />
            </div>
          </div>
          <div className={styles.documentOptions}>
            <button className={styles.optionBtn}>
              <img
                src="/images/doc_pdf.png"
                alt="PDF 변환"
                className={styles.optionIcon}
              />
            </button>
            <button className={styles.optionBtn} onClick={handleDeleteFolder}>
              <img
                src="/images/doc_del.png"
                alt="삭제"
                className={styles.optionIcon}
              />
            </button>
            <button className={styles.optionBtn} onClick={handleDownloadFolder}>
              <img
                src="/images/doc_down.png"
                alt="다운받기"
                className={styles.optionIcon}
              />
            </button>
          </div>
        </aside>

        <section className={styles.folderGrid} onContextMenu={handleContextMenu}>
          {sortedFolders.map((folder) => (
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

        {/* 빈 영역 우클릭 시 "폴더 추가" 컨텍스트 메뉴 */}
        {contextMenuPos && (
          <div
            className={styles.contextMenu}
            style={{
              top: contextMenuPos.y,
              left: contextMenuPos.x,
              position: "absolute",
            }}
          >
            <div onClick={handleAddFolder} className={styles.contextMenuItem}>
              폴더 추가
            </div>
          </div>
        )}

        {showAddFolderModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>새 폴더 추가</h2>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="폴더 이름을 입력하세요"
              />
              <div className={styles.modalButtons}>
                <button
                  onClick={() => {
                    setShowAddFolderModal(false);
                    setNewFolderName("");
                  }}
                >
                  취소
                </button>
                <button onClick={handleConfirmAddFolder}>추가</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
