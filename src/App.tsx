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
import { Terminal } from "./components/Terminal";
import { useEffect, useRef } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

export default function App() {
  const { currentView } = useUIStore();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("GrindOS: Neural Link initializing...");
    const initWindow = async () => {
      try {
        const win = getCurrentWindow();
        console.log("Tauri Window context acquired.");
        await win.center();
        await win.setSize(new LogicalSize(420, 700));
        await win.show();
        await win.setFocus();
        console.log("Window lifecycle finalized.");
      } catch (e) {
        console.error("CRITICAL WINDOW FAILURE", e);
      }
    };
    initWindow();
  }, []);

  const renderView = () => {
    try {
      switch (currentView) {
        case "dashboard": return <Dashboard />;
        case "profile": return <Profile />;
        case "sprint": return <Sprint />;
        default: return <Dashboard />;
      }
    } catch (e) {
      return (
        <div className="p-10 text-red-500 font-mono text-xs">
          CRITICAL RENDER FAILURE: {String(e)}
        </div>
      );
    }
  };

  return (
    <div
      ref={rootRef}
      className="w-[420px] min-h-[700px] text-slate-100 font-inter p-2 bg-[#050510]"
      style={{ backgroundImage: "url('./src/assets/premium_bg.png')", backgroundSize: 'cover' }}
    >
      <div className="flex flex-col min-h-[650px] overflow-hidden glass rounded-[2.5rem] border border-white/20 shadow-2xl relative bg-[#050510]/80 backdrop-blur-3xl">
        <div data-tauri-drag-region className="absolute top-0 left-0 right-0 h-16 z-[150] cursor-grab" />

        <Header />

        <div className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-y-auto no-scrollbar relative p-4">
            {renderView()}
          </div>
        </div>

        <Terminal />
        <Navigation />

        <CommandPalette />
        <AddTaskModal />
        <CreateSprintModal />
        <SprintSummaryModal />
        <ToastNotification />
      </div>
    </div>
  );
}