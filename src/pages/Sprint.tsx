import { useEffect } from "react";
import { Trophy, Plus, Zap, Clock, ChevronRight } from "lucide-react";
import { useSprintStore } from "../store/sprintStore";
import { useTaskStore } from "../store/taskStore";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { TaskCard } from "../components/TaskCard";
import { format } from "date-fns";

export function Sprint() {
    const { activeSprint, fetchActiveSprint, completeSprint } = useSprintStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { user, fetchUser } = useUserStore();
    const { setAddSprintOpen, setAddTaskOpen, showNotification } = useUIStore();

    useEffect(() => {
        fetchActiveSprint();
        fetchTasks();
    }, []);

    async function handleFinishSprint() {
        if (!activeSprint || !user) return;
        try {
            await completeSprint(activeSprint.id, activeSprint.earned_xp, user.rating);
            await fetchUser();
            showNotification("PROTOCOL COMPLETE. RATING ADJUSTED.", "success");
        } catch (err) {
            console.error(err);
            showNotification("FINALIZATION FAILURE", "error");
        }
    }

    const sprintTasks = tasks.filter(t => t.sprint_id === activeSprint?.id);
    const sprintProgress = activeSprint
        ? Math.round((activeSprint.earned_xp / activeSprint.minimum_target_xp) * 100)
        : 0;

    if (!activeSprint) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '40px' }}>
                    <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Trophy size={60} style={{ color: '#1e293b' }} />
                    </div>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Protocol Idle</h2>
                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', maxWidth: '240px', marginBottom: '40px' }}>
                    High-intensity focus bursts required for advancement.
                </p>

                <button
                    onClick={() => setAddSprintOpen(true)}
                    className="premium-btn"
                    style={{ padding: '20px 40px', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <Plus size={20} />
                    INITIALIZE BURST
                </button>
            </div>
        );
    }

    const daysLeft = Math.max(0, Math.ceil((new Date(activeSprint.end_date).getTime() - Date.now()) / 86400000));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Zone */}
            <div style={{ padding: '40px 32px', background: 'rgba(10, 10, 20, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '16px' }}>Neural Burst Active</span>
                        <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', textTransform: 'uppercase', fontStyle: 'italic' }}>{activeSprint.name}</h1>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '1.25rem', textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>{daysLeft}</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Cycles</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '40px' }}>
                    {[
                        { icon: Clock, label: "Threshold", val: format(new Date(activeSprint.end_date), "MMM dd") },
                        { icon: Zap, label: "Target", val: `${activeSprint.minimum_target_xp} XP` },
                        { icon: Trophy, label: "Class", val: activeSprint.difficulty_rating || "Standard" },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <s.icon size={14} style={{ color: '#64748b', marginBottom: '8px' }} />
                            <div style={{ fontSize: '8px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>{s.label}</div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: '#cbd5e1' }}>{s.val}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '40px', fontWeight: 900, color: 'white', fontStyle: 'italic' }}>{sprintProgress}%</span>
                        <span style={{ fontSize: '10px', fontWeight: 900, color: '#6366f1' }}>{activeSprint.earned_xp} / {activeSprint.minimum_target_xp} XP</span>
                    </div>
                    <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', padding: '2px' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, sprintProgress)}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }} />
                    </div>
                </div>
            </div>

            {/* List Zone */}
            <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Node Registry</h3>
                    <button onClick={() => setAddTaskOpen(true)} style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px', color: '#818cf8', cursor: 'pointer' }}>
                        <Plus size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sprintTasks.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.2 }}>
                            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Registries Clear</p>
                        </div>
                    ) : (
                        sprintTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))
                    )}
                </div>

                {sprintProgress >= 100 && (
                    <button
                        onClick={handleFinishSprint}
                        style={{ width: '100%', padding: '24px', borderRadius: '1.5rem', marginTop: '32px', background: 'linear-gradient(135deg, #22c55e, #166534)', color: 'white', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        FINALIZE PROTOCOL
                        <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                    </button>
                )}
            </div>
        </div>
    );
}
