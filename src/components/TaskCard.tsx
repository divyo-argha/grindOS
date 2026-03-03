import { useState } from "react";
import { Check, Trash2, ChevronDown, Plus, Zap } from "lucide-react";
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
                // In a real app we'd get the actual updated count, but 0 is passed to gamification if unknown
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
        <div className={`group glass-card rounded-2xl transition-all duration-300 ${isCompleted
            ? "opacity-40 grayscale-[0.5]"
            : "hover:border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5"
            } border border-white/10 overflow-hidden`}>

            <div className="flex items-center gap-4 p-4">
                {/* Complete checkbox - Premium Style */}
                <button
                    onClick={handleComplete}
                    disabled={isCompleted}
                    className={`relative flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted
                        ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        : "border-white/10 hover:border-green-500/50 hover:bg-green-500/5"
                        }`}
                >
                    {isCompleted ? (
                        <Check size={14} className="text-white stroke-[3]" />
                    ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-green-500/40 transition-colors" />
                    )}
                </button>

                {/* Title & Desc */}
                <div className="flex-1 min-w-0" onClick={handleExpand}>
                    <h4 className={`text-sm font-bold tracking-tight ${isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
                        {task.title}
                    </h4>
                    {!compact && task.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-1 font-medium">{task.description}</p>
                    )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        <Zap size={12} style={{ color: pCfg.color }} className="fill-current opacity-40" />
                        <span className="text-[10px] font-black" style={{ color: pCfg.color }}>+{task.xp_value}</span>
                    </div>

                    <div
                        className="w-1.5 h-3 rounded-full opacity-60"
                        style={{ backgroundColor: pCfg.color }}
                        title={`Priority: ${pCfg.label}`}
                    />
                </div>

                {/* Actions */}
                {!compact && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={handleExpand} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                            <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? "rotate-180 text-indigo-400" : ""}`} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Section: Subtasks & Progress */}
            {expanded && (
                <div className="px-5 pb-5 pt-0 animate-fade-in">
                    <div className="h-px bg-white/5 w-full mb-4" />

                    {taskSubs.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {taskSubs.map(sub => (
                                <div key={sub.id} className="flex items-center gap-3 py-1 group/sub">
                                    <button
                                        onClick={() => sub.status !== "completed" && completeSubtask(sub.id, task.id)}
                                        className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${sub.status === "completed"
                                            ? "bg-indigo-500/20 border-indigo-500"
                                            : "border-white/10 hover:border-indigo-400"
                                            }`}
                                    >
                                        {sub.status === "completed" && <Check size={10} className="text-indigo-400 stroke-[3]" />}
                                    </button>
                                    <span className={`text-[11px] font-medium flex-1 ${sub.status === "completed" ? "line-through text-slate-500" : "text-slate-300"}`}>
                                        {sub.title}
                                    </span>
                                    <button onClick={() => deleteSubtask(sub.id, task.id)} className="opacity-0 group-hover/sub:opacity-100 p-1 hover:text-red-400 text-slate-600 transition-all">
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}

                            {/* Subtle Progress Bar for Subtasks */}
                            <div className="pt-2">
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500/50 transition-all duration-700"
                                        style={{ width: `${taskSubs.length > 0 ? (completedSubs / taskSubs.length) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/5 focus-within:border-indigo-500/50 transition-all">
                        <Plus size={14} className="text-slate-500" />
                        <input
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={handleAddSubtask}
                            placeholder="Add sub-objective..."
                            className="flex-1 bg-transparent text-[11px] font-medium text-slate-300 placeholder-slate-600 outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}