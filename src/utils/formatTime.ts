export const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5); // "HH:mm"
};

export const parseLocalDate = (value: string): Date => {
  const fixed = value.replace(" ", "T").split(".")[0]; // "2025-05-15T13:57:19" 로 변환
  return new Date(fixed);
};
  