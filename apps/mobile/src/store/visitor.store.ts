import { create } from 'zustand';

interface VisitorState {
  currentVisitor: any | null;
  setCurrentVisitor: (visitor: any) => void;
}

export const useVisitorStore = create<VisitorState>((set) => ({
  currentVisitor: null,
  setCurrentVisitor: (visitor) => set({ currentVisitor: visitor }),
}));
