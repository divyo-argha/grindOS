import { Plus, Layout, User, TrendingUp, Zap } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function Navigation() {
    const { setView, setAddTaskOpen, currentView } = useUIStore();

    return (
        <div className="px-6 py-6 glass-morphism border-t border-white/5 flex items-center justify-between gap-4">
            <button
                onClick={() => setAddTaskOpen(true)}
                className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group shimmer-hover relative overflow-hidden"
            >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                ADD OBJECTIVE
            </button>

            <div className="flex gap-2">
                {[
                    { id: "dashboard", icon: Layout, color: "#818cf8", label: "Home" },
                    { id: "sprint", icon: Zap, color: "#818cf8", label: "Sprint" },
                    { id: "profile", icon: User, color: "#a78bfa", label: "Profile" },
                    { id: "analytics", icon: TrendingUp, color: "#f472b6", label: "Intel" }
                ].map(nav => {
                    const isActive = currentView === nav.id;
                    return (
                        <button
                            key={nav.id}
                            onClick={() => setView(nav.id as any)}
                            className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-90 relative ${isActive ? "text-indigo-400 glass-card border-white/10 active-nav-bg shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
                            title={nav.label}
                        >
                            <nav.icon size={18} className={isActive ? "animate-pulse" : ""} />
                            {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full blur-[1px]" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
