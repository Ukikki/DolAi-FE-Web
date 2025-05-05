import { useNotification } from "@/hooks/useNotification";
import { getRelativeTime } from "@/utils/getRelativeTime";
import NotiItem from "./NotiItem";

const NotiList = () => {
  const { noti } = useNotification();

  return (
    <div>
      {noti.map((n, idx) => (
        <NotiItem
          key={idx}
          category={n.category}
          createdAt={getRelativeTime(n.createdAt)}
          title={n.title}
          url={n.targetUrl}
        />
      ))}
    </div>
  );
};

export default NotiList;
