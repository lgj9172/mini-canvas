import { useEffect } from "react";
import { useHistory } from "./useHistory";
import { useDrawing } from "./useDrawing";

export const useKeyboardShortcuts = () => {
  const { undoHistory, redoHistory } = useHistory();
  const { resetDrawing } = useDrawing();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetDrawing();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        // Windows의 Ctrl 키와 Mac의 Command 키 모두 지원
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault(); // 브라우저 기본 동작 방지
            undoHistory();
            break;
          case "y":
            e.preventDefault();
            redoHistory();
            break;
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoHistory, redoHistory, resetDrawing]);
};
