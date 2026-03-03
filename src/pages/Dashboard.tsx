import { useEffect } from "react";
import { Plus, Trophy, Zap } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useSprintStore } from "../store/sprintStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { TaskCard } from "../components/TaskCard";

export function Dashboard() {
    const { tasks, fetchTasks } = useTaskStore();
    const { activeSprint, fetchActiveSprint } = useSprintStore();
    const { fetchUser } = useUserStore();
    const { setAddTaskOpen, setView } = useUIStore();

    useEffect(() => {
        fetchTasks({ isBacklog: false });
        fetchActiveSprint();
        fetchUser();
    }, []);

    const activeTasks = tasks.filter(t => t.status !== "completed" && t.status !== "failed" && !t.is_backlog);

    const sprintProgress = activeSprint
        ? Math.round((activeSprint.earned_xp / activeSprint.minimum_target_xp) * 100)
        : 0;
    const sprintDaysLeft = activeSprint
        ? Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000))
        : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 16px', gap: '24px' }}>
            {/* Active Sprint Section */}
            {activeSprint ? (
                <div
                    onClick={() => setView("sprint")}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '2rem',
                        padding: '30px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: 0.05 }}>
                        <Trophy size={100} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Active Protocol</h3>
                                <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>{activeSprint.name}</h2>
                            </div>
                            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                                <span style={{ fontSize: '9px', fontWeight: 900, color: '#a5b4fc' }}>{sprintDaysLeft}D LEFT</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '32px', fontWeight: 900, fontStyle: 'italic', color: 'white' }}>{sprintProgress}%</span>
                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b' }}>{activeSprint.earned_xp} / {activeSprint.minimum_target_xp} XP</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, sprintProgress)}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setView("sprint")}
                    style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '2px dashed rgba(255,255,255,0.05)',
                        borderRadius: '2rem',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ margin: '0 auto 20px', width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={30} color="#475569" />
                    </div>
                    <h4 style={{ color: 'white', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>No Active Protocol</h4>
                </div>
            )}

            {/* Objectives List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Primary Objectives</h3>
                    <button onClick={() => setAddTaskOpen(true)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '6px', color: '#818cf8', cursor: 'pointer' }}>
                        <Plus size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeTasks.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.2 }}>
                            <Zap size={40} style={{ marginBottom: '16px' }} />
                            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Registry Clear</p>
                        </div>
                    ) : (
                        activeTasks.slice(0, 5).map(task => (
                            <TaskCard key={task.id} task={task} compact />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}