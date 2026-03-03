import { useState } from "react";
import { Check, Trash2, ChevronDown, Zap, Target } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useUserStore } from "../store/userStore";
import { onTaskCompleted } from "../engines/gamificationEngine";
import { PRIORITY_CONFIG } from "../lib/constants";

interface Props {
    task: any;
    compact?: boolean;
}

export function TaskCard({ task, compact = false }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");
    const { completeTask, deleteTask, fetchSubtasks, subtasks, addSubtask, completeSubtask, deleteSubtask, fetchTasks } = useTaskStore();
    const { user, fetchUser } = useUserStore();

    const pCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
    const taskSubs = subtasks[task.id] || [];
    const completedSubs = taskSubs.filter(s => s.status === "completed").length;
    const isCompleted = task.status === "completed";

    async function handleComplete() {
        if (isCompleted) return;
        try {
            await completeTask(task.id);
            if (user) {
                await onTaskCompleted(user, task, 0);
                await fetchUser();
            }
            await fetchTasks({ isBacklog: false });
        } catch (err) {
            console.error(err);
        }
    }

    async function handleExpand() {
        if (!expanded) await fetchSubtasks(task.id);
        setExpanded(!expanded);
    }

    async function handleAddSubtask(e: React.KeyboardEvent) {
        if (e.key === "Enter" && newSubtask.trim()) {
            await addSubtask(task.id, newSubtask.trim());
            setNewSubtask("");
        }
    }

    return (
        <div className={`group glass-card rounded-[1.75rem] transition-all duration-500 ${isCompleted
            ? "opacity-40 grayscale-[0.8]"
            : "hover:border-white/20 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            } border border-white/10 overflow-hidden relative`}>

            {/* Priority Edge Indicator */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 shadow-[4px_0_10px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: pCfg.color }}
            />

            <div className="flex items-center gap-5 p-5">
                {/* Checkbox */}
                <button
                    onClick={handleComplete}
                    disabled={isCompleted}
                    className={`relative flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${isCompleted
                        ? "bg-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                        : "border-white/10 hover:border-indigo-500/50 hover:bg-white/5"
                        }`}
                >
                    {isCompleted ? (
                        <Check size={16} className="text-white stroke-[4]" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-indigo-500/50 group-hover:scale-150 transition-all" />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1" onClick={handleExpand}>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border`} style={{ color: pCfg.color, borderColor: `${pCfg.color}33`, backgroundColor: `${pCfg.color}11` }}>
                            {pCfg.label}
                        </span>
                        {taskSubs.length > 0 && (
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                                {completedSubs}/{taskSubs.length} SECONDS
                            </span>
                        )}
                    </div>
                    <h4 className={`text-sm font-black tracking-tight uppercase ${isCompleted ? "line-through text-slate-600" : "text-slate-100"}`}>
                        {task.title}
                    </h4>
                </div>

                {/* Reward Badge */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-yellow-500/5 px-2.5 py-1 rounded-xl border border-yellow-500/10">
                        <Zap size={10} className="text-yellow-500 animate-pulse" />
                        <span className="text-[10px] font-black text-yellow-500">+{task.xp_value}</span>
                    </div>
                </div>

                {/* Actions */}
                {!compact && (
                    <div className="flex items-center gap-2 pl-2 border-l border-white/5 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-500 transition-all">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                <button
                    onClick={handleExpand}
                    className={`p-2 rounded-xl text-slate-600 hover:text-white transition-all ${expanded ? "text-indigo-400 rotate-180" : ""}`}
                >
                    <ChevronDown size={14} />
                </button>
            </div>

            {/* Subtasks Section */}
            {expanded && (
                <div className="px-6 pb-6 pt-2 animate-fade-in bg-white/[0.02]">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full mb-5" />

                    <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar pr-2 mb-5">
                        {taskSubs.length > 0 ? (
                            taskSubs.map(sub => (
                                <div key={sub.id} className="flex items-center gap-4 py-2 group/sub animate-slide-in">
                                    <button
                                        onClick={() => sub.status !== "completed" && completeSubtask(sub.id, task.id)}
                                        className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${sub.status === "completed"
                                            ? "bg-indigo-500/10 border-indigo-500/40"
                                            : "border-white/10 hover:border-indigo-500/30"
                                            }`}
                                    >
                                        {sub.status === "completed" && <Check size={12} className="text-indigo-400 stroke-[3]" />}
                                    </button>
                                    <span className={`text-[11px] font-bold tracking-tight uppercase flex-1 ${sub.status === "completed" ? "line-through text-slate-600" : "text-slate-300"}`}>
                                        {sub.title}
                                    </span>
                                    <button onClick={() => deleteSubtask(sub.id, task.id)} className="opacity-0 group-hover/sub:opacity-100 p-1.5 hover:text-red-500 text-slate-700 transition-all">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center opacity-20">
                                <span className="text-[9px] font-black uppercase tracking-widest italic">No sub-objectives defined</span>
                            </div>
                        )}
                    </div>

                    {/* Add Subtask Input */}
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 focus-within:border-indigo-500/40 focus-within:bg-indigo-500/5 transition-all group/input">
                        <Target size={16} className="text-slate-500 group-focus-within/input:text-indigo-500 transition-colors" />
                        <input
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={handleAddSubtask}
                            placeholder="DEFINE SUB-OBJECTIVE..."
                            className="flex-1 bg-transparent text-[10px] font-black text-indigo-200 placeholder-slate-700 outline-none uppercase tracking-widest"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}