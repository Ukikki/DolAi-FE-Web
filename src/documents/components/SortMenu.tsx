import { useState } from "react";
import styles from "../styles/documents.module.scss"; 

export default function SortMenu() {
  // 드롭다운 열림/닫힘 상태
  const [isOpen, setIsOpen] = useState(false);

  // 체크 상태들 (기본 예시: 이름, 내림차순만 체크)
  const [checkedName, setCheckedName] = useState(true);
  const [checkedModified, setCheckedModified] = useState(false);
  const [checkedCreated, setCheckedCreated] = useState(false);
  const [checkedSize, setCheckedSize] = useState(false);

  const [descending, setDescending] = useState(true);
  const [ascending, setAscending] = useState(false);

  // 드롭다운 열고 닫기
  function handleToggle() {
    setIsOpen(!isOpen);
  }

  // 현재 선택된 정렬 옵션 문자열 생성
  const activeOptions: string[] = [];
  if (checkedName) activeOptions.push("이름");
  if (checkedModified) activeOptions.push("수정일");
  if (checkedCreated) activeOptions.push("생성일");
  if (checkedSize) activeOptions.push("크기");
  if (descending) activeOptions.push("내림차순");
  if (ascending) activeOptions.push("오름차순");

  const activeText = activeOptions.length > 0 ? activeOptions.join(", ") : "정렬";

  return (
    <div className={styles.sortMenuContainer}>
      {/* 정렬 버튼: 드롭다운이 열려 있으면 기본 "정렬" 텍스트, 아니면 체크된 옵션 표시 */}
      <div className={styles.sortButton} onClick={handleToggle}>
        <img
          src="/images/sort.png"
          alt="정렬 아이콘"
          className={styles.sortIcon}
        />
        <span className={styles.sortText}>
          {isOpen ? "정렬" : activeText}
        </span>
      </div>

      {/* 드롭다운 (열렸을 때만) */}
      {isOpen && (
        <div className={styles.sortDropdown}>
          {/* 정렬 기준 (체크박스) */}
          <label>
            <input
              type="checkbox"
              checked={checkedName}
              onChange={(e) => setCheckedName(e.target.checked)}
            />
            이름
          </label>
          <label>
            <input
              type="checkbox"
              checked={checkedModified}
              onChange={(e) => setCheckedModified(e.target.checked)}
            />
            수정일
          </label>
          <label>
            <input
              type="checkbox"
              checked={checkedCreated}
              onChange={(e) => setCheckedCreated(e.target.checked)}
            />
            생성일
          </label>
          <label>
            <input
              type="checkbox"
              checked={checkedSize}
              onChange={(e) => setCheckedSize(e.target.checked)}
            />
            크기
          </label>

          <hr />

          {/* 정렬 방향 (체크박스) */}
          <label>
            <input
              type="checkbox"
              checked={descending}
              onChange={(e) => setDescending(e.target.checked)}
            />
            내림차순
          </label>
          <label>
            <input
              type="checkbox"
              checked={ascending}
              onChange={(e) => setAscending(e.target.checked)}
            />
            오름차순
          </label>
        </div>
      )}
    </div>
  );
}
