import { create } from "zustand";
import { LineType, ShapeType, Snapshot } from "@/types";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 41;
const STORAGE_KEY = "drawing-history";

interface HistoryState {
  history: Snapshot[];
  currentStep: number;
  appendHistory: (newLines: LineType[], newShapes: ShapeType[]) => void;
  undoHistory: () => void;
  redoHistory: () => void;
  resetHistory: () => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [{ lines: [], shapes: [] }],
      currentStep: 0,

      appendHistory: (newLines, newShapes) => {
        set((state) => {
          const newHistory = state.history.slice(0, state.currentStep + 1);
          newHistory.push({ lines: newLines, shapes: newShapes });

          if (newHistory.length > MAX_HISTORY) {
            return {
              history: newHistory.slice(newHistory.length - MAX_HISTORY),
              currentStep: MAX_HISTORY - 1,
            };
          }

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
            const currentSnapshot = state.history[newStep];

            return {
              currentStep: newStep,
              history: state.history.map((snapshot, index) =>
                index === newStep
                  ? {
                      lines: currentSnapshot.lines,
                      shapes: currentSnapshot.shapes,
                    }
                  : snapshot
              ),
            };
          }
          return state;
        });
      },

      redoHistory: () => {
        set((state) => {
          if (state.currentStep < state.history.length - 1) {
            const newStep = state.currentStep + 1;
            const currentSnapshot = state.history[newStep];

            return {
              currentStep: newStep,
              history: state.history.map((snapshot, index) =>
                index === newStep
                  ? {
                      lines: currentSnapshot.lines,
                      shapes: currentSnapshot.shapes,
                    }
                  : snapshot
              ),
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
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      merge: (persistedState: any, currentState: HistoryState) => {
        return {
          ...currentState,
          ...persistedState,
          history: persistedState.history || currentState.history,
          currentStep: persistedState.currentStep || currentState.currentStep,
        };
      },
    }
  )
);
