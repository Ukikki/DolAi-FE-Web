import { useEffect } from "react";
import { notificationSocketClient } from "@/utils/socketClients";
import { useUser } from "@/hooks/user/useUser";
import { useToast } from "@/hooks/useToast";

const NotificationListener = () => {
  const { user } = useUser();
  const { addToast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    if (!notificationSocketClient.isConnected()) {
      notificationSocketClient.connect();
    }

    notificationSocketClient.subscribe(`/topic/notifications/${user.id}`, (data) => {
      addToast(data.title, data.category, data.url);
    });

    return () => {
      notificationSocketClient.unsubscribe(`/topic/notifications/${user.id}`);
    };
  }, [user]);

  return null;
};

export default NotificationListener;