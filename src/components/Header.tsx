import { Command, Shield, ShieldOff, Pin, PinOff } from "lucide-react";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import { RatingBadge } from "./RatingBadge";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";

export function Header() {
    const { user } = useUserStore();
    const { setView, setCommandOpen } = useUIStore();

    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(true);
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
        const win = getCurrentWindow();
        const updateWindowState = async () => {
            try {
                await win.setAlwaysOnTop(isAlwaysOnTop);
                await win.setShadow(!isPinned);
                console.log(`[Window] AlwaysOnTop: ${isAlwaysOnTop}, Pin: ${isPinned}`);
            } catch (err) {
                console.error("[Window] Error updating state:", err);
            }
        };
        updateWindowState();
    }, [isAlwaysOnTop, isPinned]);

    return (
        <div className="header-raw relative z-[160]">
            <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                    className="relative cursor-pointer"
                    style={{ minWidth: '40px', cursor: 'pointer' }}
                    onClick={() => setView("profile")}
                >
                    {user && <RatingBadge rating={user.rating} size="sm" />}
                </div>
                <div>
                    <h1 style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '2px' }}>GrindOS Core</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status: Link Active</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}>
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: isPinned ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                            color: isPinned ? '#fb923c' : '#64748b',
                            cursor: 'pointer'
                        }}
                        title="Pin to Desktop"
                    >
                        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                    </button>

                    <button
                        onClick={() => setIsAlwaysOnTop(!isAlwaysOnTop)}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: isAlwaysOnTop ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            color: isAlwaysOnTop ? '#818cf8' : '#64748b',
                            cursor: 'pointer'
                        }}
                        title="Always on Top"
                    >
                        {isAlwaysOnTop ? <Shield size={16} /> : <ShieldOff size={16} />}
                    </button>
                </div>

                <button
                    onClick={() => setCommandOpen(true)}
                    style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <Command size={18} />
                </button>
            </div>
        </div>
    );
}
