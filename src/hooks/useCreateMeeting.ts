import axios from "@/utils/axiosInstance";

export function useCreateMeeting() {
  const createMeeting = async ({ title, startTime } : {
    title: string;
    startTime: string;
  }) => {
    try {
      const response = await axios.post("/meetings", { title, startTime });
      return response.data.data; 
    } catch (error) {
      console.error("회의 생성 실패:", error);
      throw error;
    }
  };
  return { createMeeting };
}
