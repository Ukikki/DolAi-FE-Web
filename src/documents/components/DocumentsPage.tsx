import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { Home, Video, FileText, Search } from "lucide-react";
import styles from "../styles/documents.module.scss";
import SortMenu from "./SortMenu";
import { useUser } from "@/hooks/user/useUser";
import { getProfileImageUrl } from "@/utils/getProfileImageUrl";
import { useNavigateMeeting } from "@/hooks/useNavigateMeeting";
import CreateMeeting from "@/components/modal/CreateMeeting";
import axios from "@/utils/axiosInstance";

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

interface DirectoryMetaData {
  type: string;
  size: string;
  meetingTitle?: string;
  participants: { name: string; email: string }[];
  createdAt: string;
  updatedAt: string;
}


const initialFolders: Folder[] = [];

const folderIcons: Record<string, string> = {
  pink: "/images/pinkfolder.png",
  red: "/images/redfolder.png",
  yellow: "/images/yellowfolder.png",
  green: "/images/greenfolder.png",
  blue: "/images/bluefolder.png",
  purple: "/images/purplefolder.png",
};

export default function DocumentsPage({ selected, navigate }: DocumentsProps) {
  // 상태 선언
  const [folderList, setFolderList] = useState<Folder[]>(() => {
    const stored = localStorage.getItem("folderList");
    return stored ? JSON.parse(stored) : initialFolders;
  });

  const [directoryMeta, setDirectoryMeta] = useState<DirectoryMetaData | null>(null);
  
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
// 변경
type SortKey = "name" | "createdAt" | "updatedAt" | "size";
const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState<string>("");

  const selectedFolderObj = folderList.find((f) => f.id === selectedFolderId);
  const { user } = useUser();
  const { handleCreateMeeting } = useNavigateMeeting();
  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  // 로컬 스토리지 동기화
  useEffect(() => {
    localStorage.setItem("folderList", JSON.stringify(folderList));
  }, [folderList]);

  // 1) 서버에서 폴더 목록 불러오기
  // 서버에서 폴더 목록을 불러오는 함수
  const fetchFolders = () => {
    axios
      .get<{ data: Array<{ directoryId: number; name: string; parentDirectoryId: number | null; color?: string }> }>(
        "/directories"
      )
      .then((res) => {
        const items = res.data.data;
        const folders: Folder[] = items.map((item) => ({
          id: item.directoryId,
          name: item.name,
          parentDirectoryId: item.parentDirectoryId?.toString() ?? null,
          type: "PERSONAL",
          color: (item.color ?? "blue").toLowerCase(),
        }));
        setFolderList(folders);
        localStorage.setItem("folderList", JSON.stringify(folders));
      })
      .catch((err) => {
        console.error("폴더 불러오기 실패:", err);
      });
  };

  useEffect(() => {
    if (!selectedFolderId) {
      setDirectoryMeta(null);
      return;
    }
  
    axios
      .get(`/directory/${selectedFolderId}/metadata`)
      .then((res) => {
        setDirectoryMeta(res.data.data);
      })
      .catch((err) => {
        console.error("디렉터리 메타데이터 조회 실패:", err);
        setDirectoryMeta(null);
      });
  }, [selectedFolderId]);
  

  // 2) 마운트 시, 폴더 로드
  useEffect(() => {
    fetchFolders();
  }, []);

  // 3) 컨텍스트 메뉴
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };


  // 새 폴더 추가
  const handleAddFolder = () => {
    setShowAddFolderModal(true);
    setContextMenuPos(null);
  };
  const handleConfirmAddFolder = () => {
    if (!newFolderName.trim()) {
      setShowAddFolderModal(false);
      return;
    }
    axios
      .post("/directories", {
        name: newFolderName.trim(),
        parentDirectoryId: null,
        type: "PERSONAL",
        meetingId: null,
        
      })
      .then((res) => {
        const item = res.data;
        console.log("📦 /directories 응답 전체:", res);
        console.log("▶️ res.data:", res.data);
        setFolderList((prev) => [
          ...prev,
          {
            id: item.directoryId,
            name: item.name,
            parentDirectoryId: item.parentDirectoryId?.toString() ?? null,
            type: "PERSONAL",
            color: item.color, 
          },
        ]);
      })
      .catch((err) => {
        console.error("폴더 추가 실패:", err);
      })
      .finally(() => {
        setShowAddFolderModal(false);
        setNewFolderName("");
      });
  };

  // 정렬 변경
  const handleSortChange = (newKey: string, newOrder: string) => {
    setSortKey(newKey as "name");
    setSortOrder(newOrder as "asc" | "desc");
  };

  

   // 삭제 요청 핸들러: 모달 열기
   function handleDeleteFolder() {
    if (!selectedFolderObj) {
     //alert("삭제할 폴더가 선택되지 않았습니다.");
      return;
    }
    setToDeleteId(selectedFolderObj.id);
    setShowDeleteModal(true);
  }

   // 모달에서 실제 삭제 실행
   function confirmDelete() {
    if (toDeleteId == null) return;
    axios
      .delete(`/directories/${toDeleteId}`)
      .then((res) => {
        //alert(res.data.message);
        setFolderList((prev) => prev.filter((f) => f.id !== toDeleteId));
        setSelectedFolderId(null);
      })
      .catch((err) => {
        console.error("폴더 삭제 실패:", err);
        //alert("폴더 삭제에 실패했습니다.");
      })
      .finally(() => {
        setShowDeleteModal(false);
        setToDeleteId(null);
      });
  }

  // 모달 취소
  function cancelDelete() {
    setShowDeleteModal(false);
    setToDeleteId(null);
  }

  // 폴더 색상 변경
  function handleColorChange(newColor: string) {
    if (!selectedFolderObj) {
      //alert("폴더가 선택되지 않았습니다.");
      return;
    }
    const prevColor = selectedFolderObj.color;
    setFolderList((prev) =>
      prev.map((f) =>
        f.id === selectedFolderObj.id
          ? { ...f, color: newColor }
          : f
      )
    );
    axios
      .patch(`/directories/${selectedFolderObj.id}/color`, { color: newColor })
      .catch((err) => {
        console.error("색상 변경 실패:", err);
        //alert("색상 변경에 실패했습니다.");
        // 롤백
        setFolderList((prev) =>
          prev.map((f) =>
            f.id === selectedFolderObj.id
              ? { ...f, color: prevColor || "blue" }
              : f
          )
        );
      });
  }

  // 폴더 이름 변경
  function handleRenameFolder(newName: string) {
    if (!selectedFolderObj) return;
    axios
      .patch(`/directories/${selectedFolderObj.id}/name`, { name: newName })
      .then(() => {
        setFolderList((prev) =>
          prev.map((f) =>
            f.id === selectedFolderObj.id
              ? { ...f, name: newName }
              : f
          )
        );
        //alert("이름이 변경되었습니다!");
      })
      .catch((err) => {
        console.error("이름 변경 실패:", err);
        //alert("이름 변경에 실패했습니다.");
      });
  }

  // 빈 zip 다운로드
  function handleDownloadFolder() {
    if (!selectedFolderObj) {
      //alert("다운받을 폴더가 선택되지 않았습니다.");
      return;
    }
    const header = new Uint8Array([0x50, 0x4b, 0x05, 0x06, ...new Array(16).fill(0)]);
    const blob = new Blob([header], { type: "application/zip" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedFolderObj.name}.zip`;
    link.click();
  }

  // 검색 + 정렬
  const filteredFolders: Folder[] = folderList.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedFolders: Folder[] = filteredFolders.slice().sort((a, b) => {
    let compare = 0;
  
    if (sortKey === "name") {
      compare = a.name.localeCompare(b.name);
    } else {
      const aMeta = a.id === selectedFolderId ? directoryMeta : null;
      const bMeta = b.id === selectedFolderId ? directoryMeta : null;
  
      if (sortKey === "createdAt" || sortKey === "updatedAt") {
        const aDate = aMeta?.[sortKey] ?? "";
        const bDate = bMeta?.[sortKey] ?? "";
        compare = aDate.localeCompare(bDate);
      } else if (sortKey === "size") {
        const aSize = parseFloat(aMeta?.size ?? "0");
        const bSize = parseFloat(bMeta?.size ?? "0");
        compare = aSize - bSize;
      }
    }
  
    return sortOrder === "asc" ? compare : -compare;
  });
  

  return (
    <div className="container" onClick={() => setContextMenuPos(null)}>
      {/* 네비게이션 바 */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="./images/main_logo.png" alt="DolAi Logo" />
        </div>
        <div className="navbar-center">
          <nav className="navbar-icons">
            <div
              className={`icon-container ${selected === "home" ? "selected" : ""}`}
              onClick={() => navigate("/")}
            >
              <Home style={{ width: "1.72vw", height: "1.72vw", cursor: "pointer" }} />
            </div>
            {showModal && (
              <CreateMeeting
                onCreate={(title, startTime) =>
                  handleCreateMeeting(title, startTime, setShowModal)
                }
                onClose={() => setShowModal(false)}
              />
            )}
            <div
              className={`icon-container ${selected === "video" ? "selected" : ""}`}
              onClick={() => setShowModal(true)}
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
              <img
                src={getProfileImageUrl(user.profile_image)}
                style={{ width: "2.1vw", borderRadius: "10px", cursor: "pointer" }}
                onClick={() => navigate("/settings")}
              />
            ) : (
              <div style={{ width: "2.1vw", borderRadius: "10px", cursor: "default" }} />
            )}
          </div>
        </div>
      </header>

      {/* 두 번째 바 */}
      <div className={styles.navbarSecondRow}>
        <div className={styles.leftSection}>
          <img src="/images/doc_move_left.png" className={styles.arrowIcon} onClick={() => navigate(-1)} />
          <img src="/images/doc_move_right.png" className={styles.arrowIcon} onClick={() => navigate(1)} />
          <div className={styles.path}>
  <img src="/images/bluefolder.png" alt="Docs folder" className={styles.docsFolderIcon} />
  <span className={styles.pathText}>
    Docs &gt; {selectedFolderObj ? selectedFolderObj.name : ""}
  </span>
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

<div className={styles.info}>폴더 정보</div>
<div className={styles.fileInfo}>
  <div className={styles.infoRow}>
    <span className={styles.label}>유형</span>
    <span className={styles.value}>{directoryMeta?.type ?? "-"}</span>
  </div>
  <div className={styles.infoRow}>
    <span className={styles.label}>크기</span>
    <span className={styles.value}>{directoryMeta?.size ?? "-"}</span>
  </div>
  <div className={styles.infoRow}>
    <span className={styles.label}>생성일</span>
    <span className={styles.value}>{directoryMeta?.createdAt ?? "-"}</span>
  </div>
  <div className={styles.infoRow}>
    <span className={styles.label}>수정일</span>
    <span className={styles.value}>{directoryMeta?.updatedAt ?? "-"}</span>
  </div>
  <div className={styles.infoRow}>
    <span className={styles.label}>참여자</span>
    <span className={styles.value}>
      {directoryMeta?.participants?.length
        ? directoryMeta.participants.map((p) => p.name).join(", ")
        : "-"}
    </span>
  </div>
</div>



          <div className={styles.info}>색상</div>
          <div className={styles.colorOptions}>
            {Object.keys(folderIcons).map((color) => (
              <div
                key={color}
                className={styles[`${color}Circle`]}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>

          <div className={styles.documentOptions}>
            <img src="/images/doc_pdf.png" alt="PDF 변환" className={styles.optionIcon} />
            <img src="/images/doc_del.png" alt="삭제" className={styles.optionIcon} onClick={handleDeleteFolder} />
            <img src="/images/doc_down.png" alt="다운받기" className={styles.optionIcon} onClick={handleDownloadFolder} />
          </div>
        </aside>

        {/* 폴더 그리드 */}
        <section className={styles.folderGrid} onContextMenu={handleContextMenu}>
          {sortedFolders.map((folder) => (
            <div
              key={folder.id}
              className={styles.folderItem}
              onClick={() => setSelectedFolderId(folder.id)}
              onDoubleClick={() => {
                setSelectedFolderId(folder.id);
                navigate(`/folder/${folder.id}`); // ✅ 이걸로 변경
              }}
              
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
              <span className={styles.folderName}>{folder.name}</span>
            </div>
          ))}
        </section>

        {/* 우클릭 메뉴 */}
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
              <h2 className={styles.modalTitle}>폴더 이름 바꾸기</h2>
              <input
                type="text"
                className={styles.modalInput}
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="새 이름을 입력하세요"
              />
              <div className={styles.modalButtons}>
                <button className={styles.cancelButton} onClick={() => setShowRenameModal(false)}>
                  취소
                </button>
                <button
                  className={styles.confirmButton}
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

        {/* 삭제 모달 */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>폴더 삭제</h2>
            <p>정말 이 폴더를 삭제하시겠습니까? 모든 문서가 함께 삭제됩니다.</p>
            <div className={styles.modalButtons}>
              <button className={styles.cancelButton} onClick={cancelDelete}>
                취소
              </button>
              <button className={styles.confirmButton} onClick={confirmDelete}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

       {/* 새 폴더 추가 모달 */}
{showAddFolderModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h2 className={styles.modalTitle}>새 폴더 추가</h2>
      <input
        type="text"
        className={styles.modalInput}
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="폴더 이름을 입력하세요"
      />
      <div className={styles.modalButtons}>
        <button
          className={styles.cancelButton}
          onClick={() => {
            setShowAddFolderModal(false);
            setNewFolderName("");
          }}
        >
          취소
        </button>
        <button
          className={styles.confirmButton}
          onClick={handleConfirmAddFolder}
        >
          추가
        </button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}
