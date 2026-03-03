import { useState } from "react";
import { X, Zap, Calendar, ChevronRight, Layout, Info } from "lucide-react";
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
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in"
                onClick={() => setAddTaskOpen(false)}
            />
            <div className="relative w-full max-w-lg glass-morphism rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-slide-in overflow-hidden">
                {/* Accent Header */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 cyber-glow">
                                <Layout size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight uppercase">Ingest Objective</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol: Sequencer Update</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setAddTaskOpen(false)}
                            className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label>Mission Title</label>
                            <input
                                autoFocus
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                placeholder="IDENTIFY OBJECTIVE..."
                                className="w-full text-lg uppercase font-black tracking-tight"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label>Specifications</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="DETAILED PARAMETERS (OPTIONAL)..."
                                rows={2}
                                className="w-full text-sm font-medium tracking-wide no-scrollbar"
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label>Priority Tier</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => handlePriorityChange(key)}
                                        className={`py-3 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${form.priority === key
                                            ? "shadow-[0_0_20px_rgba(0,0,0,0.3)] scale-[1.02]"
                                            : "border-white/5 bg-white/2 text-slate-500 hover:border-white/10"
                                            }`}
                                        style={form.priority === key ? {
                                            color: cfg.color, borderColor: `${cfg.color}66`, backgroundColor: `${cfg.color}15`
                                        } : {}}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* XP & Deadline */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-[1.5rem] p-5 border border-white/5 relative overflow-hidden group">
                                <label>Net XP</label>
                                <div className="flex items-center gap-3 relative z-10">
                                    <Zap size={20} className="text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <input
                                        type="number"
                                        value={form.xp_value}
                                        onChange={e => setForm(f => ({ ...f, xp_value: parseInt(e.target.value) || 0 }))}
                                        className="!bg-transparent !border-none !p-0 font-black text-2xl !shadow-none"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <Zap size={60} />
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-[1.5rem] p-5 border border-white/5 relative overflow-hidden group">
                                <label>Target Date</label>
                                <div className="flex items-center gap-3 relative z-10">
                                    <Calendar size={20} className="text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <input
                                        type="datetime-local"
                                        value={form.deadline}
                                        onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                                        className="!bg-transparent !border-none !p-0 text-[10px] font-black !shadow-none tracking-tighter"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <Calendar size={60} />
                                </div>
                            </div>
                        </div>

                        {/* Backlog Toggle */}
                        <div className="flex items-center justify-between bg-white/3 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-500/10 rounded-lg">
                                    <Info size={14} className="text-slate-500" />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">De-prioritize to Backlog</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={form.is_backlog}
                                    onChange={e => setForm(f => ({ ...f, is_backlog: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-500 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 after:shadow-md"></div>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            className="premium-btn w-full !rounded-3xl shadow-[0_20px_40px_-15px_rgba(99,102,241,0.5)] flex items-center justify-center gap-3 group"
                        >
                            LOCK IN MISSION
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}