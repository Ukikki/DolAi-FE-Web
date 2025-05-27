// src/components/meeting/Whiteboard.tsx
import { Tldraw, useEditor, TLRecord } from "tldraw";
import type { Editor, TLEventMap } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useRef, } from "react";
import { Socket } from "socket.io-client";
import "@/styles/meeting/Whiteboard.css";
import { RemoteStreamEntry } from "@/types/remoteStreamEntry.ts";



interface WhiteboardProps {
  meetingId: string;
  socket: Socket;
  isCameraOn: boolean;
  myStream: MediaStream | null;
  remoteStreams: RemoteStreamEntry[];
  myPeerId: string;
  onEditorMount?: (editor: Editor) => void;
}

export default function Whiteboard({
  meetingId,
  socket,
  isCameraOn,
  myStream,           // ★ 추가
  remoteStreams,
  myPeerId,
  onEditorMount,
}: WhiteboardProps) {
  // 내 스트림은 prop 으로, 원격 스트림도 prop 으로 전달됩니다.
  const filteredRemoteVideos = remoteStreams.filter(
    (s) => s.kind === "video" && s.peerId !== myPeerId && s.mediaTag === "camera"
  );
  

  return (
    <div>
      <div className="wb-placeholder-list">
        <img src="/images/icon-left.png" alt="left" className="wb-icon-arrow-left" />
        <div className="wb-placeholder-items">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="wb-placeholder-box">
              {/* 내 영상(0번째 슬롯) */}
              {i === 0 && isCameraOn && myStream && <VideoPlayer stream={myStream} />}
              {/* 원격 참가자 영상(1~3번째 슬롯) */}
              {i > 0 && filteredRemoteVideos[i - 1] && (
                <VideoPlayer stream={filteredRemoteVideos[i - 1].stream} />
              )}
            </div>
          ))}
        </div>
        <img src="/images/icon-right.png" alt="right" className="wb-icon-arrow-right" />
      </div>

      <div className="whiteboard-container">
        <Tldraw persistenceKey={`meeting-${meetingId}`}>
          <TldrawSocketBridge meetingId={meetingId} socket={socket} onEditorMount={onEditorMount} />
        </Tldraw>
      </div>
    </div>
  );
}

function TldrawSocketBridge({
  meetingId,
  socket,
  onEditorMount,
}: {
  meetingId: string;
  socket: Socket;
  onEditorMount?: (editor: Editor) => void;
}) {
  const editor = useEditor();
  const changeBuffer = useRef<TLRecord[]>([]);
  const removeBuffer = useRef<string[]>([]);
  const isDrawing = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const flushChanges = () => {
    if (!changeBuffer.current.length && !removeBuffer.current.length) return;
    socket.emit("tldraw-changes", {
      meetingId,
      records: [...changeBuffer.current],
      removed: [...removeBuffer.current],
    });
    changeBuffer.current = [];
    removeBuffer.current = [];
  };

  useEffect(() => {
    if (editor && onEditorMount) {
      onEditorMount(editor);
    }
  }, [editor, onEditorMount]);

  useEffect(() => {
    if (!editor) return;
    const onDown = () => (isDrawing.current = true);
    const onUp = () => {
      isDrawing.current = false;
      flushChanges();
    };
    editor.on("pointer.down" as keyof TLEventMap, onDown);
    editor.on("pointer.up" as keyof TLEventMap, onUp);
    return () => {
      editor.off("pointer.down" as keyof TLEventMap, onDown);
      editor.off("pointer.up" as keyof TLEventMap, onUp);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const unsubscribe = editor.store.listen(
      (entry) => {
        const { added, updated, removed } = entry.changes;
        changeBuffer.current.push(...Object.values(added), ...Object.values(updated).map(([_, r]) => r));
        removeBuffer.current.push(...Object.keys(removed));
      },
      { source: "user" }
    );
    intervalRef.current = setInterval(() => {
      if (!isDrawing.current) flushChanges();
    }, 150);
    return () => {
      unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [editor, socket, meetingId]);

  useEffect(() => {
    if (!editor) return;
    const handler = ({ meetingId: id, records, removed }: any) => {
      if (id !== meetingId) return;
      editor.batch(() => {
        if (records?.length) editor.store.put(records);
        if (removed?.length) editor.store.remove(removed);
      });
    };
    socket.on("tldraw-changes", handler);
    return () => {
      socket.off("tldraw-changes", handler);
    };
  }, [editor, socket, meetingId]);

  useEffect(() => {
    socket.emit("join-whiteboard", { meetingId });
  }, [socket, meetingId]);

  return null;
}

function VideoPlayer({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }}
    />
  );
}
