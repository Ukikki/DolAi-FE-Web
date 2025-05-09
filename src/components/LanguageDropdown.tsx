import "@/styles/LanguageDropdown.css";
import { Language } from "@/types/user";

interface LanguageDropdownProps {
  currentLang: Language;
  onSelect: (lang: Language) => void;
}

const LANGUAGE_LABELS: Record<Language, Record<Language, string>> = {
  KO: { KO: "한국어", EN: "영어", ZH: "중국어" },
  EN: { KO: "Korean", EN: "English", ZH: "Chinese" },
  ZH: { KO: "韩语", EN: "英语", ZH: "中文" },
};

const HEADER_LABELS: Record<Language, string> = {
  KO: "현재 언어:",
  EN: "Language:",
  ZH: "当前语言:",
};

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLang,
  onSelect,
}) => {
  const labels = LANGUAGE_LABELS[currentLang];

  return (
    <div className="language-dropdown">
      <div className="current-lang">{HEADER_LABELS[currentLang]} {labels[currentLang]}
      </div>
      <hr />
      {Object.entries(labels)
        .filter(([code]) => code !== currentLang)
        .map(([code, label]) => (
          <div
            key={code}
            className="lang-option"
            onClick={() => onSelect(code as Language)}
          >
            {label}
          </div>
        ))}
    </div>
  );
};

export default LanguageDropdown;
