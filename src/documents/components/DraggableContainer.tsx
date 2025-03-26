
// import Draggable from "react-draggable";
// import { ReactNode, MouseEvent } from "react";

// // 폴더 타입 (DocumentsPage에서 쓰는 Folder와 동일하게 맞춰야 함)
// interface Folder {
//   id: number;
//   name: string;
//   color: string;
// }

// interface DraggableContainerProps {
//   folder: Folder;
//   onClick?: (e: MouseEvent<HTMLDivElement>) => void;
//   children: ReactNode;
// } 

// export function DraggableContainer({ folder, onClick, children }: DraggableContainerProps) {
//   return (
//     <Draggable
//       defaultPosition={{ x: 0, y: 0 }}
//       bounds="parent" // 부모 범위 내에서만 이동하려면
//       onStart={() => console.log("start dragging folder:", folder.name)}
//     >
//       {/* 
//         onClick 이벤트를 div에 연결. 
//         cursor: move => 마우스 커서가 '이동' 모양
//       */}
//       <div onClick={onClick} style={{ cursor: "move" }}>
//         {children}
//       </div>
//     </Draggable>
//   );
// }
