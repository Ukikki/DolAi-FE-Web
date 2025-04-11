import { useState } from "react";
import "../styles/SortMenu.css";
import { ArrowUpDownIcon, Check } from "lucide-react";

interface SortMenuProps {
  sortKey: string;
  sortOrder: string;
  onSortChange: (sortKey: string, sortOrder: string) => void;
}

export default function SortMenu({ sortKey, sortOrder, onSortChange }: SortMenuProps) {
  // 정렬 메뉴 열고 닫기 상태
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // 정렬 기준 변경 시 부모 콜백 호출
  const handleSortKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSortChange(e.target.value, sortOrder);
  };

  // 정렬 순서 변경 시 부모 콜백 호출
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSortChange(sortKey, e.target.value);
  };

  // 표시할 텍스트 구성
  const keyLabels: Record<string, string> = {
    name: "이름",
    modified: "수정일",
    created: "생성일",
    size: "크기",
  };

  const orderLabels: Record<string, string> = {
    desc: "내림차순",
    asc: "오름차순",
  };

  return (
    <div className="sort-container">
      <div className="sort-button" onClick={handleToggle}>
        <ArrowUpDownIcon className="sort-icon" />
        <span className="sort-text">정렬</span>
      </div>

      {isOpen && (
        <div className="sort-dropdown">
          <div className="sort-radioGroup">
            {Object.keys(keyLabels).map((key) => (
              <label key={key}>
                <input
                  type="radio"
                  value={key}
                  checked={sortKey === key}
                  onChange={handleSortKeyChange}
                />
                {sortKey === key && <Check className="sort-check-icon" />}
                {keyLabels[key]}
              </label>
            ))}
          </div>

          <hr />

          <div className="sort-radioGroup">
            {Object.keys(orderLabels).map((order) => (
              <label key={order}>
                <input
                  type="radio"
                  value={order}
                  checked={sortOrder === order}
                  onChange={handleSortOrderChange}
                />
                {sortOrder === order && <Check className="sort-check-icon" />}
                {orderLabels[order]}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
