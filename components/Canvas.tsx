import { Drawing, LineType, Point, ShapeType, Snapshot, Tool } from "@/types";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useState } from "react";
import { Circle, Layer, Line, Rect, Stage } from "react-konva";
import { Toolbar } from "./Toolbar";
import { Shape } from "konva/lib/Shape";

// 기본 상수 및 타입 정의
interface CanvasProps {
  defaultValues?: typeof DEFAULT_VALUES;
}

const DEFAULT_VALUES = {
  tool: "line",
  color: "#000000",
  strokeWidth: 5,
  toolbarHeight: 0,
  minStrokeWidth: 5,
  maxStrokeWidth: 50,
} as const;

const CONSTANTS = {
  ...DEFAULT_VALUES,
  SEGMENTS: 50,
  SNAP_THRESHOLD: 10,
  CONTROL_POINT_RADIUS: 6,
} as const;

const ShapeRenderer = ({ shape }: { shape: ShapeType }) => {
  if (shape.tool === "polygon") {
    return (
      <Line
        points={shape.points}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        closed={true}
      />
    );
  }

  if (shape.tool === "circle") {
    return (
      <Circle
        x={shape.x}
        y={shape.y}
        radius={shape.radius || 0}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

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
};

export default function Canvas({
  defaultValues = DEFAULT_VALUES,
}: CanvasProps) {
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight - defaultValues.toolbarHeight,
  });

  const [currentTool, setCurrentTool] = useState<Tool>(
    defaultValues.tool as Tool
  );
  const [currentColor, setCurrentColor] = useState<string>(defaultValues.color);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(
    defaultValues.strokeWidth
  );

  const [drawing, setDrawing] = useState<Drawing>({
    isDrawing: false,
    currentLine: null,
    currentShape: null,
    controlPoint: null,
    startPoint: null,
    polygonPoints: [],
  });

  const [shapes, setShapes] = useState<ShapeType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([
    { lines: [], shapes: [] },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - defaultValues.toolbarHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [defaultValues.toolbarHeight]);

  const updateHistory = (newLines: LineType[], newShapes: ShapeType[]) => {
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push({ lines: newLines, shapes: newShapes });
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const resetDrawing = () => {
    setDrawing({
      isDrawing: false,
      currentLine: null,
      currentShape: null,
      controlPoint: null,
      startPoint: null,
      polygonPoints: [],
    });
  };

  const handleLineDrawing = (pos: Point, isFirstClick: boolean) => {
    // 첫 번째 클릭: 선 그리기 시작
    if (isFirstClick) {
      const initialLine = {
        isDrawing: true,
        currentLine: [pos.x, pos.y, pos.x, pos.y],
      };

      setDrawing((prev) => ({ ...prev, ...initialLine }));
      return;
    }

    // 두 번째 클릭: 선 그리기 완료
    const newLine: LineType = {
      points: drawing.currentLine!,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      tool: currentTool,
    };

    const updatedLines = [...lines, newLine];

    // 상태 업데이트
    setLines(updatedLines);
    updateHistory(updatedLines, shapes);
    resetDrawing();
  };

  const handleCurveDrawing = (pos: Point) => {
    // 시작점 설정
    if (!drawing.isDrawing) {
      const initialCurve = {
        isDrawing: true,
        currentLine: [pos.x, pos.y],
      };

      setDrawing((prev) => ({ ...prev, ...initialCurve }));
      return;
    }

    // 제어점 설정
    if (!drawing.controlPoint) {
      const controlPoint = { x: pos.x, y: pos.y };

      setDrawing((prev) => ({ ...prev, controlPoint }));
      return;
    }

    // 곡선 완성
    const startPoint = {
      x: drawing.currentLine![0],
      y: drawing.currentLine![1],
    };

    const newLine: LineType = {
      points: calculateBezierPoints(startPoint, drawing.controlPoint, pos),
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      tool: currentTool,
    };

    const updatedLines = [...lines, newLine];

    // 상태 업데이트
    setLines(updatedLines);
    updateHistory(updatedLines, shapes);
    resetDrawing();
  };

  const handleShapeDrawing = (pos: Point, isFirstClick: boolean) => {
    // 첫 번째 클릭: 도형 그리기 시작
    if (isFirstClick) {
      const initialShape = {
        id: crypto.randomUUID(),
        tool: currentTool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        stroke: currentColor,
        strokeWidth: currentStrokeWidth,
        isComplete: false,
      };

      const newDrawingState = {
        isDrawing: true,
        startPoint: pos,
        currentShape: initialShape,
      };

      setDrawing((prev) => ({ ...prev, ...newDrawingState }));
      return;
    }

    // 두 번째 클릭: 도형 그리기 완료
    const completedShape = {
      ...drawing.currentShape!,
      isComplete: true,
    };

    const updatedShapes = [...shapes, completedShape];

    // 상태 업데이트
    setShapes(updatedShapes);
    updateHistory(lines, updatedShapes);
    resetDrawing();
  };

  const handlePolygonDrawing = (pos: Point) => {
    // 시작점 근처인지 확인 (다각형 완성 조건)
    const isNearStartPoint = () => {
      const hasMinPoints = drawing.polygonPoints.length > 2;
      const distanceToStart = Math.hypot(
        pos.x - drawing.polygonPoints[0].x,
        pos.y - drawing.polygonPoints[0].y
      );

      return hasMinPoints && distanceToStart < 10;
    };

    // 다각형 그리기 시작
    if (!drawing.isDrawing) {
      const initialShape = {
        id: crypto.randomUUID(),
        tool: "polygon",
        points: [pos.x, pos.y],
        stroke: currentColor,
        strokeWidth: currentStrokeWidth,
        isComplete: false,
      };

      const newDrawingState = {
        isDrawing: true,
        startPoint: pos,
        polygonPoints: [pos],
        currentShape: initialShape,
      };

      setDrawing((prev) => ({ ...prev, ...newDrawingState }));
      return;
    }

    // 다각형 완성 (시작점과 연결)
    if (isNearStartPoint() && drawing.polygonPoints.length > 2) {
      const points = drawing.polygonPoints.flatMap((p) => [p.x, p.y]);
      const completedShape: ShapeType = {
        ...drawing.currentShape!,
        points: [...points, points[0], points[1]], // 시작점으로 닫기
        isComplete: true,
      };

      const updatedShapes = [...shapes, completedShape];

      // 상태 업데이트
      setShapes(updatedShapes);
      updateHistory(lines, updatedShapes);
      resetDrawing();
      return;
    }

    // 다각형 점 추가
    const updatedPoints = [...drawing.polygonPoints, pos];
    const flattenedPoints = updatedPoints.flatMap((p) => [p.x, p.y]);

    setDrawing((prev) => ({
      ...prev,
      polygonPoints: updatedPoints,
      currentShape: {
        ...prev.currentShape!,
        points: flattenedPoints,
      },
    }));
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const isFirstClick = !drawing.isDrawing;

    switch (currentTool) {
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
    if (!pos || (!drawing.isDrawing && currentTool !== "polygon")) return;

    const moveHandlers = {
      line: handleLineMove,
      curve: handleCurveMove,
      circle: handleCircleMove,
      rectangle: handleRectangleMove,
      polygon: handlePolygonMove,
    } as const;

    moveHandlers[currentTool as keyof typeof moveHandlers]?.(pos);
  };

  const handleLineMove = (pos: Point) => {
    if (!drawing.currentLine) return;

    const updatedLine = [
      drawing.currentLine[0], // 시작점
      drawing.currentLine[1],
      pos.x, // 끝점
      pos.y,
    ];

    setDrawing((prev) => ({
      ...prev,
      currentLine: updatedLine,
    }));
  };

  const handleCurveMove = (pos: Point) => {
    const startPoint = {
      x: drawing.currentLine![0], // 시작점
      y: drawing.currentLine![1],
    };

    const endPoint = { x: pos.x, y: pos.y }; // 끝점
    const controlPoint = drawing.controlPoint || endPoint; // 제어점

    const points = calculateBezierPoints(startPoint, controlPoint, endPoint);
    setDrawing((prev) => ({ ...prev, currentLine: points }));
  };

  const handleCircleMove = (pos: Point) => {
    if (!drawing.startPoint) return;

    const radius = Math.hypot(
      pos.x - drawing.startPoint.x,
      pos.y - drawing.startPoint.y
    ); // 반지름

    updateCurrentShape({ radius });
  };

  const handleRectangleMove = (pos: Point) => {
    if (!drawing.startPoint) return;

    updateCurrentShape({
      width: pos.x - drawing.startPoint.x, // 가로
      height: pos.y - drawing.startPoint.y, // 세로
    });
  };

  const handlePolygonMove = (pos: Point) => {
    if (!drawing.isDrawing || !drawing.polygonPoints.length) return;

    const points = [
      ...drawing.polygonPoints.flatMap((p) => [p.x, p.y]), // 다각형 점들
      pos.x, // 끝점
      pos.y,
    ];

    updateCurrentShape({ points });
  };

  // 현재 그리고 있는 선 업데이트
  const updateCurrentLine = (updates: Partial<LineType>) => {
    setDrawing((prev) => ({
      ...prev,
      currentLine: prev.currentLine
        ? [...prev.currentLine, ...(updates.points || [])]
        : updates.points || null,
    }));
  };

  // 현재 그리고 있는 도형 업데이트
  const updateCurrentShape = (updates: Partial<ShapeType>) => {
    setDrawing((prev) => ({
      ...prev,
      currentShape: prev.currentShape
        ? ({ ...prev.currentShape, ...updates } as ShapeType)
        : null,
    }));
  };

  // 베지어 곡선 계산 함수
  const calculateBezierPoints = (
    start: Point,
    control: Point,
    end: Point
  ): number[] =>
    Array.from({ length: CONSTANTS.SEGMENTS + 1 })
      // t값 생성 (0 ~ 1)
      .map((_, i) => i / CONSTANTS.SEGMENTS)
      // 각 t값에 대한 [x, y] 좌표 계산
      .map((t) => {
        const tInverse = 1 - t;
        return [
          // x 좌표
          tInverse ** 2 * start.x +
            2 * tInverse * t * control.x +
            t ** 2 * end.x,
          // y 좌표
          tInverse ** 2 * start.y +
            2 * tInverse * t * control.y +
            t ** 2 * end.y,
        ];
      })
      // [x, y] 배열을 평탄화
      .flat();

  // 도구 변경
  const handleToolChange = (tool: Tool) => {
    setCurrentTool(tool);
  };

  // 선 두께 변경
  const handleStrokeWidthChange = (width: number) => {
    setCurrentStrokeWidth(width);
  };

  // 되돌리기
  const handleUndo = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      setLines(history[newStep].lines);
      setShapes(history[newStep].shapes);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setLines(history[newStep].lines);
      setShapes(history[newStep].shapes);
    }
  };

  const handleReset = () => {
    setLines([]);
    setShapes([]);
    setHistory([{ lines: [], shapes: [] }]);
    setCurrentStep(0);
    setDrawing({
      isDrawing: false,
      currentLine: null,
      currentShape: null,
      controlPoint: null,
      startPoint: null,
      polygonPoints: [],
    });
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  // 현재 그리고 있는 선 렌더링
  const renderCurrentLine = () => {
    if (!drawing.currentLine) return null;

    // 공통으로 사용되는 선 속성
    const commonProps = {
      stroke: currentColor,
      strokeWidth: currentStrokeWidth,
      lineCap: "round" as const,
      lineJoin: "round" as const,
      opacity: 0.5,
    };

    // 제어점 표시를 위한 Circle 컴포넌트
    const ControlPoint = ({ x, y }: Point) => (
      <Circle
        x={x}
        y={y}
        radius={CONSTANTS.CONTROL_POINT_RADIUS}
        fill="#EF4444"
        stroke="#DC2626"
        strokeWidth={2}
      />
    );

    switch (currentTool) {
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

    // 제어점 표시를 위한 Circle 컴포넌트
    const ControlPoint = ({ x, y }: Point) => (
      <Circle
        x={x}
        y={y}
        radius={CONSTANTS.CONTROL_POINT_RADIUS}
        fill="#EF4444"
        stroke="#DC2626"
        strokeWidth={2}
      />
    );

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
      <Toolbar
        selectedTool={currentTool}
        color={currentColor}
        strokeWidth={currentStrokeWidth}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onStrokeWidthChange={handleStrokeWidthChange}
        onUndoClick={handleUndo}
        onRedoClick={handleRedo}
        onResetClick={handleReset}
        canUndo={currentStep > 0}
        canRedo={currentStep < history.length - 1}
        currentStep={currentStep}
        totalSteps={history.length - 1}
        disabled={drawing.isDrawing}
      />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        className="bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={`line-${i}`}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          {shapes.map((shape) => (
            <ShapeRenderer key={shape.id} shape={shape} />
          ))}
          {renderCurrentLine()}
          {renderCurrentShape()}
        </Layer>
      </Stage>
    </div>
  );
}
