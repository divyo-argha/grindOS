import { useState } from "react";
import { Check, Trash2, ChevronDown, Zap, Target } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useUserStore } from "../store/userStore";
import { onTaskCompleted } from "../engines/gamificationEngine";
import { PRIORITY_CONFIG } from "../lib/constants";

interface Props {
    task: any;
    compact?: boolean;
}

export function TaskCard({ task, compact = false }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");
    const { completeTask, deleteTask, fetchSubtasks, subtasks, addSubtask, completeSubtask, fetchTasks } = useTaskStore();
    const { user, fetchUser } = useUserStore();

    const pCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
    const taskSubs = subtasks[task.id] || [];
    const isCompleted = task.status === "completed";

    async function handleComplete() {
        if (isCompleted) return;
        try {
            await completeTask(task.id);
            if (user) {
                await onTaskCompleted(user, task, 0);
                await fetchUser();
            }
            await fetchTasks({ isBacklog: false });
        } catch (err) {
            console.error(err);
        }
    }

    async function handleExpand() {
        if (!expanded) await fetchSubtasks(task.id);
        setExpanded(!expanded);
    }

    async function handleAddSubtask(e: React.KeyboardEvent) {
        if (e.key === "Enter" && newSubtask.trim()) {
            await addSubtask(task.id, newSubtask.trim());
            setNewSubtask("");
        }
    }

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '1.25rem',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            transition: 'all 0.3s',
            opacity: isCompleted ? 0.4 : 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '12px' }}>
                <button
                    onClick={handleComplete}
                    disabled={isCompleted}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        border: '2px solid rgba(255,255,255,0.1)',
                        background: isCompleted ? '#6366f1' : 'transparent',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isCompleted ? 'default' : 'pointer'
                    }}
                >
                    {isCompleted && <Check size={14} />}
                </button>

                <div style={{ flex: 1, cursor: 'pointer' }} onClick={handleExpand}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: pCfg.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{pCfg.label}</span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'white', textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title}</h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(234,179,8,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                        <Zap size={10} color="#eab308" />
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#eab308' }}>+{task.xp_value}</span>
                    </div>
                    {!compact && (
                        <button onClick={() => deleteTask(task.id)} style={{ padding: '8px', color: '#64748b', cursor: 'pointer', background: 'transparent' }}>
                            <Trash2 size={14} />
                        </button>
                    )}
                    <button onClick={handleExpand} style={{ padding: '8px', color: '#64748b', cursor: 'pointer', background: 'transparent', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {expanded && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {taskSubs.length > 0 ? (
                            taskSubs.map(sub => (
                                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => sub.status !== "completed" && completeSubtask(sub.id, task.id)}
                                        style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: sub.status === 'completed' ? '#6366f1' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {sub.status === 'completed' && <Check size={10} />}
                                    </button>
                                    <span style={{ fontSize: '11px', color: sub.status === 'completed' ? '#64748b' : '#cbd5e1', textDecoration: sub.status === 'completed' ? 'line-through' : 'none' }}>{sub.title}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>No sub-objectives</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px' }}>
                        <Target size={14} color="#64748b" />
                        <input
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={handleAddSubtask}
                            placeholder="Add sub-objective..."
                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '11px', outline: 'none' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}