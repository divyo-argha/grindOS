import { useEffect, useState, useRef } from "react";
import { useUIStore } from "../store/uiStore";
import { useTaskStore } from "../store/taskStore";
import { useSprintStore } from "../store/sprintStore";
import { Command, Search } from "lucide-react";

interface Cmd {
    id: string;
    label: string;
    description?: string;
    icon?: string;
    action: () => void;
    keywords: string[];
}

export function CommandPalette() {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { commandOpen, setCommandOpen, setAddTaskOpen, setAddSprintOpen, setView, showNotification } = useUIStore();
    const { fetchTasks } = useTaskStore();
    const { fetchActiveSprint } = useSprintStore();

    const commands: Cmd[] = [
        {
            id: "add-task", label: "Add Task", description: "Create a new task", icon: "✏️",
            keywords: ["add", "create", "new", "task"],
            action: () => { setAddTaskOpen(true); setCommandOpen(false); },
        },
        {
            id: "add-sprint", label: "Start Sprint", description: "Begin a new sprint", icon: "🏃",
            keywords: ["sprint", "start", "begin", "new sprint"],
            action: () => { setAddSprintOpen(true); setCommandOpen(false); },
        },
        {
            id: "dashboard", label: "Dashboard", description: "Go to dashboard", icon: "🏠",
            keywords: ["home", "dashboard", "main"],
            action: () => { setView("dashboard"); setCommandOpen(false); },
        },
        {
            id: "tasks", label: "All Tasks", description: "View all tasks", icon: "📋",
            keywords: ["tasks", "list", "all"],
            action: () => { setView("tasks"); setCommandOpen(false); },
        },
        {
            id: "sprint", label: "Sprint View", description: "View current sprint", icon: "⚡",
            keywords: ["sprint", "current"],
            action: () => { setView("sprint"); setCommandOpen(false); },
        },
        {
            id: "backlog", label: "Backlog", description: "Manage backlog", icon: "📦",
            keywords: ["backlog", "future", "ideas"],
            action: () => { setView("backlog"); setCommandOpen(false); },
        },
        {
            id: "profile", label: "Profile & Rating", description: "View your rating", icon: "🏆",
            keywords: ["profile", "rating", "rank", "stats"],
            action: () => { setView("profile"); setCommandOpen(false); },
        },
        {
            id: "analytics", label: "Analytics", description: "View charts & history", icon: "📊",
            keywords: ["analytics", "charts", "history", "stats"],
            action: () => { setView("analytics"); setCommandOpen(false); },
        },
        {
            id: "settings", label: "Settings", description: "App settings", icon: "⚙️",
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommandOpen(false)} />
            <div className="relative w-full max-w-lg bg-surface-2 rounded-xl border border-surface-3 shadow-2xl overflow-hidden animate-slide-in">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-3">
                    <Search size={16} className="text-slate-500" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelected(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command..."
                        className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none font-mono"
                    />
                    <kbd className="text-xs text-slate-600 bg-surface-3 px-1.5 py-0.5 rounded">ESC</kbd>
                </div>
                {/* Commands */}
                <div className="py-2 max-h-80 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-600">No commands found</div>
                    ) : (
                        filtered.map((cmd, i) => (
                            <button
                                key={cmd.id}
                                onClick={cmd.action}
                                onMouseEnter={() => setSelected(i)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${selected === i ? "bg-surface-3" : "hover:bg-surface-3/50"
                                    }`}
                            >
                                <span className="text-lg w-6 text-center flex-shrink-0">{cmd.icon}</span>
                                <div>
                                    <div className="text-sm text-slate-200 font-medium">{cmd.label}</div>
                                    {cmd.description && <div className="text-xs text-slate-500">{cmd.description}</div>}
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="px-4 py-2 border-t border-surface-3 flex items-center gap-4 text-xs text-slate-600">
                    <span><kbd className="bg-surface-3 px-1 rounded">↑↓</kbd> navigate</span>
                    <span><kbd className="bg-surface-3 px-1 rounded">Enter</kbd> select</span>
                    <span><kbd className="bg-surface-3 px-1 rounded">Ctrl+Space</kbd> toggle</span>
                </div>
            </div>
        </div>
    );
}