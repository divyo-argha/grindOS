import { useEffect } from "react";
import { Trophy, Target, CheckCircle2, Plus, ArrowRight, Zap, Flame, Clock, ChevronRight } from "lucide-react";
import { useSprintStore } from "../store/sprintStore";
import { useTaskStore } from "../store/taskStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { TaskCard } from "../components/TaskCard";
import { format } from "date-fns";
import { getSprintSummaryMessage } from "../engines/sprintEngine";

export function Sprint() {
    const { activeSprint, fetchActiveSprint, completeSprint } = useSprintStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { user, fetchUser } = useUserStore();
    const { setAddSprintOpen, setAddTaskOpen, setSprintSummaryOpen, showNotification } = useUIStore();

    useEffect(() => {
        fetchActiveSprint();
        fetchTasks();
    }, []);

    async function handleFinishSprint() {
        if (!activeSprint || !user) return;
        try {
            await completeSprint(activeSprint.id, activeSprint.earned_xp, user.rating);
            await fetchUser();
            setSprintSummaryOpen(true);
            showNotification("Sprint completed!", "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to complete sprint", "error");
        }
    }

    const sprintTasks = tasks.filter(t => t.sprint_id === activeSprint?.id);
    const sprintProgress = activeSprint
        ? Math.round((activeSprint.earned_xp / activeSprint.minimum_target_xp) * 100)
        : 0;

    const summaryMessage = activeSprint ? getSprintSummaryMessage(activeSprint.earned_xp, activeSprint.minimum_target_xp) : null;

    if (!activeSprint) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-2xl animate-float">
                        <Trophy size={60} className="text-slate-700" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-indigo-500 p-2 rounded-xl shadow-lg border border-indigo-400 rotate-12">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white mb-3">No Active Protocol</h2>
                <p className="text-sm text-slate-500 max-w-sm mb-10 leading-relaxed">
                    Sprints are dedicated bursts of productivity. Start one to focus on your mission and climb the global ranks.
                </p>

                <button
                    onClick={() => setAddSprintOpen(true)}
                    className="group flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-95"
                >
                    <Plus size={20} />
                    START NEW SPRINT
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
            </div>
        );
    }

    const daysLeft = Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000));
    const isOverdue = daysLeft === 0 && new Date(activeSprint.end_date) < new Date();

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            {/* Premium Header */}
            <div className="px-8 pt-10 pb-12 glass-morphism border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Flame size={200} />
                </div>

                <div className="relative z-10 flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded border border-indigo-500/30">Active Protocol</span>
                            {isOverdue && <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded border border-red-500/30">Deadline Passed</span>}
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none">{activeSprint.name}</h1>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-black text-white leading-none">{daysLeft}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Days Remaining</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ends</div>
                            <div className="text-xs font-bold text-slate-200">{format(new Date(activeSprint.end_date), "MMM dd, yyyy")}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                            <Target size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Goal</div>
                            <div className="text-xs font-bold text-slate-200">{activeSprint.minimum_target_xp} XP</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Difficulty</div>
                            <div className="text-xs font-bold text-slate-200">{activeSprint.difficulty_rating} Class</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white leading-none">{sprintProgress}%</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">Synchronized</span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                            <span className="text-indigo-400 font-bold">{activeSprint.earned_xp}</span> / {activeSprint.minimum_target_xp} XP
                        </div>
                    </div>
                    {summaryMessage && (
                        <p className="text-sm font-bold text-slate-200 leading-relaxed mb-4 italic opacity-80">
                            "{summaryMessage.subtitle}"
                        </p>
                    )}
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative"
                            style={{ width: `${Math.min(100, sprintProgress)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex-1 overflow-y-auto px-8 py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Sprint Backlog</h3>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">PRIMARY OBJECTIVES ({sprintTasks.length})</p>
                        </div>
                        <button
                            onClick={() => setAddTaskOpen(true)}
                            className="flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-4 py-2 rounded-lg border border-indigo-400/20 hover:bg-indigo-400/20 transition-all"
                        >
                            <Plus size={14} />
                            ADD OBJECTIVE
                        </button>
                    </div>

                    <div className="space-y-4">
                        {sprintTasks.length === 0 ? (
                            <div className="glass-card rounded-3xl p-16 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                                <Plus size={40} className="text-slate-700 mb-4" />
                                <h4 className="text-slate-100 font-bold mb-1">Backlog Empty</h4>
                                <p className="text-xs text-slate-500">No primary objectives assigned to this protocol.</p>
                            </div>
                        ) : (
                            sprintTasks.map(task => (
                                <div key={task.id} className="transition-all hover:scale-[1.01] hover:-translate-y-0.5">
                                    <TaskCard task={task} />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Completion Action */}
                    {sprintProgress >= 100 && (
                        <div className="mt-20 glass-morphism p-8 rounded-[2rem] border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden group animate-bounce-slow">
                            <div className="absolute inset-0 bg-green-500/5 rotate-12 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 shadow-inner">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white leading-tight">Sync Complete</h4>
                                        <p className="text-sm text-green-200/50 font-medium">Target goal surpassed. Protocol ready for finalization.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleFinishSprint}
                                    className="w-full md:w-auto bg-green-500 text-green-950 px-10 py-5 rounded-2xl font-black text-sm hover:bg-green-400 shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    FINISH SPRINT
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
