import { memo } from "react";
import { Separator } from "@/components/ui/separator";
import { ActionButtons } from "./ActionButtons";
import { ColorPicker } from "./ColorPicker";
import { ToolSelector } from "./ToolSelector";
import { WidthControl } from "./WidthControl";

export const Toolbar = memo(function Toolbar() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 p-4 bg-background border rounded-lg shadow-lg flex items-center gap-6 z-50">
      <div className="flex items-center gap-6">
        <ToolSelector />
        <Separator orientation="vertical" className="h-8" />
        <ColorPicker />
        <Separator orientation="vertical" className="h-8" />
        <WidthControl />
        <Separator orientation="vertical" className="h-8" />
        <ActionButtons />
      </div>
    </div>
  );
});
