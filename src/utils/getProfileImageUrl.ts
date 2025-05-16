const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

export const getProfileImageUrl = (path: string | undefined): string => {  
  if (!path) return ""; // 일반 google 또는 kakao 이미지 경로

  // static으로 로컬에 저장된 이미지
  if (path.startsWith("/static/")) {
    return `${VITE_BASE_URL}${path}`; // 백엔드 경로 포함
  }

  return path; // 소셜 링크는 그대로 반환
};  