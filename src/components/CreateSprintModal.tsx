import { useState } from "react";
import { Trophy, Target, Rocket, ChevronRight, X, Clock, Zap } from "lucide-react";
import { useSprintStore } from "../store/sprintStore";
import { useUIStore } from "../store/uiStore";
import { useTaskStore } from "../store/taskStore";
import { format, addDays } from "date-fns";

export function CreateSprintModal() {
    const { addSprintOpen, setAddSprintOpen, showNotification } = useUIStore();
    const { createSprint } = useSprintStore();
    const { tasks } = useTaskStore();

    const [form, setForm] = useState({
        name: `PHASE_${format(new Date(), "MM_dd")}`,
        duration: 7,
        minTargetXP: 100,
    });

    if (!addSprintOpen) return null;

    const backlogTasks = tasks.filter(t => t.is_backlog);
    const totalBacklogXP = backlogTasks.reduce((sum, t) => sum + t.xp_value, 0);

    async function handleSubmit() {
        if (!form.name.trim()) {
            showNotification("SPRINT IDENTIFIER REQUIRED", "error");
            return;
        }

        try {
            const startDate = new Date().toISOString();
            const endDate = addDays(new Date(), form.duration).toISOString();

            console.log("Submitting sprint protocol...");
            await createSprint({
                name: form.name,
                start_date: startDate,
                end_date: endDate,
                minimum_target_xp: form.minTargetXP,
                maximum_possible_xp: Math.max(form.minTargetXP, totalBacklogXP),
                daysAvailable: form.duration,
                status: "active"
            });
            console.log("Sprint creation successful!");

            setAddSprintOpen(false);
            showNotification(`PROTOCOL "${form.name}" INITIALIZED`, "success");
        } catch (err) {
            console.error("CRITICAL SPRINT FAILURE:", err);
            showNotification("INITIALIZATION FAILURE", "error");
        }
    }

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in"
                onClick={() => setAddSprintOpen(false)}
            />

            <div className="relative w-full max-w-lg glass-morphism rounded-[3rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-slide-in">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-indigo-500 to-purple-500 animate-pulse" />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-orange-500/10 rounded-[1.5rem] border border-orange-500/20 shadow-[0_0_20px_rgba(233,84,32,0.15)]">
                                <Rocket className="text-orange-500" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Initialize Sprint</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Status: Preparing Focus Burst</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setAddSprintOpen(false)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-slate-500 hover:text-white border border-white/5 active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Name Input */}
                        <div>
                            <label>Protocol Identifier</label>
                            <div className="relative group/input">
                                <input
                                    autoFocus
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                                    className="w-full text-xl font-black uppercase tracking-widest placeholder-slate-800"
                                    placeholder="MISSION_CODNAME..."
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-indigo-500 transition-colors">
                                    <Target size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Configuration Grid */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all group">
                                <label>Protocol Duration</label>
                                <div className="flex items-end gap-2 my-2 relative z-10">
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 1 }))}
                                        className="!bg-transparent !border-none !p-0 text-4xl font-black text-white outline-none w-20 !shadow-none"
                                    />
                                    <span className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">Cycles</span>
                                </div>
                                <div className="flex gap-2.5 mt-4">
                                    {[3, 7, 14].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setForm(f => ({ ...f, duration: d }))}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${form.duration === d ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-slate-500 hover:text-slate-300"}`}
                                        >
                                            {d}D
                                        </button>
                                    ))}
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                    <Clock size={80} />
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all group">
                                <label>Target Yield</label>
                                <div className="flex items-end gap-2 my-2 relative z-10">
                                    <input
                                        type="number"
                                        value={form.minTargetXP}
                                        onChange={e => setForm(f => ({ ...f, minTargetXP: parseInt(e.target.value) || 0 }))}
                                        className="!bg-transparent !border-none !p-0 text-4xl font-black text-white outline-none w-28 !shadow-none"
                                    />
                                    <span className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest">XP</span>
                                </div>
                                <div className="flex gap-2.5 mt-4">
                                    {[100, 250, 500].map(x => (
                                        <button
                                            key={x}
                                            onClick={() => setForm(f => ({ ...f, minTargetXP: x }))}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${form.minTargetXP === x ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-slate-500 hover:text-slate-300"}`}
                                        >
                                            {x}
                                        </button>
                                    ))}
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                    <Zap size={80} />
                                </div>
                            </div>
                        </div>

                        {/* Risk Indicator */}
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-[1.5rem] flex items-center gap-5 translate-y-2">
                            <div className="bg-indigo-500/20 p-3 rounded-xl">
                                <Trophy size={20} className="text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
                                    High-intensity protocol active. Failure to reach target yield will impact <span className="text-indigo-400">Neutral Stability (LP)</span>.
                                </p>
                            </div>
                        </div>

                        {/* Launch Button */}
                        <button
                            onClick={handleSubmit}
                            className="premium-btn w-full !rounded-[2rem] !py-6 shadow-[0_20px_50px_-15px_rgba(233,84,32,0.3)] flex items-center justify-center gap-4 group mt-4 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #E95420, #772953)' }}
                        >
                            <span className="relative z-10">INITIALIZE PROTOCOL</span>
                            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform relative z-10" />
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 linear" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
