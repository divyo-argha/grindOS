import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useSprintStore } from "../store/sprintStore";
import { getRank, getRatingProgressToNext } from "../engines/ratingEngine";
import { RANKS } from "../lib/constants";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { getRatingHistory, getAchievements } from "../lib/db";
import { Award, TrendingUp, Zap, History, Shield, Star, Crown, Flame, User } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in relative pb-10">
            <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center animate-bounce-slow">
                <User size={32} className="text-indigo-400 opacity-50" />
            </div>
            <div className="text-center space-y-1">
                <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Synchronizing Profile</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Establishing Neural Link...</div>
            </div>
            <button
                onClick={() => fetchUser()}
                className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 hover:text-white transition-all"
            >
                RETRY CONNECTION
            </button>
        </div>
    );

    const rank = getRank(user.rating);
    const progress = getRatingProgressToNext(user.rating);
    const completedSprints = sprints.filter(s => s.status === "completed" || s.status === "failed");
    const successRate = completedSprints.length > 0
        ? Math.round((completedSprints.filter(s => s.status === "completed").length / completedSprints.length) * 100)
        : 0;

    const chartData = ratingHistory.map((r, i) => ({ i: i + 1, rating: r.rating_after }));

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar animate-fade-in relative pb-16">
            {/* Profile Hero Section */}
            <div className="px-8 pt-12 pb-12 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] opacity-30" />

                <div className="relative mb-6">
                    <div className="w-28 h-28 glass-card rounded-3xl flex items-center justify-center border-2 border-white/10 shadow-2xl animate-float">
                        <span className="text-5xl">👤</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/10" style={{ backgroundColor: rank.color }}>
                        <Crown size={20} className="text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">{user.name}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
                    <span className="text-lg font-black" style={{ color: rank.color }}>{user.rating}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rank.name}</span>
                </div>

                <div className="mt-10 w-full max-w-sm">
                    <div className="flex justify-between items-end mb-3 px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank Progression</span>
                        <span className="text-xs font-black text-white">{progress}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 group">
                        <div
                            className="h-full rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            style={{ width: `${progress}%`, backgroundColor: rank.color }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="px-6 grid grid-cols-3 gap-3 mb-8">
                {[
                    { label: "Best LP", value: user.best_rating, icon: TrendingUp, color: "text-indigo-400" },
                    { label: "Total XP", value: user.total_xp.toLocaleString(), icon: Zap, color: "text-yellow-400" },
                    { label: "Streak", value: `${user.current_streak}d`, icon: Flame, color: "text-orange-500" },
                ].map(s => (
                    <div key={s.label} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <s.icon size={18} className={`${s.color} mb-3 opacity-60`} />
                        <div className="text-lg font-black text-white leading-none mb-1 tabular-nums">{s.value}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Performance Visualization */}
            <div className="px-6 space-y-4 mb-8">
                <div className="glass-card rounded-[2rem] p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <History size={12} className="text-slate-500" />
                            LP Trajectory
                        </h3>
                    </div>

                    <div className="h-40 w-full overflow-hidden">
                        {chartData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={rank.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={rank.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="rating"
                                        stroke={rank.color}
                                        fillOpacity={1}
                                        fill="url(#colorRating)"
                                        strokeWidth={3}
                                        animationDuration={1500}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: "rgba(15, 15, 25, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", fontSize: "10px", color: "#fff" }}
                                        itemStyle={{ color: rank.color, fontWeight: "bold" }}
                                        labelStyle={{ display: "none" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 italic text-[10px] uppercase font-black tracking-widest opacity-30">
                                Trajectory Mapping Offline
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                            <Award size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Combat Record</h4>
                            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{completedSprints.length} OPS COMPLETE</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-black tabular-nums" style={{ color: successRate >= 70 ? "#22c55e" : successRate >= 40 ? "#f97316" : "#ef4444" }}>
                            {successRate}%
                        </div>
                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">SUCCESS</div>
                    </div>
                </div>
            </div>

            {/* Rank Ladder */}
            <div className="px-6 mb-8">
                <div className="glass-card rounded-[2rem] p-8 border border-white/5 pt-10 relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-500 px-4 py-1.5 rounded-full shadow-lg shadow-indigo-500/20 z-10 border border-indigo-400/20">
                        <Shield size={10} className="text-white fill-white/20" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Global Tiers</span>
                    </div>

                    <div className="space-y-px mt-4">
                        {RANKS.slice().reverse().map(r => {
                            const isCurrent = user.rating >= r.min && user.rating <= r.max;
                            return (
                                <div key={r.name} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isCurrent ? "bg-white/10 border border-white/10 scale-[1.02] shadow-xl" : "opacity-30"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: r.color, backgroundColor: 'currentColor' }} />
                                        <span className="text-[10px] font-black uppercase tracking-tight" style={{ color: r.color }}>{r.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] text-slate-500 font-mono font-bold">{r.max === Infinity ? `${r.min}+` : `${r.min}\u2013${r.max}`}</span>
                                        {isCurrent && <Star size={10} className="text-yellow-400 fill-yellow-400 animate-pulse" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="px-6 pb-24">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 ml-2 flex items-center gap-2 opacity-50">
                    <Award size={12} className="text-yellow-500" />
                    Achievements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {achievements.map(a => (
                        <div
                            key={a.key}
                            className={`glass-card p-5 rounded-3xl border transition-all ${a.is_unlocked ? "border-yellow-500/20 shadow-lg shadow-yellow-500/5" : "border-white/5 opacity-20 grayscale blur-[1px]"}`}
                        >
                            <div className="text-3xl mb-3">{a.icon}</div>
                            <div className="text-[10px] font-black text-white mb-1 uppercase tracking-tight leading-tight">{a.name}</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase leading-relaxed">{a.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}