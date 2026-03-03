import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useSprintStore } from "../store/sprintStore";
import { getRank } from "../engines/ratingEngine";
import { AreaChart as ReChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { getRatingHistory, getAchievements } from "../lib/db";
import { TrendingUp, Zap, Flame, User, Rocket, AreaChart as AreaChartIcon, Award } from "lucide-react";

export function Profile() {
    const { user, fetchUser } = useUserStore();
    const { sprints, fetchSprints } = useSprintStore();
    const [ratingHistory, setRatingHistory] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                await fetchUser();
                await fetchSprints();
                const history = await getRatingHistory();
                setRatingHistory(history);
                const achieves = await getAchievements();
                setAchievements(achieves);
            } catch (err) {
                console.error("Profile initialization error:", err);
            }
        };
        init();
    }, []);

    if (!user) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={30} color="#64748b" />
            </div>
            <p style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Neural Link Offline</p>
        </div>
    );

    const rank = getRank(user.rating);
    const completedSprints = sprints.filter(s => s.status === "completed" || s.status === "failed");
    const successRate = completedSprints.length > 0
        ? Math.round((completedSprints.filter(s => s.status === "completed").length / completedSprints.length) * 100)
        : 0;

    const chartData = ratingHistory.map((r, i) => ({ i: i + 1, rating: r.rating_after }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '40px 24px 120px' }}>
            {/* User Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '2rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '3px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    marginBottom: '24px'
                }}>
                    👤
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '8px' }}>{user.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: rank.color }}>{user.rating} LP</span>
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ fontSize: '10px', fontWeight: 900, color: rank.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{rank.name}</span>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                {[
                    { label: "APE LP", val: user.best_rating, icon: TrendingUp, color: "#818cf8" },
                    { label: "NET XP", val: user.total_xp, icon: Zap, color: "#eab308" },
                    { label: "STREAK", val: `${user.current_streak}D`, icon: Flame, color: "#f97316" }
                ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <s.icon size={16} style={{ color: s.color, marginBottom: '8px', opacity: 0.8 }} />
                        <div style={{ fontSize: '14px', fontWeight: 900, color: 'white', marginBottom: '2px' }}>{s.val}</div>
                        <div style={{ fontSize: '8px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Performance Chart */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '2rem', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AreaChartIcon size={14} /> Performance
                    </h3>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '4px 8px', borderRadius: '6px' }}>LINK OPTIMAL</div>
                </div>
                <div style={{ height: '140px' }}>
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ReChart data={chartData}>
                                <Area type="monotone" dataKey="rating" stroke={rank.color} fill={rank.color} fillOpacity={0.1} strokeWidth={3} dot={false} />
                                <Tooltip contentStyle={{ background: '#0a0a14', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                            </ReChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                            <TrendingUp size={32} />
                        </div>
                    )}
                </div>
            </div>

            {/* Achievement Bar */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Rocket size={20} color="#64748b" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>Protocol Yield</h4>
                        <p style={{ fontSize: '8px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Efficiency Metrics</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#22c55e', fontStyle: 'italic' }}>{successRate}%</div>
                </div>
            </div>

            {/* Medals */}
            <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Award size={16} color="#eab308" />
                    <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Medals of Honor</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {achievements.map(a => (
                        <div key={a.key} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', opacity: a.is_unlocked ? 1 : 0.2 }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{a.icon}</div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase', marginBottom: '4px' }}>{a.name}</div>
                            <div style={{ fontSize: '8px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{a.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}