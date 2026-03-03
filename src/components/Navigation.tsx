import { Plus, Layout, User, TrendingUp, Zap } from "lucide-react";
import { useUIStore } from "../store/uiStore";

export function Navigation() {
    const { setView, setAddTaskOpen, currentView } = useUIStore();

    const navItems = [
        { id: "dashboard", icon: Layout, label: "Neural Net", color: "#6366f1" },
        { id: "sprint", icon: Zap, label: "Focus Burst", color: "#fb923c" },
        { id: "profile", icon: User, label: "Identity", color: "#a855f7" },
        { id: "analytics", icon: TrendingUp, label: "Intel", color: "#ec4899" }
    ];

    return (
        <div className="nav-raw relative z-[150]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'rgba(10,10,20,0.95)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
                onClick={() => setAddTaskOpen(true)}
                className="premium-btn"
                style={{ flex: 1, padding: '14px', borderRadius: '1rem', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <Plus size={18} />
                <span>INJEST OBJECTIVE</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
                {navItems.map(nav => {
                    const isActive = currentView === nav.id;
                    return (
                        <button
                            key={nav.id}
                            onClick={() => setView(nav.id as any)}
                            style={{
                                padding: '12px',
                                borderRadius: '14px',
                                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                color: isActive ? nav.color : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            title={nav.label}
                        >
                            <nav.icon
                                size={20}
                                style={{ strokeWidth: 2 }}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
