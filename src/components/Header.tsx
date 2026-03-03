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

    useEffect(() => {
        const win = getCurrentWindow();
        win.setAlwaysOnTop(isAlwaysOnTop).catch(console.error);
        win.setShadow(!isPinned).catch(console.error);
    }, [isAlwaysOnTop, isPinned]);

    const today = new Date().toISOString().split("T")[0];
    const completedToday = tasks.filter(t => t.completed_at?.startsWith(today));
    const todayXP = completedToday.reduce((sum, t) => sum + t.xp_value, 0);

    return (
        <div className="px-6 py-4 flex items-center justify-between glass-morphism border-b border-white/5 shadow-lg relative z-[110]">
            <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => setView("profile")}>
                    {user && <RatingBadge rating={user.rating} size="sm" />}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur" />
                    {/* DB Status Pulse */}
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0c0c14] shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" title="Database Connected" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2 rounded-xl transition-all ${isPinned ? "text-orange-400 bg-orange-400/10 border border-orange-400/20" : "text-slate-500 bg-white/5 hover:text-slate-300 border border-transparent"}`}
                    title={isPinned ? "Pinned (No Shadow)" : "Floating (With Shadow)"}
                >
                    {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                </button>

                <button
                    onClick={() => setIsAlwaysOnTop(!isAlwaysOnTop)}
                    className={`p-2 rounded-xl transition-all ${isAlwaysOnTop ? "text-indigo-400 bg-indigo-400/10 border border-indigo-400/20" : "text-slate-500 bg-white/5 hover:text-slate-300 border border-transparent"}`}
                    title={isAlwaysOnTop ? "Always on Top: ON" : "Always on Top: OFF"}
                >
                    {isAlwaysOnTop ? <Shield size={18} /> : <ShieldOff size={18} />}
                </button>

                <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
                    <Zap size={14} className="text-yellow-400 fill-yellow-400/20" />
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{todayXP} XP</span>
                </div>

                <button
                    onClick={() => setCommandOpen(true)}
                    className="p-2 glass-card rounded-xl text-slate-400 hover:text-white transition-all hover:scale-105"
                    title="Command Palette (Ctrl+Space)"
                >
                    <Command size={18} />
                </button>
            </div>
        </div>
    );
}
