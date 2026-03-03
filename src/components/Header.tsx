import { Zap, Command, Shield, ShieldOff, Pin, PinOff } from "lucide-react";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { RatingBadge } from "./RatingBadge";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";
import { useTaskStore } from "../store/taskStore";

export function Header() {
    const { user } = useUserStore();
    const { setView, setCommandOpen } = useUIStore();
    const { tasks } = useTaskStore();

    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(true);
    const [isPinned, setIsPinned] = useState(false);

    // Using window APIs effectively
    useEffect(() => {
        const win = getCurrentWindow();
        const updateWindowState = async () => {
            try {
                // Ensure always on top works
                await win.setAlwaysOnTop(isAlwaysOnTop);
                // Shadow toggle for pinning effect
                await win.setShadow(!isPinned);
                console.log(`[Window] AlwaysOnTop: ${isAlwaysOnTop}, Surface Pin: ${isPinned}`);
            } catch (err) {
                console.error("[Window] Failed to update state:", err);
            }
        };
        updateWindowState();
    }, [isAlwaysOnTop, isPinned]);

    const today = new Date().toISOString().split("T")[0];
    const completedToday = tasks.filter(t => t.completed_at?.startsWith(today));
    const todayXP = completedToday.reduce((sum, t) => sum + t.xp_value, 0);

    return (
        <div className="px-6 py-5 flex items-center justify-between glass-morphism border-b border-white/10 shadow-xl relative z-[160]">
            <div className="flex items-center gap-4">
                <div
                    className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    onClick={() => setView("profile")}
                >
                    {user && <RatingBadge rating={user.rating} size="sm" />}
                    <div className="absolute -inset-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-10 transition-all blur-md" />
                    <div
                        className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#050508] shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"
                        title="Neural Sync Active"
                    />
                </div>
                <div>
                    <h1 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">GrindOS Core</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-tighter opacity-80 italic">Status: Link Active</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center px-2 py-1 bg-white/5 rounded-xl border border-white/5 gap-1">
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className={`p-1.5 rounded-lg transition-all ${isPinned ? "text-orange-400 bg-orange-400/10 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
                        title={isPinned ? "Ghost Mode (No Shadow)" : "Depth Mode (With Shadow)"}
                    >
                        {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>

                    <button
                        onClick={() => setIsAlwaysOnTop(!isAlwaysOnTop)}
                        className={`p-1.5 rounded-lg transition-all ${isAlwaysOnTop ? "text-indigo-400 bg-indigo-400/10 shadow-inner" : "text-slate-500 hover:text-slate-300"}`}
                        title={isAlwaysOnTop ? "Always on Top: Active" : "Always on Top: Standby"}
                    >
                        {isAlwaysOnTop ? <Shield size={14} /> : <ShieldOff size={14} />}
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-xl border border-yellow-400/20 cyber-glow">
                    <Zap size={14} className="text-yellow-400 fill-yellow-400/20" />
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none">{todayXP} XP</span>
                </div>

                <button
                    onClick={() => setCommandOpen(true)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/10"
                >
                    <Command size={16} />
                </button>
            </div>
        </div>
    );
}
