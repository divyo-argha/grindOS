import { useUIStore } from "./store/uiStore";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Sprint } from "./pages/Sprint";
import { CommandPalette } from "./components/CommandPalette";
import { AddTaskModal } from "./components/AddTaskModal";
import { CreateSprintModal } from "./components/CreateSprintModal";
import { SprintSummaryModal } from "./components/SprintSummaryModal";
import { Notification as ToastNotification } from "./components/Notification";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { useEffect, useRef } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

// Lazy import other pages to keep it simple for now
function PlaceholderPage({ name }: { name: string }) {
  const { setView } = useUIStore();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
      <div className="text-4xl">🚧</div>
      <div className="text-sm font-black uppercase tracking-widest">{name} — coming soon</div>
      <button onClick={() => setView("dashboard")} className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-4 py-2 rounded-lg border border-indigo-400/20 hover:bg-indigo-400/20 transition-all">← RETURN HOME</button>
    </div>
  );
}

export default function App() {
  const { currentView } = useUIStore();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Padding for the window shadow and aesthetic
        getCurrentWindow().setSize(new LogicalSize(width, height + 40)).catch(console.error);
      }
    });

    if (rootRef.current) observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  const views: Record<string, JSX.Element> = {
    dashboard: <Dashboard />,
    profile: <Profile />,
    tasks: <PlaceholderPage name="All Tasks" />,
    sprint: <Sprint />,
    backlog: <PlaceholderPage name="Backlog" />,
    analytics: <PlaceholderPage name="Intel" />,
    settings: <PlaceholderPage name="Settings" />,
  };

  return (
    <div
      ref={rootRef}
      className="min-h-[100px] w-full max-w-[500px] bg-transparent overflow-hidden dark flex flex-col relative transition-all duration-500 ease-in-out px-4 pb-4 font-inter"
    >
      {/* Draggable Region */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-20 z-[120] cursor-grab active:cursor-grabbing"
      />

      <div className="flex-1 flex flex-col overflow-hidden glass-morphism rounded-[2.5rem] border border-white/5 shadow-2xl relative">
        <Header />

        <div className="flex-1 overflow-hidden relative">
          {views[currentView] || <Dashboard />}
        </div>

        <Navigation />
      </div>

      <CommandPalette />
      <AddTaskModal />
      <CreateSprintModal />
      <SprintSummaryModal />
      <ToastNotification />
    </div>
  );
}