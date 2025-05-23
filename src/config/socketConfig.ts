const VITE_BASE_URL = import.meta.env.VITE_BASE_SOCKET_URL;

// 기능별 엔드포인트 분리
export const WS_NOTIFICATION_URL = `${VITE_BASE_URL}/ws-notification`;
export const WS_STT_URL = `${VITE_BASE_URL}/ws-stt`;