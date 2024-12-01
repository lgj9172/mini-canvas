import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Undo2, Redo2, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface ActionButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentStep: number;
  totalSteps: number;
  disabled?: boolean;
}

export function ActionButtons({
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  currentStep,
  totalSteps,
  disabled,
}: ActionButtonsProps) {
  const progress = totalSteps === 0 ? 0 : (currentStep / totalSteps) * 100;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-1 p-1 bg-white rounded-md border border-gray-200 ${
            disabled ? "opacity-50" : ""
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo || disabled}
                className="h-6 w-6"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>실행 취소 (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo || disabled}
                className="h-6 w-6"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>다시 실행 (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                disabled={disabled}
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>모두 지우기</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className={`flex flex-col gap-1 ${disabled ? "opacity-50" : ""}`}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">작업</span>
            <span className="text-xs font-medium">
              {currentStep} / {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-[6px] w-[140px]" />
        </div>
      </div>
    </TooltipProvider>
  );
}
