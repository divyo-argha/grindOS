import { create } from "zustand";

type View = "dashboard" | "tasks" | "sprint" | "backlog" | "profile" | "analytics" | "settings";

interface UIStore {
    currentView: View;
    commandOpen: boolean;
    addTaskOpen: boolean;
    addSprintOpen: boolean;
    selectedTaskId: number | null;
    notification: { message: string; type: "success" | "error" | "info" } | null;
    setView: (view: View) => void;
    setCommandOpen: (open: boolean) => void;
    setAddTaskOpen: (open: boolean) => void;
    setAddSprintOpen: (open: boolean) => void;
    setSelectedTask: (id: number | null) => void;
    showNotification: (message: string, type?: "success" | "error" | "info") => void;
}

export const useUIStore = create<UIStore>((set) => ({
    currentView: "dashboard",
    commandOpen: false,
    addTaskOpen: false,
    addSprintOpen: false,
    selectedTaskId: null,
    notification: null,

    setView: (view) => set({ currentView: view }),
    setCommandOpen: (open) => set({ commandOpen: open }),
    setAddTaskOpen: (open) => set({ addTaskOpen: open }),
    setAddSprintOpen: (open) => set({ addSprintOpen: open }),
    setSelectedTask: (id) => set({ selectedTaskId: id }),
    showNotification: (message, type = "info") => {
        set({ notification: { message, type } });
        setTimeout(() => set({ notification: null }), 3000);
    },
}));