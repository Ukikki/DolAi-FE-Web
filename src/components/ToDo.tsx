// src/components/ToDo.tsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "../utils/axiosInstance";
import DeleteTodoModal from "../components/modal/DeleteTodoModal";
import "./Card.css";

interface ToDoProps {
  id: number;
  task: string;
  time: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

type ToDoListProps = ToDoProps & {
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: ToDoProps["status"]) => void;
};

export const ToDoList: React.FC<ToDoListProps> = ({
  id,
  task,
  time,
  status: initialStatus,
  onDelete,
  onStatusChange,
}) => {
  // 초기 statusIdx: IN_PROGRESS→1, COMPLETED→2, 나머지→0
  const [statusIdx, setStatusIdx] = useState<number>(
    initialStatus === "IN_PROGRESS" ? 1 :
    initialStatus === "COMPLETED"   ? 2 : 0
  );

  const colors = ["#E0E0E0", "#FFC5C6", "#ABD7FF"];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuPos, setMenuPos]                 = useState<{ x:number; y:number } | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // 우클릭 → 삭제 모달 열기
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteConfirm(true);
  };
  const handleConfirmDelete = () => {
    onDelete(id);
    setShowDeleteConfirm(false);
  };
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  // 상태 아이콘 클릭 → 메뉴 토글
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!statusRef.current) return;
    const rect = statusRef.current.getBoundingClientRect();
    setMenuPos(prev => prev ? null : { x: rect.left, y: rect.bottom + window.scrollY });
  };

  // 상태 선택
  const handleSelect = async (newStatus: ToDoProps["status"]) => {
    try {
      await axios.patch(`/todo/${id}/status`, { status: newStatus });
      const idx = ["PENDING", "IN_PROGRESS", "COMPLETED"].indexOf(newStatus);
      setStatusIdx(idx);
      onStatusChange(id, newStatus);
    } catch (err) {
      console.error("상태 변경 실패:", err);
    }
  };
  

  // 바깥 클릭 → 메뉴 닫기
  useEffect(() => {
    const onClickOutside = () => setMenuPos(null);
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const STATUS_ITEMS: {
    key: ToDoProps["status"];
    img: string;
    style: React.CSSProperties;
  }[] = [
    {
      key: "PENDING",
      img: "/images/pending.png",
      style: { width: "5.1vw", height: "1.8vw" },
    },
    {
      key: "IN_PROGRESS",
      img: "/images/progress.png",
      style: { width: "4.8vw", height: "1.8vw" },
    },
    {
      key: "COMPLETED",
      img: "/images/completed.png",
      style: { width: "4.1vw", height: "1.8vw" },
    },
  ] as const;

  // 메뉴를 body 에 포탈로 렌더링 (이미지만)
  const menuPortal = menuPos && createPortal(
    <div
      className="status-menu"
      style={{ top: menuPos.y, left: menuPos.x, position: "absolute" }}
    >
      {STATUS_ITEMS.map(({ key, img, style }) => (
        <div
          key={key}
          onClick={() => handleSelect(key as ToDoProps["status"])}
          className="status-button"
        >
          <img src={img} alt={key} style={style} />
        </div>
      ))}
    </div>,
    document.body
  );

  return (
    <>
      <div className="todo-card" onContextMenu={handleContextMenu}>
        <div
          ref={statusRef}
          className="todo-status"
          onClick={handleStatusClick}
          style={{
            backgroundColor: colors[statusIdx],
          }}
        >
        </div>
        <div className="todo-content">
        <span className="todo-time">{time}</span>
          <span className="meeting-title">{task}</span>
          
        </div>
      </div>
      {menuPortal}
      {showDeleteConfirm && (
        <DeleteTodoModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete} message={``}        />
      )}
    </>
  );
};

export const useTodoList = () => {
  const [todos, setTodos] = useState<ToDoProps[]>([]);

  // 로컬 ISO 포맷
  const getCurrentLocalIso = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset*60000)
      .toISOString()
      .slice(0,19);
  };

  // 마운트 시 서버 GET → 정확히 매핑
  useEffect(() => {
    const token = localStorage.getItem("jwt"); // ✅ 로그인 여부 판단
    if (!token) return; // ❗로그인 안 했으면 요청 안 함

    axios
      .get<{ data: Array<{ id:number; title:string; status:string; dueDate?:string }> }>("/todo")
      .then(res => {
        const mapped = res.data.data.map(item => {
          // 1) 대소문자 구분 없이 비교하기 위해 항상 대문자로 바꿔줍니다.
          const raw = item.status.toUpperCase();
  
          let status: ToDoProps["status"];
          if (raw === "IN_PROGRESS") {
            status = "IN_PROGRESS";
          } else if (raw === "COMPLETED" || raw === "DONE") {
            status = "COMPLETED";
          } else {
            status = "PENDING";
          }

          return {
            id:     item.id,
            task:   item.title,
            time:   item.dueDate?.replace("T"," ").slice(0,16) ?? "",
            status,
          };
        });
  
        setTodos(mapped);
      })
      .catch(err => console.error("할 일 목록 로드 실패:", err));
  }, []);

  const addTodo = async (task: string, time: string) => {
    try {
      const payload: any = { title: task };
      payload.dueDate = time ? `${time}:00` : getCurrentLocalIso();
      const res = await axios.post<{ data:{ id:number } }>("/todo", payload);
      setTodos(prev => [
        ...prev,
        {
          id:     res.data.data.id,
          task,
          time:   payload.dueDate.replace("T"," ").slice(0,16),
          status: "PENDING",
        }
      ]);
    } catch (err) {
      console.error("할 일 추가 실패:", err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await axios.delete(`/todo/${id}`);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("할 일 삭제 실패:", err);
    }
  };

  const updateStatus = (id: number, newStatus: ToDoProps["status"]) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, status: newStatus } : t)
    );
  };

  return { todos, addTodo, deleteTodo, updateStatus };
};
