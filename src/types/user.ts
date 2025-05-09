export interface User {
  id: string;
  email: string;
  name: string;
  profile_image: string;
  language: Language;
}

export type Language = "KO" | "EN" | "ZH";
