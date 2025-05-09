import axios from  "@/utils/axiosInstance";
import { Language } from "@/types/user";

export const useLanguage = (refetch: () => void) => {
  const updateLanguage = async (langCode: Language) => {
    try {
      await axios.patch("/user/language", { language: langCode });
      await refetch();
    } catch (err) {
      console.error("언어 변경 실패", err);
    }
  };

  return {
    updateLanguage
  };
};