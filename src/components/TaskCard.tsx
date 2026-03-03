import { useState } from "react";
import { Check, Trash2, ChevronDown, Plus, Clock, Zap } from "lucide-react";
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
    const { completeTask, deleteTask, fetchSubtasks, subtasks, addSubtask, completeSubtask, deleteSubtask } = useTaskStore();
    const { user, fetchUser } = useUserStore();

    const pCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
    const taskSubs = subtasks[task.id] || [];
    const completedSubs = taskSubs.filter(s => s.status === "completed").length;
    const isCompleted = task.status === "completed";

    async function handleComplete() {
        if (isCompleted) return;
        await completeTask(task.id);
        if (user) {
            const totalTasks = await fetch; // simplified
            await onTaskCompleted(user, task, 0);
            await fetchUser();
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
        <div className={`group rounded-lg border transition-all duration-200 ${isCompleted
                ? "border-surface-3 bg-surface-1 opacity-60"
                : "border-surface-3 bg-surface-2 hover:border-slate-600"
            }`}>
            <div className="flex items-center gap-3 p-3">
                {/* Complete button */}
                <button
                    onClick={handleComplete}
                    disabled={isCompleted}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isCompleted
                            ? "bg-green-500/20 border-green-500"
                            : "border-slate-600 hover:border-green-400"
                        }`}
                >
                    {isCompleted && <Check size={12} className="text-green-400" />}
                </button>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {task.title}
                    </span>
                    {!compact && task.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>
                    )}
                </div>

                {/* XP */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Zap size={11} style={{ color: pCfg.color }} />
                    <span className="text-xs font-mono" style={{ color: pCfg.color }}>+{task.xp_value}</span>
                </div>

                {/* Priority */}
                <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: pCfg.color }}
                    title={pCfg.label}
                />

                {/* Actions */}
                {!compact && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleExpand} className="p-1 hover:text-white text-slate-500 transition-colors">
                            <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 hover:text-red-400 text-slate-500 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Subtasks */}
            {expanded && (
                <div className="px-3 pb-3 border-t border-surface-3 mt-0 pt-2">
                    {taskSubs.length > 0 && (
                        <div className="mb-2">
                            {taskSubs.map(sub => (
                                <div key={sub.id} className="flex items-center gap-2 py-1">
                                    <button
                                        onClick={() => sub.status !== "completed" && completeSubtask(sub.id, task.id)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${sub.status === "completed" ? "bg-green-500/20 border-green-500" : "border-slate-600 hover:border-green-400"
                                            }`}
                                    >
                                        {sub.status === "completed" && <Check size={10} className="text-green-400" />}
                                    </button>
                                    <span className={`text-xs flex-1 ${sub.status === "completed" ? "line-through text-slate-500" : "text-slate-300"}`}>
                                        {sub.title}
                                    </span>
                                    <button onClick={() => deleteSubtask(sub.id, task.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-600 transition-all">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            <div className="mt-1 h-0.5 bg-surface-3 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all"
                                    style={{ width: `${taskSubs.length > 0 ? (completedSubs / taskSubs.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <Plus size={12} className="text-slate-500" />
                        <input
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={handleAddSubtask}
                            placeholder="Add subtask... (Enter)"
                            className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}