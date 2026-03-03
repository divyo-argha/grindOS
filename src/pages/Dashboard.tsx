import { useEffect } from "react";
import { Zap, Target, TrendingUp, Plus, Command, Layout, Trophy, User } from "lucide-react";
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
        ? Math.round((activeSprint.earned_xp / activeSprint.minimum_target_xp) * 100)
        : 0;
    const sprintDaysLeft = activeSprint
        ? Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000))
        : 0;

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            {/* Header / Top Bar */}
            <div className="px-6 py-4 flex items-center justify-between glass-morphism border-b border-white/5 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => setView("profile")}>
                        {user && <RatingBadge rating={user.rating} size="sm" />}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur" />
                    </div>
                    {user && user.current_streak > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                            <span className="text-sm">🔥</span>
                            <span className="text-[10px] text-orange-400 font-black uppercase tracking-tighter">{user.current_streak} DAY STREAK</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400/20" />
                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{todayXP} XP TODAY</span>
                    </div>
                    <button
                        onClick={() => setCommandOpen(true)}
                        className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition-all hover:scale-105"
                        title="Command Palette (Ctrl+Space)"
                    >
                        <Command size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Active Sprint Glass Card */}
                {activeSprint ? (
                    <div
                        onClick={() => setView("sprint")}
                        className="glass-card rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-all duration-500"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Trophy size={100} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <TrendingUp size={14} /> ACTIVE PROTOCOL
                                    </h3>
                                    <h2 className="text-xl font-black text-white leading-tight">{activeSprint.name}</h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{sprintDaysLeft} DAYS LEFT</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-white leading-none">{sprintProgress}%</span>
                                    <span className="text-[10px] font-mono text-slate-400">{activeSprint.earned_xp} / {activeSprint.minimum_target_xp} XP</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                        style={{ width: `${Math.min(100, sprintProgress)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setView("sprint")}
                        className="glass-card rounded-[2rem] p-8 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/20 transition-all group"
                    >
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-slate-700" />
                        </div>
                        <h4 className="text-slate-300 font-bold">No Active Sprint</h4>
                        <p className="text-xs text-slate-500 mt-1">Start a protocol to maximize your gains.</p>
                    </div>
                )}

                {/* Task List Section */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Primary Objectives</h3>
                        <button
                            onClick={() => setAddTaskOpen(true)}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-indigo-400 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {activeTasks.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center opacity-30 italic">
                                <Layout size={32} className="mb-2" />
                                <span className="text-xs">Objective list clear</span>
                            </div>
                        ) : (
                            activeTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="transition-all hover:scale-[1.01] hover:-translate-y-0.5">
                                    <TaskCard task={task} compact />
                                </div>
                            ))
                        )}

                        {activeTasks.length > 5 && (
                            <button
                                onClick={() => setView("tasks")}
                                className="w-full py-3 glass-card rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all"
                            >
                                View {activeTasks.length - 5} More Objectives
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="px-6 py-6 glass-morphism border-t border-white/5 flex items-center justify-between gap-4">
                <button
                    onClick={() => setAddTaskOpen(true)}
                    className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    ADD OBJECTIVE
                </button>

                <div className="flex gap-2">
                    {[
                        { id: "sprint", icon: Zap, color: "#818cf8" },
                        { id: "profile", icon: User, color: "#a78bfa" },
                        { id: "analytics", icon: TrendingUp, color: "#f472b6" }
                    ].map(nav => (
                        <button
                            key={nav.id}
                            onClick={() => setView(nav.id as any)}
                            className="p-4 glass-card rounded-2xl text-slate-500 hover:text-white transition-all hover:scale-105 active:scale-90"
                            style={{ "--hover-color": nav.color } as any}
                        >
                            <nav.icon size={18} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}