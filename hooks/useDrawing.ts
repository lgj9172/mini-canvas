import { useState } from "react";
import { Drawing, LineType, Point, ShapeType, Snapshot, Tool } from "@/types";
import { useToolbar } from "./useToolbar";
import { useHistory } from "./useHistory";

const CONSTANTS = {
  SEGMENTS: 50,
  SNAP_THRESHOLD: 10,
  CONTROL_POINT_RADIUS: 6,
} as const;

export const useDrawing = () => {
  const { color, width, tool } = useToolbar();

  const { history, currentStep, appendHistory } = useHistory();

  const [drawing, setDrawing] = useState<Drawing>({
    isDrawing: false,
    currentLine: null,
    currentShape: null,
    controlPoint: null,
    startPoint: null,
    polygonPoints: [],
  });

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
      color: color,
      strokeWidth: width,
      tool: tool,
    };

    const updatedLines = [...history[currentStep].lines, newLine];
    appendHistory(updatedLines, history[currentStep].shapes);
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
      color: color,
      strokeWidth: width,
      tool: tool,
    };

    const updatedLines = [...history[currentStep].lines, newLine];
    appendHistory(updatedLines, history[currentStep].shapes);
    resetDrawing();
  };

  const handleShapeDrawing = (pos: Point, isFirstClick: boolean) => {
    // 첫 번째 클릭: 도형 그리기 시작
    if (isFirstClick) {
      const initialShape = {
        id: crypto.randomUUID(),
        tool: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        stroke: color,
        strokeWidth: width,
        isComplete: false,
      };

      setDrawing((prev) => ({
        ...prev,
        isDrawing: true,
        startPoint: pos,
        currentShape: initialShape,
      }));
      return;
    }

    // 두 번째 클릭: 도형 그리기 완료
    const completedShape = {
      ...drawing.currentShape!,
      isComplete: true,
    };

    const updatedShapes = [...history[currentStep].shapes, completedShape];
    appendHistory(history[currentStep].lines, updatedShapes);
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
        stroke: color,
        strokeWidth: width,
        isComplete: false,
      };

      setDrawing((prev) => ({
        ...prev,
        isDrawing: true,
        startPoint: pos,
        polygonPoints: [pos],
        currentShape: initialShape,
      }));
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

      const updatedShapes = [...history[currentStep].shapes, completedShape];
      appendHistory(history[currentStep].lines, updatedShapes);
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

  return {
    drawing,
    resetDrawing,
    handleLineDrawing,
    handleCurveDrawing,
    handleShapeDrawing,
    handlePolygonDrawing,
    handleLineMove,
    handleCurveMove,
    handleCircleMove,
    handleRectangleMove,
    handlePolygonMove,
    calculateBezierPoints,
  };
};
