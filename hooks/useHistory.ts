import { create } from "zustand";
import { LineType, ShapeType, Snapshot } from "@/types";

interface HistoryState {
  history: Snapshot[];
  currentStep: number;
  appendHistory: (newLines: LineType[], newShapes: ShapeType[]) => void;
  undoHistory: () => void;
  redoHistory: () => void;
  resetHistory: () => void;
}

export const useHistory = create<HistoryState>((set, get) => ({
  history: [{ lines: [], shapes: [] }],
  currentStep: 0,

  appendHistory: (newLines, newShapes) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.currentStep + 1);
      newHistory.push({ lines: newLines, shapes: newShapes });
      return {
        history: newHistory,
        currentStep: newHistory.length - 1,
      };
    });
  },

  undoHistory: () => {
    set((state) => {
      if (state.currentStep > 0) {
        const newStep = state.currentStep - 1;
        return {
          currentStep: newStep,
          lines: state.history[newStep].lines,
          shapes: state.history[newStep].shapes,
        };
      }
      return state;
    });
  },

  redoHistory: () => {
    set((state) => {
      if (state.currentStep < state.history.length - 1) {
        const newStep = state.currentStep + 1;
        return {
          currentStep: newStep,
          lines: state.history[newStep].lines,
          shapes: state.history[newStep].shapes,
        };
      }
      return state;
    });
  },

  resetHistory: () => {
    set({
      history: [{ lines: [], shapes: [] }],
      currentStep: 0,
    });
  },
}));
