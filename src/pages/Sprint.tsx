import { useEffect } from "react";
import { Trophy, Target, CheckCircle2, Plus, Zap, Flame, Clock, ChevronRight } from "lucide-react";
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
            showNotification("PROTOCOL COMPLETE. RATING ADJUSTED.", "success");
        } catch (err) {
            console.error(err);
            showNotification("FINALIZATION FAILURE", "error");
        }
    }

    const sprintTasks = tasks.filter(t => t.sprint_id === activeSprint?.id);
    const sprintProgress = activeSprint
        ? Math.round((activeSprint.earned_xp / activeSprint.minimum_target_xp) * 100)
        : 0;

    if (!activeSprint) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-fade-in relative">
                <div className="relative mb-10 pt-10">
                    <div className="w-40 h-40 bg-white/2 rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_60px_rgba(255,255,255,0.02)] animate-float">
                        <Trophy size={80} className="text-slate-800 opacity-50" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-indigo-500/20 p-3 rounded-2xl shadow-lg border border-indigo-500/30 cyber-glow">
                        <Zap size={24} className="text-indigo-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-4 tracking-[0.2em] uppercase leading-none">Protocol Idle</h2>
                <p className="text-[10px] text-slate-500 max-w-sm mb-12 leading-relaxed font-black uppercase tracking-[0.3em]">
                    High-intensity focus bursts are required for neural advancement. Initiate new sequence.
                </p>

                <button
                    onClick={() => setAddSprintOpen(true)}
                    className="premium-btn group flex items-center gap-4 px-10 py-6"
                >
                    <Plus size={20} />
                    INITIALIZE BURST
                </button>
            </div>
        );
    }

    const daysLeft = Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000));
    const isOverdue = daysLeft === 0 && new Date(activeSprint.end_date) < new Date();

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Premium Header Zone */}
            <div className="px-8 pt-12 pb-14 glass-morphism border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
                    <Flame size={220} />
                </div>

                <div className="relative z-10 flex items-start justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl border border-indigo-500/20 cyber-glow">Neural Burst Active</span>
                            {isOverdue && <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl border border-red-500/20">Link Critical</span>}
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase italic">{activeSprint.name}</h1>
                    </div>

                    <div className="text-right glass-card p-4 rounded-[1.5rem] border border-white/10">
                        <div className="text-3xl font-black text-white leading-none tabular-nums italic">{daysLeft}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Cycles Left</div>
                    </div>
                </div>

                {/* Sub-stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    {[
                        { icon: Clock, label: "Threshold", val: format(new Date(activeSprint.end_date), "MMM dd"), color: "text-blue-400" },
                        { icon: Target, label: "Efficiency", val: `${activeSprint.minimum_target_xp} XP`, color: "text-orange-400" },
                        { icon: Trophy, label: "Class", val: activeSprint.difficulty_rating, color: "text-purple-400" },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col gap-2 bg-white/2 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group">
                            <div className={`p-2 bg-white/5 rounded-lg w-fit ${s.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
                                <s.icon size={16} />
                            </div>
                            <div>
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{s.label}</div>
                                <div className="text-[10px] font-black text-slate-100 uppercase tracking-tighter">{s.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Cluster */}
                <div className="space-y-5">
                    <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-white tabular-nums italic tracking-tighter">{sprintProgress}%</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronization</span>
                        </div>
                        <div className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10 tabular-nums">
                            {activeSprint.earned_xp} / {activeSprint.minimum_target_xp} XP
                        </div>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner relative">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)] relative"
                            style={{ width: `${Math.min(100, sprintProgress)}%` }}
                        >
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Zone */}
            <div className="px-8 py-10">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Protocol Registries</h3>
                        <p className="text-[9px] text-slate-600 font-bold mt-1 uppercase tracking-widest">{sprintTasks.length} NODES IDENTIFIED</p>
                    </div>
                    <button
                        onClick={() => setAddTaskOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all active:scale-95 shadow-lg shadow-indigo-500/5"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {sprintTasks.length === 0 ? (
                        <div className="glass-card rounded-[2.5rem] p-16 border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-30">
                            <Plus size={40} className="text-slate-800 mb-4" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Registries Clear</h4>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sprintTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Completion Control */}
                {sprintProgress >= 100 && (
                    <div className="mt-16 glass-morphism p-8 rounded-[3rem] border border-green-500/20 shadow-[0_20px_60px_-20px_rgba(34,197,94,0.3)] relative overflow-hidden group animate-bounce-in">
                        <div className="relative z-10 flex flex-col items-center text-center gap-6">
                            <div className="w-16 h-16 bg-green-500/10 rounded-[1.5rem] flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-[0.2em]">Synchronization Locked</h4>
                                <p className="text-[10px] text-green-500/60 font-black uppercase tracking-[0.3em] mt-2">Protocol Ready for Archival</p>
                            </div>
                            <button
                                onClick={handleFinishSprint}
                                className="premium-btn w-full !rounded-[2rem] !py-6"
                                style={{ background: 'linear-gradient(135deg, #22c55e, #166534)' }}
                            >
                                FINALIZE SPRINT
                                <ChevronRight size={20} className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
