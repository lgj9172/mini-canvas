import { Slider } from "@/components/ui/slider";

interface StrokeWidthControlProps {
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  disabled?: boolean;
}

export function StrokeWidthControl({
  strokeWidth,
  onStrokeWidthChange,
  disabled,
}: StrokeWidthControlProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span
          className={`text-xs text-muted-foreground ${
            disabled ? "opacity-50" : ""
          }`}
        >
          선 굵기
        </span>
        <span className={`text-xs font-medium ${disabled ? "opacity-50" : ""}`}>
          {strokeWidth}px
        </span>
      </div>
      <Slider
        value={[strokeWidth]}
        onValueChange={([value]) => onStrokeWidthChange(value)}
        min={5}
        max={50}
        step={1}
        disabled={disabled}
        className="w-[140px]"
      />
    </div>
  );
}
