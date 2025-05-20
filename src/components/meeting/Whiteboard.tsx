import { Tldraw, useEditor, TLRecord } from "tldraw";
import type { TLEventMap } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import "@/styles/meeting/Whiteboard.css";

interface WhiteboardProps {
  meetingId: string;
  socket: Socket;
}

export default function Whiteboard({ meetingId, socket }: WhiteboardProps) {
  return (
    <div>
      <div className="wb-placeholder-list">
        <img src="/images/icon-left.png" alt="left" className="wb-icon-arrow-left" />
        <div className="wb-placeholder-items">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="wb-placeholder-box" />
          ))}
        </div>
        <img src="/images/icon-right.png" alt="right" className="wb-icon-arrow-right" />
      </div>
      <div className="whiteboard-container">
        <Tldraw persistenceKey={`meeting-${meetingId}`}>
          <TldrawSocketBridge meetingId={meetingId} socket={socket} />
        </Tldraw>
      </div>
    </div>
  );
}

function TldrawSocketBridge({ meetingId, socket }: { meetingId: string; socket: Socket }) {
  const editor = useEditor();
  const changeBuffer = useRef<TLRecord[]>([]);
  const removeBuffer = useRef<string[]>([]);
  const isDrawing = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const flushChanges = () => {
    if (changeBuffer.current.length === 0 && removeBuffer.current.length === 0) return;

    socket.emit("tldraw-changes", {
      meetingId,
      records: [...changeBuffer.current],
      removed: [...removeBuffer.current],
    });

    changeBuffer.current = [];
    removeBuffer.current = [];
  };

  // 드래그 상태 추적
  useEffect(() => {
    if (!editor) return;

    const handlePointerDown = () => { isDrawing.current = true; };
    const handlePointerUp = () => {
      isDrawing.current = false;
      flushChanges();
    };

    editor.on("pointer.down" as keyof TLEventMap, handlePointerDown);
    editor.on("pointer.up" as keyof TLEventMap, handlePointerUp);

    return () => {
      editor.off("pointer.down" as keyof TLEventMap, handlePointerDown);
      editor.off("pointer.up" as keyof TLEventMap, handlePointerUp);
    };
  }, [editor]);

  // 변경 감지 및 버퍼에 저장
  useEffect(() => {
    if (!editor) return;

    const cleanup = editor.store.listen((entry) => {
      const { added, updated, removed } = entry.changes;
      const addedRecords = Object.values(added);
      const updatedRecords = Object.values(updated).map(([_, next]) => next);
      const removedIds = Object.keys(removed);

      changeBuffer.current.push(...addedRecords, ...updatedRecords);
      removeBuffer.current.push(...removedIds);
    }, { source: "user" });

    // 주기적으로 flush
    intervalRef.current = setInterval(() => {
      if (!isDrawing.current) flushChanges();
    }, 150);

    return () => {
      cleanup();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [editor, socket, meetingId]);

  // 수신 처리
  useEffect(() => {
    if (!editor) return;

    const handler = ({ meetingId: incomingId, records, removed }: any) => {
      if (incomingId !== meetingId) return;
      if (!records || !Array.isArray(records)) return;

      const newRecords = records.filter((record: TLRecord) => {
        const existing = editor.store.get(record.id);
        return !existing || JSON.stringify(existing) !== JSON.stringify(record);
      });

      editor.batch(() => {
        if (newRecords.length > 0) editor.store.put(newRecords);
        if (removed && removed.length > 0) editor.store.remove(removed);
      });
    };

    socket.on("tldraw-changes", handler);
    return () => {
      socket.off("tldraw-changes", handler);
    };
  }, [editor, socket, meetingId]);

  // 입장 시
  useEffect(() => {
    socket.emit("join-whiteboard", { meetingId });
  }, [socket, meetingId]);

  return null;
}
