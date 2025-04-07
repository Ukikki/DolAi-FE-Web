export const getProfileImageUrl = (path: string | undefined): string => {  
  if (!path) return ""; // 일반 google 또는 kakao 이미지 경로

  // static으로 로컬에 저장된 이미지
 if (path.startsWith("/static/")) {
   return `http://localhost:8081${path}`; // 백엔드 경로 포함
 }

 return path; // 소셜 링크는 그대로 반환
};  