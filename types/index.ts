import { CircleConfig } from "konva/lib/shapes/Circle";
import { LineConfig } from "konva/lib/shapes/Line";
import { RectConfig } from "konva/lib/shapes/Rect";
import { Vector2d } from "konva/lib/types";

export interface Drawing {
  isDrawing: boolean;
  currentLine: number[] | null;
  currentShape: (LineConfig | CircleConfig | RectConfig) | null;
  controlPoint: Vector2d | null;
  startPoint: Vector2d | null;
  polygonPoints: Vector2d[];
}

export interface ToolbarProps {
  disabled?: boolean;
}
