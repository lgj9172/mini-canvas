import { useToolbar } from "@/hooks/useToolbar";
import { useHistory } from "@/hooks/useHistory";
import { useWindowSize } from "@/hooks/useWindowSize";
import { KonvaEventObject } from "konva/lib/Node";
import { LineConfig } from "konva/lib/shapes/Line";
import { CircleConfig } from "konva/lib/shapes/Circle";
import { RectConfig } from "konva/lib/shapes/Rect";
import { ShapeConfig } from "konva/lib/Shape";
import { Circle, Layer, Line, Rect, Stage } from "react-konva";
import { Toolbar } from "./Toolbar";
import { Vector2d } from "konva/lib/types";
import { useDrawingStore } from "@/hooks/useDrawing";

export default function Canvas() {
  const windowSize = useWindowSize();
  const { tool, color, width } = useToolbar();
  const { history, currentStep, appendHistory } = useHistory();
  const {
    isDrawing,
    currentLine,
    currentShape,
    controlPoint,
    polygonPoints,
    handleLineDrawing,
    handleCurveDrawing,
    handleShapeDrawing,
    handlePolygonDrawing,
    handleLineMove,
    handleCurveMove,
    handleCircleMove,
    handleRectangleMove,
    handlePolygonMove,
  } = useDrawingStore();

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const isFirstClick = !isDrawing;

    switch (tool) {
      case "line":
        handleLineDrawing(
          pos,
          isFirstClick,
          color,
          width,
          history,
          currentStep,
          appendHistory
        );
        break;
      case "curve":
        handleCurveDrawing(
          pos,
          color,
          width,
          history,
          currentStep,
          appendHistory
        );
        break;
      case "circle":
      case "rectangle":
        handleShapeDrawing(
          pos,
          isFirstClick,
          color,
          width,
          history,
          currentStep,
          appendHistory
        );
        break;
      case "polygon":
        handlePolygonDrawing(
          pos,
          color,
          width,
          history,
          currentStep,
          appendHistory
        );
        break;
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || (!isDrawing && tool !== "polygon")) return;

    const moveHandlers = {
      line: handleLineMove,
      curve: handleCurveMove,
      circle: handleCircleMove,
      rectangle: handleRectangleMove,
      polygon: handlePolygonMove,
    } as const;

    moveHandlers[tool as keyof typeof moveHandlers]?.(pos);
  };

  // 통합된 요소 렌더링을 위한 컴포넌트
  const ElementRenderer = ({
    element,
  }: {
    element: LineConfig | CircleConfig | RectConfig;
  }) => {
    // Line (직선과 곡선)인 경우
    if ("points" in element) {
      return (
        <Line
          points={element.points}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          closed={"closed" in element ? element.closed : false}
        />
      );
    }

    // Circle인 경우
    if ("radius" in element) {
      return <Circle {...element} />;
    }

    // Rectangle인 경우
    if ("width" in element && "height" in element) {
      return <Rect {...element} />;
    }

    return null;
  };

  // 제어점 표시를 위한 Circle 컴포넌트
  const ControlPoint = ({ x, y }: Vector2d) => (
    <Circle
      x={x}
      y={y}
      radius={6}
      fill="#EF4444"
      stroke="#DC2626"
      strokeWidth={2}
    />
  );

  // 현재 그리고 있는 선 렌더링
  const renderCurrentLine = () => {
    if (!currentLine) return null;

    // 공통으로 사용되는 선 속성
    const commonProps = {
      stroke: color,
      strokeWidth: width,
      opacity: 0.5,
    };

    switch (tool) {
      // 곡선 그리기
      case "curve":
        return (
          <>
            {/* 현재 그리고 있는 곡선 */}
            <Line points={currentLine} {...commonProps} />
            {/* 제어점과 보조선 */}
            {controlPoint && (
              <>
                <ControlPoint {...controlPoint} />
                {/* 제어점까지의 보조선 */}
                <Line
                  points={[
                    currentLine[0],
                    currentLine[1],
                    controlPoint.x,
                    controlPoint.y,
                  ]}
                  stroke="#EF4444"
                  strokeWidth={1}
                  dash={[5, 5]}
                  opacity={0.5}
                />
              </>
            )}
          </>
        );

      // 직선 그리기
      case "line":
        return (
          <Line
            points={[
              currentLine[0], // 시작점 x
              currentLine[1], // 시작점 y
              currentLine[2], // 끝점 x
              currentLine[3], // 끝점 y
            ]}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };

  // 현재 그리고 있는 도형 렌더링
  const renderCurrentShape = () => {
    if (!currentShape) return null;

    // 공통으로 사용되는 속성들
    const commonProps = {
      stroke: currentShape.stroke,
      strokeWidth: currentShape.strokeWidth,
      opacity: 0.5,
    };

    // Polygon (points가 있는 경우)
    if ("points" in currentShape) {
      return (
        <>
          <Line points={currentShape.points} {...commonProps} />
          {polygonPoints.length > 0 && <ControlPoint {...polygonPoints[0]} />}
        </>
      );
    }

    // Circle (radius가 있는 경우)
    if ("radius" in currentShape) {
      return (
        <>
          <Circle {...currentShape} {...commonProps} />
          <ControlPoint x={currentShape.x || 0} y={currentShape.y || 0} />
        </>
      );
    }

    // Rectangle (width와 height가 있는 경우)
    if ("width" in currentShape && "height" in currentShape) {
      return <Rect {...currentShape} {...commonProps} />;
    }

    return null;
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
          {renderCurrentLine()}
          {renderCurrentShape()}
        </Layer>
      </Stage>
    </div>
  );
}
