import { useNotification } from "../../hooks/useNotification";
import { getRelativeTime } from "../../utils/getRelativeTime";
import NotiItem from "./NotiItem";

const NotiList = () => {
  const { noti } = useNotification();
  console.log("알림 응답 결과:", noti);

  return (
    <div>
      {noti.map((n, idx) => (
        <NotiItem
          key={idx}
          category={n.category}
          createdAt={getRelativeTime(n.createdAt)}
          title={n.title}
        />
      ))}
    </div>
  );
};

export default NotiList;
