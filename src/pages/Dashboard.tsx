import { useEffect } from "react";
import { Zap, Target, TrendingUp, Plus, Command } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useSprintStore } from "../store/sprintStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { TaskCard } from "../components/TaskCard";
import { RatingBadge } from "../components/RatingBadge";
import { getMotivationalMessage } from "../engines/gamificationEngine";
import { format } from "date-fns";

export function Dashboard() {
    const { tasks, fetchTasks } = useTaskStore();
    const { activeSprint, fetchActiveSprint } = useSprintStore();
    const { user, fetchUser } = useUserStore();
    const { setAddTaskOpen, setCommandOpen, setView } = useUIStore();

    useEffect(() => {
        fetchTasks({ isBacklog: false });
        fetchActiveSprint();
        fetchUser();
    }, []);

    const today = new Date().toISOString().split("T")[0];
    const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "failed" && !t.is_backlog);
    const completedToday = tasks.filter(t => t.completed_at?.startsWith(today));
    const todayXP = completedToday.reduce((sum, t) => sum + t.xp_value, 0);

    const sprintProgress = activeSprint
        ? Math.round((activeSprint.earned_xp / activeSprint.maximum_possible_xp) * 100)
        : 0;
    const sprintDaysLeft = activeSprint
        ? Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000))
        : 0;

    return (
        <div className="flex flex-col h-full bg-surface-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
                <div className="flex items-center gap-3">
                    {user && <RatingBadge rating={user.rating} size="sm" />}
                    {user && user.current_streak > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-orange-400 text-sm">🔥</span>
                            <span className="text-xs text-orange-400 font-mono">{user.current_streak}d</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Zap size={13} className="text-yellow-400" />
                        <span className="text-xs font-mono text-yellow-400">{todayXP} XP today</span>
                    </div>
                    <button
                        onClick={() => setCommandOpen(true)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors bg-surface-2 px-2 py-1 rounded border border-surface-3"
                    >
                        <Command size={11} />
                        <span>⌃Space</span>
                    </button>
                </div>
            </div>

            {/* Sprint Bar */}
            {activeSprint ? (
                <div className="px-4 py-2 border-b border-surface-3 bg-surface-1">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-400 font-medium">{activeSprint.name}</span>
                        <span className="text-xs text-slate-500 font-mono">{sprintDaysLeft}d left • {sprintProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${sprintProgress}%`,
                                background: sprintProgress >= 100 ? "#22c55e" : sprintProgress >= 70 ? "#3b82f6" : sprintProgress >= 40 ? "#f97316" : "#ef4444"
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-600">{activeSprint.earned_xp} / {activeSprint.minimum_target_xp} XP (target)</span>
                        <button onClick={() => setView("sprint")} className="text-xs text-blue-400 hover:underline">View Sprint →</button>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-2 border-b border-surface-3 bg-surface-1 flex items-center justify-between">
                    <span className="text-xs text-slate-600">No active sprint</span>
                    <button onClick={() => setView("sprint")} className="text-xs text-blue-400 hover:underline">Start Sprint →</button>
                </div>
            )}

            {/* Motivation */}
            {user && (
                <div className="px-4 py-2 text-xs text-slate-500 italic border-b border-surface-3">
                    {getMotivationalMessage(user.rating, user.current_streak, todayXP)}
                </div>
            )}

            {/* Tasks */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {activeTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                        <span className="text-2xl mb-2">🎯</span>
                        <p className="text-sm">No active tasks</p>
                        <button onClick={() => setAddTaskOpen(true)} className="text-xs text-blue-400 mt-1 hover:underline">Add your first task</button>
                    </div>
                ) : (
                    activeTasks.slice(0, 8).map(task => (
                        <TaskCard key={task.id} task={task} compact />
                    ))
                )}
                {activeTasks.length > 8 && (
                    <button onClick={() => setView("tasks")} className="w-full text-xs text-slate-500 hover:text-slate-300 py-1 text-center">
                        +{activeTasks.length - 8} more tasks →
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-3 py-2 border-t border-surface-3">
                <button
                    onClick={() => setAddTaskOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-200 bg-surface-2 hover:bg-surface-3 py-2 rounded-lg border border-surface-3 transition-all"
                >
                    <Plus size={13} />
                    Add Task
                </button>
                <div className="flex gap-1">
                    {(["tasks", "sprint", "profile", "analytics"] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className="px-2 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-surface-2 rounded-lg transition-colors capitalize"
                        >
                            {v === "analytics" ? "📊" : v === "profile" ? "👤" : v === "sprint" ? "⚡" : "📋"}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}