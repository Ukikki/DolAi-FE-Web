export const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8081";

// 기능별 엔드포인트 분리
export const WS_NOTIFICATION_URL = `${SOCKET_BASE_URL}/ws-notification`;
export const WS_STT_URL = `${SOCKET_BASE_URL}/ws-stt`;