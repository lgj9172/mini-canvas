import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDrawingStore } from "@/hooks/useDrawing";
import { useToolbar } from "@/hooks/useToolbar";
import { Circle, Hexagon, Minus, Spline, Square } from "lucide-react";

export const ToolSelector = memo(function ToolSelector() {
  const tools = [
    { value: "line", label: "직선", icon: Minus },
    { value: "curve", label: "곡선", icon: Spline },
    { value: "circle", label: "원", icon: Circle },
    { value: "rectangle", label: "사각형", icon: Square },
    { value: "polygon", label: "다각형", icon: Hexagon },
  ];

  const { tool, setTool } = useToolbar();
  const { isDrawing: disabled } = useDrawingStore();

  return (
    <Select value={tool} onValueChange={setTool} disabled={disabled}>
      <SelectTrigger className="w-[140px]" disabled={disabled}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {tools.map((tool) => (
          <SelectItem key={tool.value} value={tool.value}>
            <div className="flex items-center gap-2">
              <tool.icon className="h-4 w-4" />
              <span>{tool.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
