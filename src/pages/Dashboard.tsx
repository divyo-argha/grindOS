import { useEffect } from "react";
import { Plus, Trophy, Zap, ChevronRight } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useSprintStore } from "../store/sprintStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { TaskCard } from "../components/TaskCard";

export function Dashboard() {
    const { tasks, fetchTasks } = useTaskStore();
    const { activeSprint, fetchActiveSprint } = useSprintStore();
    const { fetchUser } = useUserStore();
    const { setAddTaskOpen, setView } = useUIStore();

    useEffect(() => {
        fetchTasks({ isBacklog: false });
        fetchActiveSprint();
        fetchUser();
    }, []);

    const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "failed" && !t.is_backlog);

    const sprintProgress = activeSprint
        ? Math.round((activeSprint.earned_xp / activeSprint.minimum_target_xp) * 100)
        : 0;
    const sprintDaysLeft = activeSprint
        ? Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000))
        : 0;

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="px-6 py-4 space-y-6">
                {/* Active Sprint Section */}
                {activeSprint ? (
                    <div
                        onClick={() => setView("sprint")}
                        className="glass-card rounded-[3rem] p-10 border border-white/20 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all duration-700 active:scale-[0.98] bg-white/[0.05] animate-pulse-slow"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700">
                            <Trophy size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        Protocol Active
                                    </h3>
                                    <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{activeSprint.name}</h2>
                                </div>
                                <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{sprintDaysLeft}D REMAINING</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white italic">{sprintProgress}%</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Yield</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                                        <Zap size={10} className="text-yellow-500" />
                                        <span>{activeSprint.earned_xp} / {activeSprint.minimum_target_xp}</span>
                                    </div>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                        style={{ width: `${Math.min(100, sprintProgress)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setView("sprint")}
                        className="glass-card rounded-[2.5rem] p-10 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/20 transition-all group active:scale-[0.98]"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all duration-500">
                            <Plus size={36} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <h4 className="text-white font-black uppercase tracking-widest text-sm">No Active Protocol</h4>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em] font-black">Initialize neural focus sequence</p>
                    </div>
                )}

                {/* Objectives List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Primary Objectives</h3>
                        </div>
                        <button
                            onClick={() => setAddTaskOpen(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 transition-all border border-white/5"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activeTasks.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                                <Zap size={48} className="mb-4 text-slate-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Registry Clear</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeTasks.slice(0, 5).map(task => (
                                    <TaskCard key={task.id} task={task} compact />
                                ))}
                            </div>
                        )}

                        {activeTasks.length > 5 && (
                            <button
                                onClick={() => setView("tasks")}
                                className="w-full flex items-center justify-center gap-3 py-4 glass-card rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white hover:border-indigo-500/30 transition-all group"
                            >
                                Analysis: {activeTasks.length - 5} Additional Objectives
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}