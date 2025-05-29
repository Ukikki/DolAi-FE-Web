import { useEffect } from "react";
import { notificationSocketClient } from "@/utils/socketClients";
import { useUser } from "@/hooks/user/useUser";
import { useToast } from "@/hooks/useToast";

// Dolai 알림 관리
let latestDolaiMessage: string | null = null;
let dolaiCallback: ((msg: string | null) => void) | null = null;

export const registerDolaiHandler = (callback: (msg: string | null) => void) => {
  dolaiCallback = callback;
  if (latestDolaiMessage) {
    callback(latestDolaiMessage);
  }
};

const NotificationListener = () => {
  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    const topics = [
      `/topic/notifications/${user.id}`,
      `/topic/notifications/dolai/${user.id}`,
    ];

    const handler = (data: any) => {
      // ✅ 일정 알림만 DolaiNoti로 띄우기
      if (data.category === "일정") {
        latestDolaiMessage = data.title;
        dolaiCallback?.(data.title);
        setTimeout(() => {
          latestDolaiMessage = null;
          dolaiCallback?.(null);
        }, 5000);
      } else {
        // 나머지는 일반 토스트 처리
        addToast(data.title, data.category, data.url);
      }
    };

    topics.forEach((t) => notificationSocketClient.subscribe(t, handler));

    return () => {
      topics.forEach((t) => notificationSocketClient.unsubscribe(t));
    };
  }, [user]);

  return null;
};

export default NotificationListener;