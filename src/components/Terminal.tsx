import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, ChevronRight } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useUIStore } from "../store/uiStore";

export function Terminal() {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>(["System initialized. Ready for command input."]);
    const { addTask } = useTaskStore();
    const { setView } = useUIStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const addLog = (msg: string) => {
        setHistory(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleCommand = async () => {
        const cmd = input.trim().toLowerCase();
        if (!cmd) return;

        addLog(`> ${input}`);
        setInput("");

        const parts = cmd.split(" ");
        const action = parts[0];

        try {
            switch (action) {
                case "add":
                case "new":
                    const title = parts.slice(1).join(" ");
                    if (!title) {
                        addLog("Error: Objective title required. Usage: add [title]");
                        break;
                    }
                    await addTask({ title, priority: "medium" });
                    addLog(`Success: Objective "${title}" injected into registry.`);
                    break;

                case "goto":
                case "view":
                    const view = parts[1];
                    const validViews = ["dashboard", "sprint", "profile", "tasks", "analytics"];
                    if (validViews.includes(view)) {
                        setView(view as any);
                        addLog(`Switching to ${view} focus.`);
                    } else {
                        addLog(`Error: Invalid view "${view}". Valid: ${validViews.join(", ")}`);
                    }
                    break;

                case "clear":
                    setHistory(["System cleared. Ready."]);
                    break;

                case "help":
                    addLog("Available Commands:");
                    addLog(" - add [title]: Ingest new objective");
                    addLog(" - view [page]: Switch focus (dashboard, sprint, profile, tasks)");
                    addLog(" - clear: Purge command history");
                    addLog(" - status: Review system vitality");
                    break;

                case "status":
                    addLog("--- SYSTEM VITALITY REPORT ---");
                    addLog("Core: Active");
                    addLog("DB: Synchronized");
                    addLog("Uptime: Nominal");
                    break;

                default:
                    addLog(`Error: Unknown command "${action}". Type "help" for protocol list.`);
            }
        } catch (err) {
            addLog(`CRITICAL ERROR: Protocol failure during "${action}" execution.`);
        }
    };

    return (
        <div className="flex flex-col h-40 bg-black/40 border-t border-white/10 font-mono text-[11px] overflow-hidden group">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2 text-slate-500">
                    <TerminalIcon size={12} />
                    <span className="font-bold tracking-widest uppercase text-[9px]">GrindOS // CLI Console</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                </div>
            </div>

            {/* History Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar selection:bg-indigo-500/30"
            >
                {history.map((line, i) => (
                    <div key={i} className={line.startsWith(">") ? "text-indigo-400" : line.includes("Error") ? "text-red-400" : "text-slate-400"}>
                        {line}
                    </div>
                ))}
            </div>

            {/* Input Line */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/2 border-t border-white/5">
                <ChevronRight size={14} className="text-indigo-500 animate-pulse" />
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCommand()}
                    placeholder="ENTER COMMAND PROTOCOL..."
                    className="flex-1 !bg-transparent !border-none !p-0 !shadow-none font-mono text-indigo-300 placeholder-slate-700 outline-none uppercase tracking-widest"
                />
            </div>
        </div>
    );
}
