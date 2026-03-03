import { useState } from "react";
import { Trophy, Target, Rocket, ChevronRight, X } from "lucide-react";
import { useSprintStore } from "../store/sprintStore";
import { useUIStore } from "../store/uiStore";
import { useTaskStore } from "../store/taskStore";
import { format, addDays } from "date-fns";

export function CreateSprintModal() {
    const { addSprintOpen, setAddSprintOpen, showNotification } = useUIStore();
    const { createSprint } = useSprintStore();
    const { tasks } = useTaskStore();

    const [form, setForm] = useState({
        name: `Sprint ${format(new Date(), "MMM dd")}`,
        duration: 7,
        minTargetXP: 100,
    });

    if (!addSprintOpen) return null;

    const backlogTasks = tasks.filter(t => t.is_backlog);
    const totalBacklogXP = backlogTasks.reduce((sum, t) => sum + t.xp_value, 0);

    async function handleSubmit() {
        if (!form.name.trim()) {
            showNotification("Please enter a sprint name", "error");
            return;
        }

        try {
            const startDate = new Date().toISOString();
            const endDate = addDays(new Date(), form.duration).toISOString();

            await createSprint({
                name: form.name,
                start_date: startDate,
                end_date: endDate,
                minimum_target_xp: form.minTargetXP,
                maximum_possible_xp: Math.max(form.minTargetXP, totalBacklogXP),
                daysAvailable: form.duration, // explicitly pass duration as daysAvailable
                status: "active"
            });

            setAddSprintOpen(false);
            showNotification(`Sprint "${form.name}" initialized!`, "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to start sprint. Check console.", "error");
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
                onClick={() => setAddSprintOpen(false)}
            />

            <div className="relative w-full max-w-lg glass-morphism rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-slide-in">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <Rocket className="text-indigo-400" />
                                <span className="text-gradient">Start New Sprint</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Phase 2: Execution</p>
                        </div>
                        <button
                            onClick={() => setAddSprintOpen(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Name Input */}
                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-tighter text-slate-500 ml-1 mb-2 block group-focus-within:text-indigo-400 transition-colors">Sprint Identifier</label>
                            <div className="relative">
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium"
                                    placeholder="e.g. Operation Deep Work"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                                    <Target size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Config Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                <label className="text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-3 block">Duration</label>
                                <div className="flex items-end gap-3">
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 1 }))}
                                        className="bg-transparent text-3xl font-black text-white outline-none w-16"
                                    />
                                    <span className="text-xs font-bold text-slate-500 mb-1.5 uppercase">Days</span>
                                </div>
                                <div className="mt-4 flex gap-1">
                                    {[3, 7, 14].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setForm(f => ({ ...f, duration: d }))}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${form.duration === d ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-slate-500 hover:bg-white/10"}`}
                                        >
                                            {d}d
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                                <label className="text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-3 block">Target XP</label>
                                <div className="flex items-end gap-3">
                                    <input
                                        type="number"
                                        value={form.minTargetXP}
                                        onChange={e => setForm(f => ({ ...f, minTargetXP: parseInt(e.target.value) || 0 }))}
                                        className="bg-transparent text-3xl font-black text-white outline-none w-24"
                                    />
                                    <span className="text-xs font-bold text-slate-500 mb-1.5 uppercase">XP</span>
                                </div>
                                <div className="mt-4 flex gap-1">
                                    {[100, 250, 500].map(x => (
                                        <button
                                            key={x}
                                            onClick={() => setForm(f => ({ ...f, minTargetXP: x }))}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${form.minTargetXP === x ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "bg-white/5 text-slate-500 hover:bg-white/10"}`}
                                        >
                                            {x}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-4">
                            <div className="mt-1 bg-indigo-500/20 p-2 rounded-lg">
                                <Trophy size={16} className="text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-indigo-200/80 leading-relaxed font-medium">
                                    Sprints are high-stakes. Hit your target to boost your <span className="text-indigo-300 font-black">LP (Rating)</span>. Fail, and you might lose points.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 py-5 text-sm font-black text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                INITIALIZE PROTOCOL
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-white/20 to-indigo-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
