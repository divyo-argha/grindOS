import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, ChevronRight } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useSprintStore } from "../store/sprintStore";

export function Terminal() {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>(["System initialized. Ready for command input."]);
    const { addTask } = useTaskStore();
    const { createSprint } = useSprintStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [history]);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const cmd = input.trim();
        setHistory(prev => [...prev, `> ${cmd}`]);
        setInput("");

        const parts = cmd.toLowerCase().split(" ");
        const action = parts[0];

        try {
            if (action === "add" || action === "task") {
                const title = parts.slice(1).join(" ");
                if (title) {
                    await addTask({ title, priority: "medium", is_backlog: false });
                    setHistory(prev => [...prev, "Objective registry updated."]);
                }
            } else if (action === "sprint") {
                await createSprint({
                    name: `SPRINT_${Date.now().toString().slice(-4)}`,
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
                    minimum_target_xp: 100,
                    maximum_possible_xp: 200,
                    daysAvailable: 7,
                    status: "active"
                });
                setHistory(prev => [...prev, "Neural focus sequence initiated."]);
            } else if (action === "clear") {
                setHistory(["Terminal cache purged."]);
            } else if (action === "help") {
                setHistory(prev => [...prev, "Commands: add [task], sprint, clear, help"]);
            } else {
                setHistory(prev => [...prev, `Command not recognized: ${action}`]);
            }
        } catch (err) {
            setHistory(prev => [...prev, "System error executing protocol."]);
        }
    };

    return (
        <div style={{
            background: 'rgba(5,5,15,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '16px',
            maxHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                <TerminalIcon size={12} />
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>GrindOS // CLI Console</span>
            </div>

            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#818cf8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}
            >
                {history.map((line, i) => (
                    <div key={i} style={{ opacity: i === history.length - 1 ? 1 : 0.6 }}>{line}</div>
                ))}
            </div>

            <form onSubmit={handleCommand} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <ChevronRight size={14} color="#6366f1" />
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="ENTER COMMAND PROTOCOL..."
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '11px', outline: 'none', fontFamily: 'monospace' }}
                />
            </form>
        </div>
    );
}
