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
  currentElement: {
    config: LineConfig | CircleConfig | RectConfig;
    controlPoint?: Vector2d;
    startPoint?: Vector2d;
    points?: Vector2d[];
  } | null;

  resetDrawing: () => void;
  handleDrawingPoint: (
    pos: Vector2d,
    tool: string,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => void;
  handleDrawingMove: (pos: Vector2d, tool: string) => void;
  calculateBezierPoints: (
    start: Vector2d,
    control: Vector2d,
    end: Vector2d
  ) => number[];
}

export const useDrawing = create<DrawingState>((set, get) => ({
  isDrawing: false,
  currentElement: null,

  resetDrawing: () =>
    set({
      isDrawing: false,
      currentElement: null,
    }),

  handleDrawingPoint: (
    pos: Vector2d,
    tool: string,
    color: string,
    width: number,
    history: any[],
    currentStep: number,
    appendHistory: (elements: any[]) => void
  ) => {
    const state = get();
    const isFirstClick = !state.isDrawing;

    switch (tool) {
      case "line":
        if (isFirstClick) {
          set({
            isDrawing: true,
            currentElement: {
              config: {
                points: [pos.x, pos.y, pos.x, pos.y],
                stroke: color,
                strokeWidth: width,
              },
            },
          });
          return;
        }

        const lineState = get();
        appendHistory([
          ...history[currentStep],
          lineState.currentElement!.config,
        ]);
        get().resetDrawing();
        break;

      case "curve":
        const curveState = get();
        if (!curveState.isDrawing) {
          set({
            isDrawing: true,
            currentElement: {
              config: {
                points: [pos.x, pos.y],
                stroke: color,
                strokeWidth: width,
              },
            },
          });
          return;
        }

        if (!curveState.currentElement?.controlPoint) {
          set({
            currentElement: {
              ...curveState.currentElement!,
              controlPoint: pos,
            },
          });
          return;
        }

        const curveStartPoint = {
          x: curveState.currentElement.config.points![0],
          y: curveState.currentElement.config.points![1],
        };

        const completedCurve = {
          points: get().calculateBezierPoints(
            curveStartPoint,
            curveState.currentElement.controlPoint,
            pos
          ),
          stroke: color,
          strokeWidth: width,
        };
        appendHistory([...history[currentStep], completedCurve]);
        get().resetDrawing();
        break;

      case "circle":
      case "rectangle":
        if (isFirstClick) {
          const initialShape = {
            id: crypto.randomUUID(),
            x: pos.x,
            y: pos.y,
            ...(tool === "circle" ? { radius: 0 } : { width: 0, height: 0 }),
            stroke: color,
            strokeWidth: width,
            isComplete: false,
          };

          set({
            isDrawing: true,
            currentElement: {
              config: initialShape,
              startPoint: pos,
            },
          });
          return;
        }

        const shapeState = get();
        if (shapeState.currentElement) {
          appendHistory([
            ...history[currentStep],
            shapeState.currentElement.config,
          ]);
        }
        get().resetDrawing();
        break;

      case "polygon":
        const polygonState = get();
        const isClosingPolygon = () => {
          const hasMinPoints = polygonState.currentElement?.points?.length! > 2;
          const firstPoint = polygonState.currentElement?.points?.[0];
          if (!firstPoint) return false;

          const distanceToStart = Math.hypot(
            pos.x - firstPoint.x,
            pos.y - firstPoint.y
          );
          return hasMinPoints && distanceToStart < CONSTANTS.SNAP_THRESHOLD;
        };

        if (!polygonState.isDrawing) {
          set({
            isDrawing: true,
            currentElement: {
              config: {
                points: [pos.x, pos.y],
                stroke: color,
                strokeWidth: width,
                isComplete: false,
              },
              points: [pos],
            },
          });
          return;
        }

        if (isClosingPolygon() && polygonState.currentElement) {
          const points = polygonState.currentElement.points?.flatMap((p) => [
            p.x,
            p.y,
          ])!;
          const completedPolygon = {
            ...polygonState.currentElement.config,
            points: [...points, points[0], points[1]],
            isComplete: true,
          };

          appendHistory([...history[currentStep], completedPolygon]);
          get().resetDrawing();
          return;
        }

        const updatedPoints = [
          ...(polygonState.currentElement?.points || []),
          pos,
        ];
        const flattenedPoints = updatedPoints.flatMap((p) => [p.x, p.y]);

        set({
          currentElement: {
            ...polygonState.currentElement!,
            points: updatedPoints,
            config: {
              ...polygonState.currentElement!.config,
              points: flattenedPoints,
            },
          },
        });
        break;
    }
  },

  handleDrawingMove: (pos: Vector2d, tool: string) => {
    const state = get();
    if (!state.isDrawing && tool !== "polygon") return;

    switch (tool) {
      case "line":
        if (!state.currentElement?.config.points) return;
        const points = state.currentElement.config.points;
        set({
          currentElement: {
            ...state.currentElement,
            config: {
              ...state.currentElement.config,
              points: [points[0], points[1], pos.x, pos.y],
            },
          },
        });
        break;

      case "curve":
        if (!state.currentElement?.config.points) return;
        const curveStartPoint = {
          x: state.currentElement.config.points[0],
          y: state.currentElement.config.points[1],
        };
        const curveControlPoint = state.currentElement.controlPoint || pos;
        const curvePoints = get().calculateBezierPoints(
          curveStartPoint,
          curveControlPoint,
          pos
        );
        set({
          currentElement: {
            ...state.currentElement,
            config: {
              ...state.currentElement.config,
              points: curvePoints,
            },
          },
        });
        break;

      case "circle":
        if (!state.currentElement?.startPoint) return;
        const radius = Math.hypot(
          pos.x - state.currentElement.startPoint.x,
          pos.y - state.currentElement.startPoint.y
        );
        set({
          currentElement: {
            ...state.currentElement,
            config: {
              ...state.currentElement.config,
              radius,
            },
          },
        });
        break;

      case "rectangle":
        if (!state.currentElement?.startPoint) return;
        set({
          currentElement: {
            ...state.currentElement,
            config: {
              ...state.currentElement.config,
              width: pos.x - state.currentElement.startPoint.x,
              height: pos.y - state.currentElement.startPoint.y,
            },
          },
        });
        break;

      case "polygon":
        if (!state.currentElement?.points?.length) return;
        const currentPoints = [
          ...state.currentElement.points.flatMap((p) => [p.x, p.y]),
          pos.x,
          pos.y,
        ];
        set({
          currentElement: {
            ...state.currentElement,
            config: {
              ...state.currentElement.config,
              points: currentPoints,
            },
          },
        });
        break;
    }
  },

  calculateBezierPoints: (
    start: Vector2d,
    control: Vector2d,
    end: Vector2d
  ): number[] =>
    Array.from({ length: CONSTANTS.SEGMENTS + 1 })
      .map((_, i) => i / CONSTANTS.SEGMENTS)
      .map((t) => {
        const tInverse = 1 - t;
        return [
          tInverse ** 2 * start.x +
            2 * tInverse * t * control.x +
            t ** 2 * end.x,
          tInverse ** 2 * start.y +
            2 * tInverse * t * control.y +
            t ** 2 * end.y,
        ];
      })
      .flat(),
}));
