export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return "";
  
  const iso = dateString.replace(" ", "T");

  const created = new Date(iso).getTime();
  if (isNaN(created)) return "";

  const now = Date.now();
  const diff = Math.floor((now - created) / 1000); // 초 단위
  
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;          // 1시간 미만
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;     // 하루 미만
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;    // 7일 미만
  if (diff < 2419200) return `${Math.floor(diff / 604800)}주 전`;  // 한 달 미만
  if (diff < 29030400) return `${Math.floor(diff / 2419200)}개월 전`; // 1년 미만
  return `${Math.floor(diff / 29030400)}년 전`;
};
  