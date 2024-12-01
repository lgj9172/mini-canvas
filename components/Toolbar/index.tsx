import { Separator } from "@/components/ui/separator";
import { Tool, ToolbarProps } from "@/types";
import { ActionButtons } from "./ActionButtons";
import { ColorPicker } from "./ColorPicker";
import { StrokeWidthControl } from "./StrokeWidthControl";
import { ToolSelector } from "./ToolSelector";

interface ExtendedToolbarProps extends ToolbarProps {
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndoClick: () => void;
  onRedoClick: () => void;
  onResetClick: () => void;
  disabled?: boolean;
}

export function Toolbar({ disabled, ...props }: ExtendedToolbarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 p-4 bg-background border rounded-lg shadow-lg flex items-center gap-6 z-50">
      <div className="flex items-center gap-6">
        <ToolSelector {...props} disabled={disabled} />
        <Separator orientation="vertical" className="h-8" />
        <ColorPicker
          color={props.color}
          setColor={props.onColorChange}
          disabled={disabled}
        />
        <Separator orientation="vertical" className="h-8" />
        <StrokeWidthControl
          strokeWidth={props.strokeWidth}
          onStrokeWidthChange={props.onStrokeWidthChange}
          disabled={disabled}
        />
        <Separator orientation="vertical" className="h-8" />
        <ActionButtons
          onUndo={props.onUndoClick}
          onRedo={props.onRedoClick}
          onReset={props.onResetClick}
          canUndo={props.canUndo}
          canRedo={props.canRedo}
          currentStep={props.currentStep}
          totalSteps={props.totalSteps}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
