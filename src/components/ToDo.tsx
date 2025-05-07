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

  const colors = ["#B2B2B2", "#FFC0CB", "#87CEEB"];
  const iconUrls = [
    "/images/pending.png",   // PENDING
    "/images/progress.png",  // IN_PROGRESS
    "/images/completed.png", // COMPLETED
  ];

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

  // 메뉴에서 선택 → 서버에 PATCH, 로컬에도 반영
  const handleSelect = async (idx: number) => {
    const newStatus = ["PENDING","IN_PROGRESS","COMPLETED"][idx] as ToDoProps["status"];
    try {
      await axios.patch(`/todo/${id}/status`, { status: newStatus });
      setStatusIdx(idx);
      onStatusChange(id, newStatus);
    } catch (err) {
      console.error("상태 변경 실패:", err);
    } finally {
      setMenuPos(null);
    }
  };

  // 바깥 클릭 → 메뉴 닫기
  useEffect(() => {
    const onClickOutside = () => setMenuPos(null);
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  // 메뉴를 body 에 포탈로 렌더링 (이미지만)
  const menuPortal = menuPos && createPortal(
    <div className="status-menu" style={{
     width:"140px",
      height:"175px",
      position:    "absolute",
      alignItems:    "flex-start",  
      top:         menuPos.y,
      left:        menuPos.x,
      display:     "flex",
      flexDirection:"column",
      background:  "#fff",
      border:      "1px solid #ccc",
      borderRadius:4,
      boxShadow:   "0 2px 6px rgba(0,0,0,0.15)",
      zIndex:      1000,
    }}>
      {iconUrls.map((url, idx) => (
        <div key={idx}
          onClick={() => handleSelect(idx)}
          style={{
            padding:    "4px",
            cursor:     "pointer",
            //background: idx === statusIdx ? "#f0f0f0" : "transparent",
            
            textAlign:  "left", 
          }}
        >
          <img src={url} alt={`status-${idx}`} style={{ width: 97, height: 35, marginTop: 8   }} />
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
            position:        "relative",
            cursor:          "pointer",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           20,
            height:          20,
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
    axios
      .get<{ data: Array<{ id:number; title:string; status:string; dueDate?:string }> }>("/todo")
      .then(res => {
        console.log("🔍 [useTodoList] raw data:", res.data.data);
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
  
          console.log(
            `→ id=${item.id} status(raw)=${item.status} → mapped=${status}`
          );
  
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
