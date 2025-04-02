import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { Home, Video, FileText, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import styles from "../styles/documents.module.scss";
import SortMenu from "./SortMenu";
import { handleSocialLogout } from "../../utils/logout";

interface DocumentsProps {
  selected: string;
  navigate: NavigateFunction;
}

interface Folder {
  // 백엔드에서 반환하는 폴더 데이터 구조에 맞게 id, name, parentDirectoryId, type 등 사용
  id: Int16Array;
  name: string;
  parentDirectoryId: string | null;
  type: "PERSONAL" | "SHARED";
  // UI에서 폴더 아이콘을 사용하기 위한 색상 (백엔드에서 제공하지 않는 경우 기본값으로 설정)
  color?: string;
}

// 초기 폴더 목록: localStorage에 저장된 데이터가 없으면 빈 배열 사용
const initialFolders: Folder[] = [];

const folderIcons: Record<string, string> = {
  red: "/images/redfolder.png",
  yellow: "/images/yellowfolder.png",
  green: "/images/greenfolder.png",
  blue: "/images/bluefolder.png",
  purple: "/images/purplefolder.png",
  pink: "/images/pinkfolder.png",
};

export default function DocumentsPage({ selected, navigate }: DocumentsProps) {
  // localStorage에서 폴더 목록 불러오기 (없으면 initialFolders 사용)
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

  // 백엔드에서 폴더(디렉토리) 데이터를 가져오는 useEffect
  useEffect(() => {
    // 최상위 디렉토리(부모 디렉토리가 없을 경우) 데이터를 가져오기 위해 parentDirectoryId를 전달하지 않음
    fetch("/directories")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // 백엔드가 SuccessDataResponse 형식으로 응답한다고 가정(실제 응답에 맞게 수정)
        const directories = data.data;
        setFolderList(directories);
      })
      .catch((error) => {
        console.error("폴더를 불러오는데 실패했습니다:", error);
      });
  }, []);

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

  // 모달에서 "추가" 버튼 클릭 시 새 폴더 생성 후 백엔드에 저장
  const handleConfirmAddFolder = () => {
    if (newFolderName.trim() !== "") {
      // 새 폴더 데이터를 객체로 생성 (필요한 다른 필드도 추가 가능)
      const newFolderData = {
        name: newFolderName.trim(),
        parentDirectoryId: null, // 최상위 디렉토리인 경우 null
        type: "PERSONAL",        // 공유 폴더일 경우 "SHARED"로 변경
        meetingId: null,
      };
  
      // POST 요청을 통해 백엔드의 /directories 엔드포인트에 새 폴더 정보를 전송
      fetch("/directories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(newFolderData),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // 백엔드에서 새로 생성한 폴더 정보를 응답으로 보낸다고 가정합니다.
          // 응답 구조에 따라 data 또는 data.data 를 사용해야 할 수 있습니다.
          const createdFolder: Folder = {
            ...data.data,       // 예를 들어, 응답이 { data: { ... } } 형식인 경우
            color: "blue",      // UI에서 사용할 기본 색상 지정 (필요에 따라 변경)
          };
          // 상태 업데이트: 기존 폴더 목록에 새 폴더 추가
          setFolderList([...folderList, createdFolder]);
        })
        .catch((error) => {
          console.error("폴더 추가 실패:", error);
        });
    }
    // 모달 닫기 및 입력값 초기화
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
    // 선택한 폴더의 color 값을 업데이트하는 로직 추가 (백엔드와 연동 시 별도 API 호출 필요)
    const updatedFolders = folderList.map((folder) =>
      folder.id === selectedFolderObj.id ? { ...folder, color: newColor } : folder
    );
    setFolderList(updatedFolders);
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
  const filteredFolders = folderList.filter(
    (folder) => folder.name && folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedFolders = filteredFolders.slice().sort((a, b) => {
    let compare = a.name.localeCompare(b.name);
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
                src={folderIcons[selectedFolderObj.color || "blue"]}
                alt={`${selectedFolderObj.color || "blue"} folder`}
                className={styles.selectedFolderIcon}
              />
              <h2 className={styles.folderTitle}>{selectedFolderObj.name}</h2>
              <div className={styles.sidebarButtons}>
                {/* 추가 버튼 구현 가능 */}
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
              <img src="/images/doc_pdf.png" alt="PDF 변환" className={styles.optionIcon} />
            </button>
            <button className={styles.optionBtn} onClick={handleDeleteFolder}>
              <img src="/images/doc_del.png" alt="삭제" className={styles.optionIcon} />
            </button>
            <button className={styles.optionBtn} onClick={handleDownloadFolder}>
              <img src="/images/doc_down.png" alt="다운받기" className={styles.optionIcon} />
            </button>
          </div>
        </aside>

        <section className={styles.folderGrid} onContextMenu={handleContextMenu}>
          {sortedFolders.map((folder) => (
            <div
              key={String(folder.id) || folder.name} 
              className={styles.folderItem}
              onClick={() => setSelectedFolder(folder.name)}
              onDoubleClick={() => handleFolderClick(folder)}
            >
              <img
                src={folderIcons[folder.color || "blue"]}
                alt={`${folder.color || "blue"} folder`}
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
            style={{ top: contextMenuPos.y, left: contextMenuPos.x, position: "absolute" }}
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
