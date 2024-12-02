import { Slider } from "@/components/ui/slider";
import { useToolbar } from "@/hooks/useToolbar";

interface WidthControlProps {
  disabled?: boolean;
}

export function WidthControl({ disabled }: WidthControlProps) {
  const { width, minWidth, maxWidth, setWidth } = useToolbar();

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
          {width}px
        </span>
      </div>
      <Slider
        value={[width]}
        onValueChange={([value]) => setWidth(value)}
        min={minWidth}
        max={maxWidth}
        step={1}
        disabled={disabled}
        className="w-[140px]"
      />
    </div>
  );
}
