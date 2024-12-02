import { create } from "zustand";
import { LineConfig } from "konva/lib/shapes/Line";
import { ShapeConfig } from "konva/lib/Shape";
import { persist } from "zustand/middleware";

const MAX_HISTORY = 41;
const STORAGE_KEY = "drawing-history";

interface HistoryState {
  history: (LineConfig | ShapeConfig)[][];
  currentStep: number;
  appendHistory: (newElements: (LineConfig | ShapeConfig)[]) => void;
  undoHistory: () => void;
  redoHistory: () => void;
  resetHistory: () => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [[]],
      currentStep: 0,

      appendHistory: (newElements) => {
        set((state) => {
          const newHistory = state.history.slice(0, state.currentStep + 1);
          newHistory.push(newElements);

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
            return {
              currentStep: state.currentStep - 1,
              history: state.history,
            };
          }
          return state;
        });
      },

      redoHistory: () => {
        set((state) => {
          if (state.currentStep < state.history.length - 1) {
            return {
              currentStep: state.currentStep + 1,
              history: state.history,
            };
          }
          return state;
        });
      },

      resetHistory: () => {
        set({
          history: [[]],
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
