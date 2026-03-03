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
    const initWindow = async () => {
      try {
        const win = getCurrentWindow();
        await win.center();
        await win.setSize(new LogicalSize(420, 705)); // Slight increase to account for border
        await win.show();
        await win.setFocus();
      } catch (e) {
        console.error("Window Lifecycle Error", e);
      }
    };
    initWindow();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <Dashboard />;
      case "profile": return <Profile />;
      case "sprint": return <Sprint />;
      default: return <Dashboard />;
    }
  };

  return (
    <div
      ref={rootRef}
      style={{
        width: '420px',
        height: '700px',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        position: 'relative',
        background: 'transparent'
      }}
    >
      {/* Explicit Drag Handle Bar (Aesthetic & Functional) */}
      <div
        data-tauri-drag-region
        style={{
          height: '24px',
          background: 'rgba(5,5,15,0.8)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          zIndex: 1000,
          borderRadius: '1.5rem 1.5rem 0 0'
        }}
        className="drag-handle"
      >
        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
      </div>

      <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '0 0 2rem 2rem' }}>
        <Header />

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderView()}
        </div>

        <Terminal />
        <Navigation />

        {/* Portals */}
        <CommandPalette />
        <AddTaskModal />
        <CreateSprintModal />
        <SprintSummaryModal />
        <ToastNotification />
      </div>
    </div>
  );
}