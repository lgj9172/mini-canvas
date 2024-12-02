import { create } from "zustand";
import { Tool } from "@/types";

interface ToolbarState {
  tool: Tool;
  color: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
}

export const useToolbar = create<ToolbarState>((set) => ({
  tool: "line",
  color: "#000000",
  width: 5,
  minWidth: 5,
  maxWidth: 50,
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setWidth: (width) => set({ width }),
}));
