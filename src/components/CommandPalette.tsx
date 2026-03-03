import { useEffect, useState, useRef } from "react";
import { useUIStore } from "../store/uiStore";
import { Search, Plus, Zap, Layout, Trophy, User, BarChart3, Settings, Package, History } from "lucide-react";

interface Cmd {
    id: string;
    label: string;
    description?: string;
    icon: any;
    action: () => void;
    keywords: string[];
}

export function CommandPalette() {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { commandOpen, setCommandOpen, setAddTaskOpen, setAddSprintOpen, setView } = useUIStore();

    const commands: Cmd[] = [
        {
            id: "add-task", label: "Protocol: New Objective", description: "Inject a new task into the sequence", icon: Plus,
            keywords: ["add", "create", "new", "task"],
            action: () => { setAddTaskOpen(true); setCommandOpen(false); },
        },
        {
            id: "add-sprint", label: "Protocol: Initialize Sprint", description: "Begin a deep-work synchronization", icon: Zap,
            keywords: ["sprint", "start", "begin", "new sprint"],
            action: () => { setAddSprintOpen(true); setCommandOpen(false); },
        },
        {
            id: "dashboard", label: "View: Dashboard", description: "Return to central command", icon: Layout,
            keywords: ["home", "dashboard", "main"],
            action: () => { setView("dashboard"); setCommandOpen(false); },
        },
        {
            id: "tasks", label: "View: All Objectives", description: "Access the complete task registry", icon: Trophy,
            keywords: ["tasks", "list", "all"],
            action: () => { setView("tasks"); setCommandOpen(false); },
        },
        {
            id: "sprint", label: "View: Active Sprint", description: "Monitor current protocol status", icon: History,
            keywords: ["sprint", "current"],
            action: () => { setView("sprint"); setCommandOpen(false); },
        },
        {
            id: "backlog", label: "View: Backlog", description: "Review secondary priorities", icon: Package,
            keywords: ["backlog", "future", "ideas"],
            action: () => { setView("backlog"); setCommandOpen(false); },
        },
        {
            id: "profile", label: "View: Elite Profile", description: "Check standings and performance", icon: User,
            keywords: ["profile", "rating", "rank", "stats"],
            action: () => { setView("profile"); setCommandOpen(false); },
        },
        {
            id: "analytics", label: "View: Intelligence", description: "Analyze performance trajectory", icon: BarChart3,
            keywords: ["analytics", "charts", "history", "stats"],
            action: () => { setView("analytics"); setCommandOpen(false); },
        },
        {
            id: "settings", label: "System: Settings", description: "Configure application parameters", icon: Settings,
            keywords: ["settings", "preferences"],
            action: () => { setView("settings"); setCommandOpen(false); },
        },
    ];

    const filtered = query.trim()
        ? commands.filter(c =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.keywords.some(k => k.includes(query.toLowerCase()))
        )
        : commands;

    useEffect(() => {
        if (commandOpen) {
            setQuery("");
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [commandOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === " ") {
                e.preventDefault();
                setCommandOpen(!commandOpen);
            }
            if (e.key === "Escape") setCommandOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [commandOpen]);

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
        if (e.key === "Enter" && filtered[selected]) { filtered[selected].action(); }
        if (e.key === "Escape") setCommandOpen(false);
    }

    if (!commandOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setCommandOpen(false)} />

            <div className="relative w-full max-w-xl glass-morphism rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-in">
                {/* Input Header */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 bg-white/5">
                    <Search size={20} className="text-indigo-400 opacity-60" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelected(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Execute a command..."
                        className="flex-1 bg-transparent text-lg text-white placeholder-slate-600 outline-none font-black italic tracking-tight"
                    />
                    <div className="flex items-center gap-1.5 opacity-40">
                        <kbd className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">ESC</kbd>
                    </div>
                </div>

                {/* Commands List */}
                <div className="py-4 max-h-[28rem] overflow-y-auto no-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Search size={40} className="mx-auto text-slate-700 mb-4 opacity-20" />
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No matching protocols</p>
                        </div>
                    ) : (
                        <div className="px-3 space-y-1">
                            {filtered.map((cmd, i) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    onMouseEnter={() => setSelected(i)}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-2xl transition-all ${selected === i
                                        ? "bg-white/10 border border-white/10 scale-[1.01] shadow-xl"
                                        : "hover:bg-white/5 border border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${selected === i ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-slate-400"}`}>
                                        <cmd.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-white uppercase tracking-tight">{cmd.label}</div>
                                        {cmd.description && <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{cmd.description}</div>}
                                    </div>
                                    {selected === i && (
                                        <div className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">READY</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Hints */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/2">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2"><kbd className="bg-white/10 px-1.5 rounded text-white border border-white/10">↑↓</kbd> SELECT</span>
                        <span className="flex items-center gap-2"><kbd className="bg-white/10 px-1.5 rounded text-white border border-white/10">ENTER</kbd> EXECUTE</span>
                    </div>
                    <div className="text-indigo-400/40">grindOS // SYSTEM CONTROL</div>
                </div>
            </div>
        </div>
    );
}