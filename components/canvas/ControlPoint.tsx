import { Circle } from "react-konva";
import { Vector2d } from "konva/lib/types";

export const ControlPoint = ({ x, y }: Vector2d) => (
  <Circle
    x={x}
    y={y}
    radius={6}
    fill="#EF4444"
    stroke="#DC2626"
    strokeWidth={2}
  />
);
