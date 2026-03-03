import { useUIStore } from "./store/uiStore";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Sprint } from "./pages/Sprint";
import { CommandPalette } from "./components/CommandPalette";
import { AddTaskModal } from "./components/AddTaskModal";
import { CreateSprintModal } from "./components/CreateSprintModal";
import { SprintSummaryModal } from "./components/SprintSummaryModal";
import { Notification } from "./components/Notification";

// Lazy import other pages to keep it simple for now
function PlaceholderPage({ name }: { name: string }) {
  const { setView } = useUIStore();
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
      <div className="text-4xl">🚧</div>
      <div className="text-sm">{name} — coming soon</div>
      <button onClick={() => setView("dashboard")} className="text-xs text-blue-400 hover:underline">← Dashboard</button>
    </div>
  );
}

export default function App() {
  const { currentView } = useUIStore();

  const views: Record<string, JSX.Element> = {
    dashboard: <Dashboard />,
    profile: <Profile />,
    tasks: <PlaceholderPage name="All Tasks" />,
    sprint: <Sprint />,
    backlog: <PlaceholderPage name="Backlog" />,
    analytics: <PlaceholderPage name="Analytics" />,
    settings: <PlaceholderPage name="Settings" />,
  };

  return (
    <div className="h-screen w-screen bg-surface-0 overflow-hidden dark flex flex-col">
      {views[currentView] || <Dashboard />}
      <CommandPalette />
      <AddTaskModal />
      <CreateSprintModal />
      <SprintSummaryModal />
      <Notification />
    </div>
  );
}