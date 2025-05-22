import { useRef } from "react";
import axios from "@/utils/axiosInstance";

declare global {
  interface Window {
    ImageCapture: any;
  }
}

declare class ImageCapture {
  constructor(videoTrack: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
}

const flattenOcrText = (ocrData: any): string => {
  try {
    return ocrData?.regions
      ?.flatMap((region: any) =>
        region.lines?.flatMap((line: any) =>
          line.words?.map((w: any) => w.text)
        )
      )
      .filter(Boolean)
      .join(" ") || "";
  } catch {
    return "";
  }
};

export const useScreenShare = (meetingId: string, userId: string) => {
  const displayStreamRef = useRef<MediaStream | null>(null);
  const ocrIntervalRef = useRef<number | null>(null);

  const screenShareStart = async () => {
    try {
      const statusRes = await axios.get(`/meetings/${meetingId}/screen-share/status`);
      if (statusRes.data?.active) {
        alert("이미 화면 공유 중입니다.");
        return;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      displayStreamRef.current = displayStream;

      const track = displayStream.getVideoTracks()[0];

      // ✅ 트랙 종료 이벤트 → OCR 먼저 실행 → 스트림 종료
      track.onended = async () => {
        console.log("🛑 화면 공유 사용자 종료됨");
        await runFinalOcrAndSend(); // OCR 먼저
        await stopStreamOnly();     // 스트림 정리
      };

      await axios.post(`/meetings/${meetingId}/screen-share/start`, { userId });
      console.log("✅ 화면 공유 시작");

      startOcrInterval(); // OCR 자동 시작

    } catch (err) {
      console.error("❌ 화면 공유 시작 실패:", err);
    }
  };

  const screenShareStop = async () => {
    await runFinalOcrAndSend(); // OCR 먼저 하고
    await stopStreamOnly();     // 그 다음 스트림 종료
  };

  const stopStreamOnly = async () => {
    try {
      displayStreamRef.current?.getTracks().forEach((t) => t.stop());
      displayStreamRef.current = null;

      if (ocrIntervalRef.current) {
        clearInterval(ocrIntervalRef.current);
        ocrIntervalRef.current = null;
      }

      console.log("🧼 화면 공유 정리 완료");

    } catch (err) {
      console.error("❌ 스트림 정리 실패:", err);
    }
  };

  const runFinalOcrAndSend = async () => {
    try {
      const result = await captureAndSendOcr();
      const ocrText = flattenOcrText(result);
      const timestamp = new Date().toISOString();

      await axios.post(`/meetings/${meetingId}/screen-share/stop`, {
        userId,
        text: ocrText,
        timestamp,
      });

      console.log("✅ OCR 최종 저장 완료");

    } catch (err) {
      console.warn("⚠️ 마지막 OCR 실패, 생략함", err);
    }
  };

  const captureAndSendOcr = async (): Promise<any> => {
    const stream = displayStreamRef.current;
    if (!stream) throw new Error("화면 공유 중이 아닙니다.");

    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context 오류");

    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => {
        if (b) {
          console.log("🖼️ blob 생성 완료, 크기:", b.size, "bytes");
          resolve(b);
        } else {
          throw new Error("❌ canvas → blob 변환 실패");
        }
      }, "image/png")
    );    

    const formData = new FormData();
    formData.append("file", blob, "capture.png");

    const response = await axios.post("/azure-ocr/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("📄 OCR 캡처 결과:", response.data);
    return response.data;
  };

  const startOcrInterval = () => {
    ocrIntervalRef.current = window.setInterval(async () => {
      try {
        const result = await captureAndSendOcr();
        console.log("📄 OCR 자동 결과:", result);
      } catch (err) {
        console.warn("⚠️ OCR 자동 캡처 실패:", err);
      }
    }, 10000); // 10초 간격
  };

  return {
    screenShareStart,
    screenShareStop,
    isSharing: !!displayStreamRef.current,
  };
};
