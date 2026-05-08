import { create } from "zustand";

// ---------------------------------------------------------------------------
// App store - global UI state
// ---------------------------------------------------------------------------

type AppState = {
  sidebarOpen: boolean;
  activePillarId: string | null;
  activeSessionId: string | null;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActivePillarId: (id: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activePillarId: null,
  activeSessionId: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePillarId: (id) => set({ activePillarId: id }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
}));
