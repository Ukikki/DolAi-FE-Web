import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import {
  Home, Video, FileText,
  ChevronLeft, ChevronRight
} from "lucide-react";
import styles from "../styles/documents.module.scss";
import SortMenu from "./SortMenu";
import { useUser } from "../../hooks/useUser";
import { getProfileImageUrl } from "../../utils/getProfileImageUrl";

interface DocumentsProps {
  selected: string;
  navigate: NavigateFunction;
}

interface Folder {
  id: number;
  name: string;
  parentDirectoryId: string | null;
  type: "PERSONAL" | "SHARED";
  color?: string;
}

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
  // 폴더 리스트 및 관련 상태
  const [folderList, setFolderList] = useState<Folder[]>(() => {
    const stored = localStorage.getItem("folderList");
    return stored ? JSON.parse(stored) : initialFolders;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // 모달 관련 상태
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState("");

  const selectedFolderObj = folderList.find((f) => f.id === selectedFolderId);
  const { user } = useUser(); // 로그인 상태 함수

  // 폴더 리스트를 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("folderList", JSON.stringify(folderList));
  }, [folderList]);

  // 서버에서 폴더 데이터 불러오기
  useEffect(() => {
    fetch("/directories")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("불러온 디렉터리 데이터:", data);
        const folders = data.data.map((item: any) => ({
          id: item.directoryId, // id 매핑
          name: item.name,
          parentDirectoryId: item.parentDirectoryId ?? null,
          type: "PERSONAL",
          color: "blue", // 기본 색상
        }));
        setFolderList(folders);
      })
      .catch((error) => {
        console.error("폴더 불러오기 실패:", error);
      });
  }, []);

  // 컨텍스트 메뉴 핸들러 (화면 어딘가 클릭 시 메뉴 숨김)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // 폴더 추가 모달 열기
  const handleAddFolder = () => {
    setShowAddFolderModal(true);
    setContextMenuPos(null);
  };

  // 폴더 추가 확인
  const handleConfirmAddFolder = () => {
    if (newFolderName.trim() !== "") {
      const newFolderData = {
        name: newFolderName.trim(),
        parentDirectoryId: null,
        type: "PERSONAL",
        meetingId: null,
      };

      fetch("/directories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(newFolderData),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const createdFolder: Folder = {
            ...data.data,
            color: "blue",
          };
          setFolderList([...folderList, createdFolder]);
        })
        .catch((error) => {
          console.error("폴더 추가 실패:", error);
        });
    }
    setShowAddFolderModal(false);
    setNewFolderName("");
  };

  // 정렬 상태 변경
  function handleSortChange(newSortKey: string, newSortOrder: string) {
    setSortKey(newSortKey);
    setSortOrder(newSortOrder);
  }

  // 폴더 삭제
  function handleDeleteFolder() {
    if (!selectedFolderObj) {
      alert("삭제할 폴더가 선택되지 않았습니다.");
      return;
    }
    if (window.confirm(`정말 ${selectedFolderObj.name} 디렉터리를 삭제하시겠습니까? 해당 디렉터리 안의 모든 문서도 함께 삭제됩니다.`)) {
      console.log("삭제 요청 ID:", selectedFolderObj.id);
      fetch(`/directories/${selectedFolderObj.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          alert(data.message);
          const updatedFolders = folderList.filter((f) => f.id !== selectedFolderObj.id);
          setFolderList(updatedFolders);
          setSelectedFolderId(null);
        })
        .catch((error) => {
          console.error("폴더 삭제 실패:", error);
          alert("폴더 삭제에 실패했습니다. 다시 시도해주세요.");
        });
    }
  }

  // 폴더 색상 변경
  function handleColorChange(newColor: string) {
    if (!selectedFolderObj) {
      alert("폴더가 선택되지 않았습니다.");
      return;
    }
    const updatedFolders = folderList.map((folder) =>
      folder.id === selectedFolderObj.id ? { ...folder, color: newColor } : folder
    );
    setFolderList(updatedFolders);
    fetch(`/directories/${selectedFolderObj.id}/color`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ color: newColor }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || `색상 변경 실패: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("색상 변경 성공:", data.message);
      })
      .catch((err) => {
        console.error("색상 변경 중 오류:", err.message);
        alert("색상 변경에 실패했습니다.\n" + err.message);
        const rolledBack = folderList.map((folder) =>
          folder.id === selectedFolderObj.id ? { ...folder, color: selectedFolderObj.color || "blue" } : folder
        );
        setFolderList(rolledBack);
      });
  }

  // 폴더 이름 변경
  function handleRenameFolder(newName: string) {
    if (!selectedFolderObj) return;
    fetch(`/directories/${selectedFolderObj.id}/name`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({ name: newName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("이름 변경 실패");
        return res.json();
      })
      .then((data) => {
        alert("이름이 변경되었습니다!");
        const updatedFolders = folderList.map((folder) =>
          folder.id === selectedFolderObj.id ? { ...folder, name: newName } : folder
        );
        setFolderList(updatedFolders);
      })
      .catch((err) => {
        console.error("이름 변경 중 오류:", err);
        alert("이름 변경에 실패했습니다.");
      });
  }

  // 폴더 더블클릭 시 해당 폴더로 이동
  function handleFolderClick(folder: Folder) {
    setSelectedFolderId(folder.id);
    navigate(`/folder/${encodeURIComponent(folder.name)}`);
  }

  // 폴더 다운로드 (빈 zip 파일)
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

  // 검색 및 정렬 처리
  const filteredFolders = folderList.filter((folder) =>
    folder.name && folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedFolders = filteredFolders.slice().sort((a, b) => {
    let compare = a.name.localeCompare(b.name);
    return sortOrder === "asc" ? compare : -compare;
  });

  return (
    <div className="container" onClick={() => setContextMenuPos(null)}>
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

      <div className={styles.navbarSecondRow}>
        <div className={styles.leftSection}>
          <ChevronLeft size={24} className={styles.arrowIcon} onClick={() => navigate(-1)} />
          <ChevronRight size={24} className={styles.arrowIcon} onClick={() => navigate(1)} />
          <img src="/images/bluefolder.png" alt="Docs folder" className={styles.docsFolderIcon} />
          <span className={styles.pathText}>Docs &gt;</span>
        </div>
        <div className={styles.rightSection}>
          <SortMenu sortKey={sortKey} sortOrder={sortOrder} onSortChange={handleSortChange} />
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
              {Object.keys(folderIcons).map((color) => (
                <div
                  key={color}
                  className={styles[`${color}Circle`]}
                  onClick={() => handleColorChange(color)}
                />
              ))}
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
              key={folder.id}
              className={styles.folderItem}
              onClick={() => {
                console.log("클릭된 폴더 ID:", folder.id);
                setSelectedFolderId(folder.id);
              }}
              onDoubleClick={() => handleFolderClick(folder)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedFolderId(folder.id);
                setContextMenuPos({ x: e.clientX, y: e.clientY });
              }}
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

        {/* 컨텍스트 메뉴: 오른쪽 클릭 시 폴더 추가 및 이름 바꾸기 옵션 제공 */}
        {contextMenuPos && (
          <div
            className={styles.contextMenu}
            style={{ top: contextMenuPos.y, left: contextMenuPos.x, position: "absolute" }}
          >
            <div onClick={handleAddFolder} className={styles.contextMenuItem}>
              폴더 추가
            </div>
            <div
              onClick={() => {
                setShowRenameModal(true);
                setContextMenuPos(null);
              }}
              className={styles.contextMenuItem}
            >
              이름 바꾸기
            </div>
          </div>
        )}

        {/* 이름 바꾸기 모달 */}
        {showRenameModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>폴더 이름 바꾸기</h2>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="새 이름을 입력하세요"
              />
              <div className={styles.modalButtons}>
                <button onClick={() => setShowRenameModal(false)}>취소</button>
                <button
                  onClick={() => {
                    handleRenameFolder(renameInput);
                    setShowRenameModal(false);
                    setRenameInput("");
                  }}
                >
                  변경
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 새 폴더 추가 모달 */}
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
