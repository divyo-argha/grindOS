import { Plus, Layout, User, TrendingUp, Zap } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function Navigation() {
    const { setView, setAddTaskOpen, currentView } = useUIStore();

    const navItems = [
        { id: "dashboard", icon: Layout, label: "Neural Net", color: "text-indigo-400" },
        { id: "sprint", icon: Zap, label: "Focus Burst", color: "text-orange-400" },
        { id: "profile", icon: User, label: "Identity", color: "text-purple-400" },
        { id: "analytics", icon: TrendingUp, label: "Intel", color: "text-pink-400" }
    ];

    return (
        <div className="px-6 py-6 glass-morphism border-t border-white/10 flex items-center justify-between gap-5 relative">
            <button
                onClick={() => setAddTaskOpen(true)}
                className="flex-1 flex items-center justify-center gap-3 premium-btn !rounded-2xl !py-4 shadow-lg group relative overflow-hidden active:scale-95"
            >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Injest Objective</span>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
            </button>

            <div className="flex gap-2.5">
                {navItems.map(nav => {
                    const isActive = currentView === nav.id;
                    return (
                        <button
                            key={nav.id}
                            onClick={() => setView(nav.id as any)}
                            className={`p-4 rounded-[1.25rem] transition-all duration-300 relative group active:scale-90 ${isActive
                                ? "bg-white/5 border border-white/10 shadow-lg shadow-black/20"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"}`}
                            title={nav.label}
                        >
                            <nav.icon
                                size={18}
                                className={`transition-all duration-500 ${isActive ? `${nav.color} animate-pulse scale-110` : "group-hover:scale-110"}`}
                            />
                            {isActive && (
                                <>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full blur-[2px] animate-pulse" style={{ backgroundColor: 'currentColor' }} />
                                    <div className="absolute inset-0 bg-white/[0.02] rounded-[1.25rem] animate-fade-in" />
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
