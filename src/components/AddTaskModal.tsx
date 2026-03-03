import { useState } from "react";
import { X, Zap } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useUIStore } from "../store/uiStore";
import { PRIORITY_CONFIG } from "../lib/constants";

export function AddTaskModal() {
    const { addTaskOpen, setAddTaskOpen, showNotification } = useUIStore();
    const { addTask, fetchTasks } = useTaskStore();
    const [form, setForm] = useState({
        title: "", description: "", priority: "medium" as const,
        xp_value: 10, estimated_minutes: 0, deadline: "", category: "general", is_backlog: false,
    });

    if (!addTaskOpen) return null;

    const xpByPriority = { low: 5, medium: 10, high: 20, critical: 35 };

    function handlePriorityChange(p: string) {
        setForm(f => ({ ...f, priority: p as any, xp_value: xpByPriority[p as keyof typeof xpByPriority] }));
    }

    async function handleSubmit() {
        if (!form.title.trim()) return;
        await addTask({ ...form, deadline: form.deadline || undefined });
        setAddTaskOpen(false);
        setForm({ title: "", description: "", priority: "medium", xp_value: 10, estimated_minutes: 0, deadline: "", category: "general", is_backlog: false });
        showNotification(`Task "${form.title}" added! +${form.xp_value}XP`, "success");
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddTaskOpen(false)} />
            <div className="relative w-full max-w-md bg-surface-2 rounded-xl border border-surface-3 shadow-2xl animate-slide-in p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-slate-100">New Task</h2>
                    <button onClick={() => setAddTaskOpen(false)} className="text-slate-500 hover:text-slate-300">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <input
                        autoFocus
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                        placeholder="Task title..."
                        className="w-full bg-surface-3 text-sm text-slate-200 placeholder-slate-600 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500/50 border border-transparent focus:border-blue-500/30"
                    />

                    <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Description (optional)..."
                        rows={2}
                        className="w-full bg-surface-3 text-sm text-slate-200 placeholder-slate-600 px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500/50 border border-transparent focus:border-blue-500/30 resize-none"
                    />

                    {/* Priority */}
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                            <button
                                key={key}
                                onClick={() => handlePriorityChange(key)}
                                className={`py-1.5 text-xs rounded-lg border transition-all font-medium ${form.priority === key
                                        ? "border-opacity-100 bg-opacity-20"
                                        : "border-surface-3 text-slate-500 hover:border-slate-600"
                                    }`}
                                style={form.priority === key ? {
                                    color: cfg.color, borderColor: cfg.color + "66", background: cfg.color + "22"
                                } : {}}
                            >
                                {cfg.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2">
                            <Zap size={14} className="text-yellow-400" />
                            <input
                                type="number"
                                value={form.xp_value}
                                onChange={e => setForm(f => ({ ...f, xp_value: parseInt(e.target.value) || 0 }))}
                                className="flex-1 bg-transparent text-sm text-slate-200 outline-none w-0"
                            />
                            <span className="text-xs text-slate-500">XP</span>
                        </div>
                        <input
                            type="datetime-local"
                            value={form.deadline}
                            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                            className="bg-surface-3 text-xs text-slate-400 px-3 py-2 rounded-lg outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="backlog"
                            checked={form.is_backlog}
                            onChange={e => setForm(f => ({ ...f, is_backlog: e.target.checked }))}
                            className="rounded"
                        />
                        <label htmlFor="backlog" className="text-xs text-slate-500 cursor-pointer">Add to backlog</label>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-2 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
}