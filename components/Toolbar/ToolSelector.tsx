import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tool } from "@/types";
import { Minus, Spline, Circle, Square, Hexagon } from "lucide-react";

interface ToolSelectorProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  disabled?: boolean;
}

export function ToolSelector({
  selectedTool,
  onToolChange,
  disabled,
}: ToolSelectorProps) {
  const tools = [
    { value: "line", label: "직선", icon: Minus },
    { value: "curve", label: "곡선", icon: Spline },
    { value: "circle", label: "원", icon: Circle },
    { value: "rectangle", label: "사각형", icon: Square },
    { value: "polygon", label: "다각형", icon: Hexagon },
  ];

  return (
    <Select
      value={selectedTool}
      onValueChange={onToolChange}
      disabled={disabled}
    >
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
}