import React, { useState } from "react";
import "./Card.css";

interface ToDoProps {
  task: string;
  time: string;
  completed: boolean;
}

export const ToDoList: React.FC<ToDoProps> = ({ task, time, completed }) => {
  const [checked, setChecked] = useState(completed);

  return (
    <div className="todo-card">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <div className="todo-content">
        <span className="todo-time">{time}</span>
        <span className="meeting-title">{task}</span>
      </div>
    </div>
  );
};

export const useTodoList = () => {
  const [todos, setTodos] = useState<ToDoProps[]>([
    { time: "12:00", task: "다음 회의 일정 잡기", completed: true },
    { time: "14:00", task: "2시 API 명세서 미팅", completed: false },
  ]);

  // 새로운 To-Do 항목을 추가하는 함수
  const addTodo = (task: string, time: string) => {
    const newTodo = { time, task, completed: false };
    setTodos((prevTodos) => [...prevTodos, newTodo]); // 기존 목록에 추가
  };

  // todos와 addTodo 반환
  return { todos, addTodo };
};