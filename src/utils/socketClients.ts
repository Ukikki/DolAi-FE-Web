import { SocketClient } from "./socketClient";
import { WS_NOTIFICATION_URL, WS_STT_URL } from "@/config/socketConfig";

export const notificationSocketClient = new SocketClient(WS_NOTIFICATION_URL);
export const sttSocketClient = new SocketClient(WS_STT_URL);