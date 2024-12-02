import { create } from "zustand";
import { LineConfig } from "konva/lib/shapes/Line";
import { CircleConfig } from "konva/lib/shapes/Circle";
import { RectConfig } from "konva/lib/shapes/Rect";
import { Vector2d } from "konva/lib/types";

const CONSTANTS = {
  SEGMENTS: 50,
  SNAP_THRESHOLD: 10,
  CONTROL_POINT_RADIUS: 6,
} as const;

interface DrawingState {
  isDrawing: boolean;
  currentLine: number[] | null;
  currentShape: (LineConfig | CircleConfig | RectConfig) | null;
  controlPoint: Vector2d | null;
  startPoint: Vector2d | null;
  polygonPoints: Vector2d[];

  resetDrawing: () => void;
  handleLineDrawing: (
    pos: Vector2d,
    isFirstClick: boolean,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => void;
  handleCurveDrawing: (
    pos: Vector2d,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => void;
  handleShapeDrawing: (
    pos: Vector2d,
    isFirstClick: boolean,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => void;
  handlePolygonDrawing: (
    pos: Vector2d,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => void;
  handleLineMove: (pos: Vector2d) => void;
  handleCurveMove: (pos: Vector2d) => void;
  handleCircleMove: (pos: Vector2d) => void;
  handleRectangleMove: (pos: Vector2d) => void;
  handlePolygonMove: (pos: Vector2d) => void;
  calculateBezierPoints: (
    start: Vector2d,
    control: Vector2d,
    end: Vector2d
  ) => number[];
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // 초기 상태
  isDrawing: false,
  currentLine: null,
  currentShape: null,
  controlPoint: null,
  startPoint: null,
  polygonPoints: [],

  // 그리기 상태 초기화
  resetDrawing: () =>
    set({
      isDrawing: false,
      currentLine: null,
      currentShape: null,
      controlPoint: null,
      startPoint: null,
      polygonPoints: [],
    }),

  // 선 그리기 처리
  handleLineDrawing: (
    pos: Vector2d,
    isFirstClick: boolean,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => {
    // 첫 번째 클릭: 선 그리기 시작
    if (isFirstClick) {
      set({
        isDrawing: true,
        currentLine: [pos.x, pos.y, pos.x, pos.y],
      });
      return;
    }

    // 두 번째 클릭: 선 그리기 완료
    const state = get();
    const newLine = {
      points: state.currentLine!,
      stroke: color,
      strokeWidth: width,
    };

    const updatedElements = [...history[currentStep], newLine];
    appendHistory(updatedElements);
    get().resetDrawing();
  },

  // 곡선 그리기 처리
  handleCurveDrawing: (
    pos: Vector2d,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => {
    const state = get();
    // 시작점 설정
    if (!state.isDrawing) {
      set({
        isDrawing: true,
        currentLine: [pos.x, pos.y],
      });
      return;
    }

    // 제어점 설정
    if (!state.controlPoint) {
      set({ controlPoint: pos });
      return;
    }

    // 곡선 완성
    const startPoint = {
      x: state.currentLine![0],
      y: state.currentLine![1],
    };

    const newLine = {
      points: get().calculateBezierPoints(startPoint, state.controlPoint, pos),
      stroke: color,
      strokeWidth: width,
    };

    const updatedElements = [...history[currentStep], newLine];
    appendHistory(updatedElements);
    get().resetDrawing();
  },

  // 도형 그리기 처리
  handleShapeDrawing: (
    pos: Vector2d,
    isFirstClick: boolean,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => {
    if (isFirstClick) {
      // 명시적으로 RectConfig 타입의 초기 도형만 생성
      const initialShape: RectConfig = {
        id: crypto.randomUUID(),
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: color,
        strokeWidth: width,
        isComplete: false,
      };

      set({
        isDrawing: true,
        startPoint: pos,
        currentShape: initialShape,
      });
      return;
    }

    // 두 번째 클릭: 도형 그리기 완료
    const state = get();
    const completedShape = {
      ...state.currentShape!,
      isComplete: true,
    };

    const updatedElements = [...history[currentStep], completedShape];
    appendHistory(updatedElements);
    get().resetDrawing();
  },

  // 다각형 그리기 처리
  handlePolygonDrawing: (
    pos: Vector2d,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => {
    const state = get();
    // 시작점 근처인지 확인 (다각형 완성 조건)
    const isNearStartPoint = () => {
      const hasMinPoints = state.polygonPoints.length > 2;
      const distanceToStart = Math.hypot(
        pos.x - state.polygonPoints[0].x,
        pos.y - state.polygonPoints[0].y
      );
      return hasMinPoints && distanceToStart < 10;
    };

    // 다각형 그리기 시작
    if (!state.isDrawing) {
      const initialShape = {
        id: crypto.randomUUID(),
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: width,
        isComplete: false,
      };

      set({
        isDrawing: true,
        startPoint: pos,
        polygonPoints: [pos],
        currentShape: initialShape,
      });
      return;
    }

    // 다각형 완성 (시작점과 연결)
    if (isNearStartPoint() && state.polygonPoints.length > 2) {
      const points = state.polygonPoints.flatMap((p) => [p.x, p.y]);
      const completedShape = {
        ...state.currentShape!,
        points: [...points, points[0], points[1]], // 시작점으로 닫기
        isComplete: true,
      };

      const updatedElements = [...history[currentStep], completedShape];
      appendHistory(updatedElements);
      get().resetDrawing();
      return;
    }

    // 다각형 점 추가
    const updatedPoints = [...state.polygonPoints, pos];
    const flattenedPoints = updatedPoints.flatMap((p) => [p.x, p.y]);

    set({
      polygonPoints: updatedPoints,
      currentShape: {
        ...state.currentShape!,
        points: flattenedPoints,
      },
    });
  },

  // 선 이동 처리
  handleLineMove: (pos: Vector2d) => {
    const state = get();
    if (!state.currentLine) return;

    const updatedLine = [
      state.currentLine[0], // 시작점
      state.currentLine[1],
      pos.x, // 끝점
      pos.y,
    ];

    set({ currentLine: updatedLine });
  },

  // 곡선 이동 처리
  handleCurveMove: (pos: Vector2d) => {
    const state = get();
    const startPoint = {
      x: state.currentLine![0], // 시작점
      y: state.currentLine![1],
    };

    const endPoint = pos; // 끝점
    const controlPoint = state.controlPoint || endPoint; // 제어점

    const points = get().calculateBezierPoints(
      startPoint,
      controlPoint,
      endPoint
    );
    set({ currentLine: points });
  },

  // 원 이동 처리
  handleCircleMove: (pos: Vector2d) => {
    const state = get();
    if (!state.startPoint) return;

    const radius = Math.hypot(
      pos.x - state.startPoint.x,
      pos.y - state.startPoint.y
    ); // 반지름

    set({
      currentShape: {
        ...state.currentShape!,
        radius,
      },
    });
  },

  // 사각형 이동 처리
  handleRectangleMove: (pos: Vector2d) => {
    const state = get();
    if (!state.startPoint) return;

    set({
      currentShape: {
        ...state.currentShape!,
        width: pos.x - state.startPoint.x, // 가로
        height: pos.y - state.startPoint.y, // 세로
      },
    });
  },

  // 다각형 이동 처리
  handlePolygonMove: (pos: Vector2d) => {
    const state = get();
    if (!state.isDrawing || !state.polygonPoints.length) return;

    const points = [
      ...state.polygonPoints.flatMap((p) => [p.x, p.y]), // 다각형 점들
      pos.x, // 끝점
      pos.y,
    ];

    set({
      currentShape: {
        ...state.currentShape!,
        points,
      },
    });
  },

  // 베지어 곡선 계산 함수
  calculateBezierPoints: (
    start: Vector2d,
    control: Vector2d,
    end: Vector2d
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
      .flat(),
}));
