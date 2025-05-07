// src/components/meeting/Whiteboard.tsx
import React, { useState, useRef } from "react";
import axios from "@/utils/axiosInstance";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import "@/styles/meeting/Whiteboard.css";

interface WhiteboardProps {
  meetingId: string;
  onShareToggle: (stream: MediaStream | null) => void;
}

export default function Whiteboard({
  meetingId,
  onShareToggle,
}: WhiteboardProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const toggleShare = async () => {
    if (!editorRef.current) return;
    try {
      if (!isSharing) {
        // 공유 시작 API 호출
        await axios.post(`/whiteboard/start/${meetingId}`);
        // 내부 canvas 찾아서 스트림 전달
        const canvas = editorRef.current.querySelector("canvas");
        if (canvas instanceof HTMLCanvasElement) {
          onShareToggle(canvas.captureStream(30));
        }
      } else {
        // 공유 종료 API 호출
        await axios.post(`/whiteboard/end/${meetingId}`);
        onShareToggle(null);
      }
      setIsSharing((s) => !s);
    } catch {
      alert("화이트보드 공유 요청에 실패했습니다.");
    }
  };

  return (
    <>
    <div className="wb-placeholder-list">
        <button className="wb-placeholder-arrow">&lt;</button>
        <div className="wb-placeholder-items">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="wb-placeholder-box" />
          ))}
        </div>
        <button className="wb-placeholder-arrow">&gt;</button>
      </div>
      {/* 화이트보드 컨테이너 */}
      <div className="whiteboard-container">
        <div ref={editorRef} className="tldraw__editor">
          <Tldraw persistenceKey={`meeting-${meetingId}`} />
        </div>
      </div>

      {/* 공유 토글 버튼 
      <button
        onClick={toggleShare}
        className={
          isSharing
            ? "whiteboard-toggle-btn sharing"
            : "whiteboard-toggle-btn"
        }
      >
        {isSharing ? "화이트보드 공유 중지" : "화이트보드 공유 시작"}
      </button>*/}
    </>
  );
}
