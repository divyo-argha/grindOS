import { useState } from "react";
import { X, Zap, Calendar, ChevronRight, Layout } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useUIStore } from "../store/uiStore";
import { PRIORITY_CONFIG } from "../lib/constants";

export function AddTaskModal() {
    const { addTaskOpen, setAddTaskOpen, showNotification } = useUIStore();
    const { addTask } = useTaskStore();
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
        showNotification(`Objective "${form.title}" locked in.`, "success");
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                onClick={() => setAddTaskOpen(false)}
            />
            <div className="relative w-full max-w-lg glass-morphism rounded-[2.5rem] border border-white/10 shadow-2xl animate-slide-in overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Layout className="text-blue-400 opacity-60" />
                                <span className="tracking-tighter">New Objective</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 ml-1">Add to current sequence</p>
                        </div>
                        <button
                            onClick={() => setAddTaskOpen(false)}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 mb-2 block group-focus-within:text-blue-400 transition-colors">Objective Title</label>
                            <input
                                autoFocus
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                placeholder="Describe your mission..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 mb-2 block">Specifications</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Additional details (optional)..."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium resize-none text-sm"
                            />
                        </div>

                        {/* Priority Selection */}
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePriorityChange(key)}
                                    className={`py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tighter ${form.priority === key
                                        ? "border-opacity-100 shadow-lg"
                                        : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                        }`}
                                    style={form.priority === key ? {
                                        color: cfg.color, borderColor: `${cfg.color}44`, backgroundColor: `${cfg.color}15`
                                    } : {}}
                                >
                                    {cfg.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card rounded-2xl p-4 border border-white/5">
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">XP Reward</label>
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-yellow-400 opacity-60" />
                                    <input
                                        type="number"
                                        value={form.xp_value}
                                        onChange={e => setForm(f => ({ ...f, xp_value: parseInt(e.target.value) || 0 }))}
                                        className="bg-transparent text-xl font-black text-white outline-none w-full"
                                    />
                                </div>
                            </div>
                            <div className="glass-card rounded-2xl p-4 border border-white/5">
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Deadline</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-400 opacity-60" />
                                    <input
                                        type="datetime-local"
                                        value={form.deadline}
                                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                                        className="bg-transparent text-[10px] font-bold text-slate-300 outline-none w-full uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 py-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.is_backlog}
                                    onChange={e => setForm(f => ({ ...f, is_backlog: e.target.checked }))}
                                />
                                <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                            </label>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Add to Backlog</span>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="group relative w-full overflow-hidden rounded-2xl bg-white py-5 text-sm font-black text-slate-950 shadow-xl shadow-white/5 transition-all hover:bg-slate-100 hover:shadow-white/10 active:scale-[0.98]"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                CONFIRM OBJECTIVE
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}