import { useState } from "react";
import { Rocket, X, ChevronRight } from "lucide-react";
import { useSprintStore } from "../store/sprintStore";
import { useUIStore } from "../store/uiStore";
import { useTaskStore } from "../store/taskStore";
import { format, addDays } from "date-fns";

export function CreateSprintModal() {
    const { addSprintOpen, setAddSprintOpen, showNotification } = useUIStore();
    const { createSprint } = useSprintStore();
    const { tasks } = useTaskStore();

    const [form, setForm] = useState({
        name: `PHASE_${format(new Date(), "MM_dd")}`,
        duration: 7,
        minTargetXP: 100,
    });

    if (!addSprintOpen) return null;

    const backlogTasks = tasks.filter(t => t.is_backlog);
    const totalBacklogXP = backlogTasks.reduce((sum, t) => sum + t.xp_value, 0);

    async function handleSubmit() {
        if (!form.name.trim()) {
            showNotification("SPRINT IDENTIFIER REQUIRED", "error");
            return;
        }

        try {
            const startDate = new Date().toISOString();
            const endDate = addDays(new Date(), form.duration).toISOString();
            await createSprint({
                name: form.name,
                start_date: startDate,
                end_date: endDate,
                minimum_target_xp: form.minTargetXP,
                maximum_possible_xp: Math.max(form.minTargetXP, totalBacklogXP),
                daysAvailable: form.duration,
                status: "active"
            });
            setAddSprintOpen(false);
            showNotification(`PROTOCOL "${form.name}" INITIALIZED`, "success");
        } catch (err) {
            console.error(err);
            showNotification("INITIALIZATION FAILURE", "error");
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                onClick={() => setAddSprintOpen(false)}
            />

            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '440px',
                background: '#0f0f1a',
                borderRadius: '2.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
            }}>
                <div style={{ height: '4px', background: 'linear-gradient(90deg, #f97316, #6366f1, #a855f7)' }} />

                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '1rem', color: '#f97316' }}>
                                <Rocket size={24} />
                            </div>
                            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>Initialize Sprint</h2>
                        </div>
                        <button onClick={() => setAddSprintOpen(false)} style={{ background: 'transparent', color: '#475569', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Identifier</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '16px', fontWeight: 700 }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Duration</label>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: '8px 0' }}>{form.duration}D</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[3, 7, 14].map(d => (
                                        <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))} style={{ flex: 1, padding: '6px', fontSize: '10px', background: form.duration === d ? '#f97316' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 700 }}>{d}D</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <label style={{ fontSize: '9px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Target XP</label>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: '8px 0' }}>{form.minTargetXP}</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[100, 250, 500].map(x => (
                                        <button key={x} onClick={() => setForm(f => ({ ...f, minTargetXP: x }))} style={{ flex: 1, padding: '6px', fontSize: '10px', background: form.minTargetXP === x ? '#6366f1' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 700 }}>{x}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            style={{
                                width: '100%',
                                padding: '20px',
                                borderRadius: '1.5rem',
                                fontSize: '12px',
                                marginTop: '16px',
                                background: 'linear-gradient(135deg, #E95420, #772953)',
                                color: 'white',
                                fontWeight: 900,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            INITIALIZE PROTOCOL
                            <ChevronRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
