import { useDrawing } from "@/hooks/useDrawing";
import { useHistory } from "@/hooks/useHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToolbar } from "@/hooks/useToolbar";
import { useWindowSize } from "@/hooks/useWindowSize";
import { KonvaEventObject } from "konva/lib/Node";
import { Layer, Stage } from "react-konva";
import { ElementRenderer } from "./canvas/ElementRenderer";
import { Toolbar } from "./Toolbar";

export default function Canvas() {
  const windowSize = useWindowSize();
  const { tool, color, width } = useToolbar();
  const { history, currentStep, appendHistory } = useHistory();
  const { currentElement, handleDrawingPoint, handleDrawingMove } =
    useDrawing();

  useKeyboardShortcuts();

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    handleDrawingPoint(
      pos,
      tool,
      color,
      width,
      history,
      currentStep,
      appendHistory
    );
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    handleDrawingMove(pos, tool);
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <Stage
        width={windowSize.width}
        height={windowSize.height}
        className="bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {history[currentStep].map((element, i) => (
            <ElementRenderer key={`element-${i}`} element={element} />
          ))}
          {currentElement && (
            <ElementRenderer
              element={currentElement.config}
              controlPoint={currentElement.controlPoint}
              startPoint={currentElement.startPoint}
              points={currentElement.points}
              opacity={0.5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
