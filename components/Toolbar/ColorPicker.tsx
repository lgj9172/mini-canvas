import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ color, setColor, disabled }: ColorPickerProps) {
  const predefinedColors = [
    "#000000", // 검정
    "#6B7280", // gray-500
    "#EF4444", // red-500
    "#F97316", // orange-500
    "#F59E0B", // amber-500
    "#84CC16", // lime-500
    "#10B981", // emerald-500
    "#06B6D4", // cyan-500
    "#3B82F6", // blue-500
    "#6366F1", // indigo-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
  ];

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div
          className={`flex items-center gap-1 p-1 bg-white rounded-md border border-gray-200 ${
            disabled ? "opacity-50" : ""
          }`}
        >
          {predefinedColors.map((presetColor) => (
            <Tooltip key={presetColor}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setColor(presetColor)}
                  disabled={disabled}
                  className={`w-6 h-6 rounded-md ${
                    color === presetColor
                      ? "ring-2 ring-black ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  } transition-all`}
                  style={{
                    backgroundColor: presetColor,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{presetColor}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Separator orientation="vertical" className="h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={disabled}
                  className="w-6 h-6 rounded cursor-pointer opacity-0 absolute inset-0"
                  title="색상 선택"
                />
                <div
                  className={`w-6 h-6 rounded-md ${
                    color === color
                      ? "ring-2 ring-black ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                  } transition-all`}
                  style={{
                    backgroundColor: color,
                  }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{color}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
