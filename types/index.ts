export type Tool = "line" | "curve" | "circle" | "rectangle" | "polygon";

export interface Point {
  x: number;
  y: number;
}

export interface LineType {
  points: number[];
  color: string;
  strokeWidth: number;
  tool: Tool;
}

export interface ShapeType {
  id: string;
  tool: string;
  points?: number[];
  x?: number;
  y?: number;
  radius?: number;
  width?: number;
  height?: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  isDragging?: boolean;
  isComplete: boolean;
}

export interface Snapshot {
  lines: LineType[];
  shapes: ShapeType[];
}

export interface Drawing {
  isDrawing: boolean; // 현재 그리기 진행 중인지 여부
  currentLine: number[] | null; // 현재 그리고 있는 선
  currentShape: ShapeType | null; // 현재 그리고 있는 도형
  controlPoint: Point | null; // 곡선 그리기용 제어점
  startPoint: Point | null; // 도형 시작점
  polygonPoints: Point[]; // 다각형 꼭지점들
}

export interface ToolbarProps {
  disabled?: boolean;
}
