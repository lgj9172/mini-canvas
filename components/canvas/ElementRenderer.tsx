import { Line, Circle, Rect } from "react-konva";
import { LineConfig } from "konva/lib/shapes/Line";
import { CircleConfig } from "konva/lib/shapes/Circle";
import { RectConfig } from "konva/lib/shapes/Rect";
import { ControlPoint } from "./ControlPoint";
import { Vector2d } from "konva/lib/types";

interface ElementRendererProps {
  element: LineConfig | CircleConfig | RectConfig;
  controlPoint?: Vector2d;
  startPoint?: Vector2d;
  points?: Vector2d[];
  opacity?: number;
}

export const ElementRenderer = ({
  element,
  opacity = 1,
  controlPoint,
  startPoint,
  points,
}: ElementRendererProps) => {
  // 선
  if ("points" in element && !points) {
    return (
      <>
        <Line {...element} opacity={opacity} />
        {controlPoint && (
          <>
            <Line
              points={[
                element.points[0],
                element.points[1],
                controlPoint.x,
                controlPoint.y,
              ]}
              stroke="#EF4444"
              strokeWidth={1}
              dash={[5, 5]}
              opacity={0.5}
            />
            <ControlPoint {...controlPoint} />
          </>
        )}
      </>
    );
  }

  // 다각형
  if ("points" in element && points) {
    return (
      <>
        <Line {...element} opacity={opacity} />
        <ControlPoint x={points[0].x} y={points[0].y} />
        {controlPoint && (
          <>
            <Line
              points={[
                points[0].x,
                points[0].y,
                controlPoint.x,
                controlPoint.y,
              ]}
              stroke="#EF4444"
              strokeWidth={1}
              dash={[5, 5]}
              opacity={0.5}
            />
            <ControlPoint {...controlPoint} />
          </>
        )}
      </>
    );
  }

  // 원
  if ("radius" in element) {
    return (
      <>
        <Circle {...element} opacity={opacity} />
        {startPoint && <ControlPoint {...startPoint} />}
      </>
    );
  }

  // 네모
  if ("width" in element && "height" in element) {
    return <Rect {...element} opacity={opacity} />;
  }

  return null;
};
