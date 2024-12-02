import { useDrawing } from "@/hooks/useDrawing";
import { useHistory } from "@/hooks/useHistory";
import { useToolbar } from "@/hooks/useToolbar";
import { useWindowSize } from "@/hooks/useWindowSize";
import { LineType, Point, ShapeType } from "@/types";
import { KonvaEventObject } from "konva/lib/Node";
import { Circle, Layer, Line, Rect, Stage } from "react-konva";
import { Toolbar } from "./Toolbar";

export default function Canvas() {
  const windowSize = useWindowSize();
  const { tool, color, width } = useToolbar();
  const { history, currentStep, appendHistory } = useHistory();
  const {
    drawing,
    handleLineDrawing,
    handleCurveDrawing,
    handleShapeDrawing,
    handlePolygonDrawing,
    handleLineMove,
    handleCurveMove,
    handleCircleMove,
    handleRectangleMove,
    handlePolygonMove,
  } = useDrawing();

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const isFirstClick = !drawing.isDrawing;

    switch (tool) {
      case "line":
        handleLineDrawing(pos, isFirstClick);
        break;
      case "curve":
        handleCurveDrawing(pos);
        break;
      case "circle":
      case "rectangle":
        handleShapeDrawing(pos, isFirstClick);
        break;
      case "polygon":
        handlePolygonDrawing(pos);
        break;
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos || (!drawing.isDrawing && tool !== "polygon")) return;

    const moveHandlers = {
      line: handleLineMove,
      curve: handleCurveMove,
      circle: handleCircleMove,
      rectangle: handleRectangleMove,
      polygon: handlePolygonMove,
    } as const;

    moveHandlers[tool as keyof typeof moveHandlers]?.(pos);
  };

  // 선 렌더링
  const LineRenderer = ({ line, index }: { line: LineType; index: number }) => {
    return (
      <Line
        key={`line-${index}`}
        points={line.points}
        stroke={line.color}
        strokeWidth={line.strokeWidth}
        lineCap="round"
        lineJoin="round"
      />
    );
  };

  // 도형 렌더링
  const ShapeRenderer = ({ shape }: { shape: ShapeType }) => {
    switch (shape.tool) {
      case "polygon":
        return (
          <Line
            points={shape.points}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            closed={true}
          />
        );

      case "circle":
        return (
          <Circle
            x={shape.x}
            y={shape.y}
            radius={shape.radius || 0}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
        );

      case "rectangle":
        return (
          <Rect
            x={shape.x}
            y={shape.y}
            width={shape.width || 0}
            height={shape.height || 0}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
          />
        );

      default:
        return null;
    }
  };

  // 제어점 표시를 위한 Circle 컴포넌트
  const ControlPoint = ({ x, y }: Point) => (
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
    if (!drawing.currentLine) return null;

    // 공통으로 사용되는 선 속성
    const commonProps = {
      stroke: color,
      strokeWidth: width,
      lineCap: "round" as const,
      lineJoin: "round" as const,
      opacity: 0.5,
    };

    switch (tool) {
      // 곡선 그리기
      case "curve":
        return (
          <>
            {/* 현재 그리고 있는 곡선 */}
            <Line points={drawing.currentLine} {...commonProps} />
            {/* 제어점과 보조선 */}
            {drawing.controlPoint && (
              <>
                <ControlPoint {...drawing.controlPoint} />
                {/* 제어점까지의 보조선 */}
                <Line
                  points={[
                    drawing.currentLine[0],
                    drawing.currentLine[1],
                    drawing.controlPoint.x,
                    drawing.controlPoint.y,
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
              drawing.currentLine[0], // 시작점 x
              drawing.currentLine[1], // 시작점 y
              drawing.currentLine[2], // 끝점 x
              drawing.currentLine[3], // 끝점 y
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
    if (!drawing.currentShape) return null;

    // 공통으로 사용되는 속성들
    const commonProps = {
      stroke: drawing.currentShape.stroke,
      strokeWidth: drawing.currentShape.strokeWidth,
      opacity: 0.5,
    };

    switch (drawing.currentShape.tool) {
      case "polygon":
        return (
          <>
            <Line points={drawing.currentShape.points} {...commonProps} />
            {drawing.polygonPoints.length > 0 && (
              <ControlPoint {...drawing.polygonPoints[0]} />
            )}
          </>
        );

      case "circle":
        return (
          <>
            <Circle
              x={drawing.currentShape.x || 0}
              y={drawing.currentShape.y || 0}
              radius={drawing.currentShape.radius || 0}
              {...commonProps}
            />
            <ControlPoint
              x={drawing.currentShape.x || 0}
              y={drawing.currentShape.y || 0}
            />
          </>
        );

      case "rectangle":
        return (
          <Rect
            x={drawing.currentShape.x || 0}
            y={drawing.currentShape.y || 0}
            width={drawing.currentShape.width || 0}
            height={drawing.currentShape.height || 0}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar disabled={drawing.isDrawing} />
      <Stage
        width={windowSize.width}
        height={windowSize.height}
        className="bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {history[currentStep].lines.map((line, i) => (
            <LineRenderer key={`line-${i}`} line={line} index={i} />
          ))}
          {history[currentStep].shapes.map((shape) => (
            <ShapeRenderer key={shape.id} shape={shape} />
          ))}
          {renderCurrentLine()}
          {renderCurrentShape()}
        </Layer>
      </Stage>
    </div>
  );
}
