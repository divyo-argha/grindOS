import { useEffect } from "react";
import { Trophy, Target, CheckCircle2, Plus, Zap, Flame, Clock } from "lucide-react";
import { useSprintStore } from "../store/sprintStore";
import { useTaskStore } from "../store/taskStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { TaskCard } from "../components/TaskCard";
import { format } from "date-fns";

export function Sprint() {
    const { activeSprint, fetchActiveSprint, completeSprint } = useSprintStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { user, fetchUser } = useUserStore();
    const { setAddSprintOpen, setAddTaskOpen, showNotification } = useUIStore();

    useEffect(() => {
        fetchActiveSprint();
        fetchTasks();
    }, []);

    async function handleFinishSprint() {
        if (!activeSprint || !user) return;
        try {
            await completeSprint(activeSprint.id, activeSprint.earned_xp, user.rating);
            await fetchUser();
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

    if (!activeSprint) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in relative no-scrollbar overflow-y-auto">
                <div className="relative mb-8 pt-10">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-2xl animate-float">
                        <Trophy size={60} className="text-slate-700" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-indigo-500 p-2 rounded-xl shadow-lg border border-indigo-400 rotate-12">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">No Active Protocol</h2>
                <p className="text-sm text-slate-500 max-w-sm mb-10 leading-relaxed font-medium uppercase tracking-tight">
                    Sprints are dedicated bursts of productivity. Start one to focus on your mission and climb the global ranks.
                </p>

                <button
                    onClick={() => setAddSprintOpen(true)}
                    className="group flex items-center gap-3 bg-white text-slate-950 px-8 py-5 rounded-2xl font-black transition-all shadow-xl shadow-white/10 hover:shadow-white/20 active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    START NEW PROTOCOL
                </button>
            </div>
        );
    }

    const daysLeft = Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000));
    const isOverdue = daysLeft === 0 && new Date(activeSprint.end_date) < new Date();

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar animate-fade-in relative pb-20">
            {/* Premium Header */}
            <div className="px-8 pt-12 pb-12 glass-morphism border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Flame size={200} />
                </div>

                <div className="relative z-10 flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-indigo-500/20">Protocol Active</span>
                            {isOverdue && <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-red-500/20">Critical Deadline</span>}
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{activeSprint.name}</h1>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-black text-white leading-none tabular-nums">{daysLeft}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Days Remaining</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="flex items-center gap-3 glass-card p-3 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Clock size={16} />
                        </div>
                        <div>
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ends</div>
                            <div className="text-[10px] font-bold text-slate-200">{format(new Date(activeSprint.end_date), "MMM dd")}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 glass-card p-3 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                            <Target size={16} />
                        </div>
                        <div>
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Target</div>
                            <div className="text-[10px] font-bold text-slate-200">{activeSprint.minimum_target_xp} XP</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 glass-card p-3 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Trophy size={16} />
                        </div>
                        <div>
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Class</div>
                            <div className="text-[10px] font-bold text-slate-200">{activeSprint.difficulty_rating}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white leading-none tabular-nums">{sprintProgress}%</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Link Sync</span>
                        </div>
                        <div className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 shadow-inner">
                            {activeSprint.earned_xp} / {activeSprint.minimum_target_xp} XP
                        </div>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative"
                            style={{ width: `${Math.min(100, sprintProgress)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Protocol Backlog</h3>
                        <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">OBJECTIVES ({sprintTasks.length})</p>
                    </div>
                    <button
                        onClick={() => setAddTaskOpen(true)}
                        className="flex items-center gap-2 text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-2 rounded-lg border border-indigo-400/20 hover:bg-indigo-400/20 transition-all uppercase tracking-widest"
                    >
                        <Plus size={14} />
                        ADD
                    </button>
                </div>

                <div className="space-y-4">
                    {sprintTasks.length === 0 ? (
                        <div className="glass-card rounded-[2rem] p-12 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-50">
                            <Plus size={32} className="text-slate-700 mb-3" />
                            <h4 className="text-slate-200 text-xs font-black uppercase tracking-widest">Backlog Clear</h4>
                        </div>
                    ) : (
                        sprintTasks.map(task => (
                            <div key={task.id} className="transition-all hover:scale-[1.01]">
                                <TaskCard task={task} />
                            </div>
                        ))
                    )}
                </div>

                {/* Completion Action */}
                {sprintProgress >= 100 && (
                    <div className="mt-12 glass-morphism p-6 rounded-[2rem] border border-green-500/20 shadow-lg relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Sync Complete</h4>
                                <p className="text-[10px] text-green-200/50 font-bold uppercase mt-1">Ready for protocol finalization</p>
                            </div>
                            <button
                                onClick={handleFinishSprint}
                                className="w-full bg-green-500 text-green-950 py-4 rounded-xl font-black text-xs hover:bg-green-400 transition-all active:scale-95 uppercase tracking-widest"
                            >
                                FINISH SPRINT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
