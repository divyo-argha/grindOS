import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useSprintStore } from "../store/sprintStore";
import { getRank, getRatingProgressToNext } from "../engines/ratingEngine";
import { RANKS } from "../lib/constants";
import { AreaChart as ReChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { getRatingHistory, getAchievements } from "../lib/db";
import { Award, TrendingUp, Zap, Shield, Star, Crown, Flame, User, Rocket, AreaChart as AreaChartIcon } from "lucide-react";

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
        <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in relative">
            <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center animate-bounce-slow border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                <User size={40} className="text-indigo-400 opacity-50" />
            </div>
            <div className="text-center">
                <div className="text-[12px] font-black text-white uppercase tracking-[0.4em]">Neural Link Offline</div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-3 animate-pulse">Syncing system metrics...</div>
            </div>
            <button
                onClick={() => fetchUser()}
                className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 hover:text-white transition-all active:scale-95"
            >
                RE-ESTABLISH LINK
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
        <div className="flex flex-col h-full animate-fade-in pb-10">
            {/* Identity Cluster */}
            <div className="px-8 pt-16 pb-14 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] opacity-30 animate-pulse" />

                <div className="relative mb-8 group">
                    <div className="w-32 h-32 glass-card rounded-[2.5rem] flex items-center justify-center border-[3px] border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-float relative z-10 group-hover:border-indigo-500/30 transition-all duration-700">
                        {/* Avatar Placeholder */}
                        <div className="text-6xl select-none group-hover:scale-110 transition-transform duration-700">👤</div>
                    </div>
                    {/* Rank Badge Floating */}
                    <div
                        className="absolute -bottom-3 -right-3 w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-2xl border-[3px] border-[#0c0c14] z-20 animate-bounce-slow"
                        style={{ backgroundColor: rank.color, boxShadow: `0 10px 30px -10px ${rank.color}88` }}
                    >
                        <Crown size={28} className="text-white shadow-xl" />
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">{user.name}</h2>
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-white/2 border border-white/5 shadow-inner">
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Current Standing</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black italic tabular-nums leading-none tracking-tighter" style={{ color: rank.color }}>{user.rating} LP</span>
                                <div className="h-4 w-px bg-white/10" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: rank.color }}>{rank.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rank Progress Bar */}
                <div className="mt-12 w-full max-w-sm relative z-10">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tier Ascension</span>
                        <span className="text-xs font-black text-white italic">{progress}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                        <div
                            className="h-full rounded-full transition-all duration-1000 relative"
                            style={{ width: `${progress}%`, backgroundColor: rank.color, boxShadow: `0 0 15px ${rank.color}44` }}
                        >
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="px-6 grid grid-cols-3 gap-4 mb-10">
                {[
                    { label: "Apex LP", value: user.best_rating, icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                    { label: "Net XP", value: user.total_xp.toLocaleString(), icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                    { label: "Streak", value: `${user.current_streak}d`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((s, i) => (
                    <div key={i} className="glass-card p-5 rounded-[1.75rem] border border-white/5 flex flex-col items-center justify-center text-center group hover:border-white/10 transition-all active:scale-95">
                        <div className={`p-2.5 ${s.bg} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                            <s.icon size={22} className={`${s.color} opacity-80`} />
                        </div>
                        <div className="text-xl font-black text-white leading-none mb-1 tabular-nums tracking-tighter">{s.value}</div>
                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Performance Visualization */}
            <div className="px-6 space-y-5 mb-10">
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                <AreaChartIcon size={14} className="text-indigo-400" />
                                Performance Sequence
                            </h3>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-2">{ratingHistory.length} DATA POINTS RECORDED</p>
                        </div>
                        <div className="bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Link Health: Optimal</span>
                        </div>
                    </div>

                    <div className="h-44 w-full">
                        {chartData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ReChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={rank.color} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={rank.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="rating"
                                        stroke={rank.color}
                                        fillOpacity={1}
                                        fill="url(#colorRating)"
                                        strokeWidth={4}
                                        dot={false}
                                        animationDuration={2000}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: "rgba(10, 10, 20, 0.95)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "16px", fontSize: "10px", fontWeight: "900", color: "#fff", backdropFilter: "blur(10px)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                                        itemStyle={{ color: rank.color, padding: "0" }}
                                        labelStyle={{ display: "none" }}
                                        cursor={{ stroke: `${rank.color}44`, strokeWidth: 2 }}
                                    />
                                </ReChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center space-y-4 opacity-50">
                                <div className="p-4 bg-white/2 rounded-full border border-white/5">
                                    <TrendingUp size={32} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Trajectory Map Pending</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Efficiency Banner */}
                <div className="glass-card rounded-[2rem] p-7 border border-white/5 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-500">
                            <Rocket size={28} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none mb-2">Protocol Yield</h4>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{completedSprints.length} OPERATIONS ANALYZED</p>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <div className="text-3xl font-black italic leading-none tabular-nums" style={{ color: successRate >= 70 ? "#22c55e" : successRate >= 40 ? "#f97316" : "#ef4444" }}>
                            {successRate}%
                        </div>
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Consistency</div>
                    </div>
                </div>
            </div>

            {/* Rank Tier Reference */}
            <div className="px-6 mb-10">
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 pt-14 relative overflow-hidden bg-white/[0.01]">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-indigo-500 px-6 py-2 rounded-full shadow-[0_10px_30px_rgba(99,102,241,0.3)] z-20 border border-indigo-400/20">
                        <Shield size={12} className="text-white fill-white/20" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural Ranking</span>
                    </div>

                    <div className="space-y-1 relative z-10 mt-6">
                        {RANKS.slice().reverse().map(r => {
                            const isCurrent = user.rating >= r.min && user.rating <= r.max;
                            return (
                                <div key={r.name} className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 ${isCurrent ? "bg-white/5 border border-white/10 scale-[1.04] shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-10" : "opacity-20 hover:opacity-40"}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full shadow-[0_0_12px_currentColor] animate-pulse" style={{ color: r.color, backgroundColor: 'currentColor' }} />
                                        <span className="text-[11px] font-black uppercase tracking-widest italic" style={{ color: r.color }}>{r.name}</span>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="text-[10px] text-slate-500 font-mono font-black italic">{r.max === Infinity ? `${r.min}+` : `${r.min}\u2013${r.max}`}</span>
                                        {isCurrent && <Star size={12} className="text-yellow-400 fill-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Achievements Collection */}
            <div className="px-6 pb-32">
                <div className="flex items-center gap-4 mb-8 ml-4">
                    <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <Award size={16} className="text-yellow-500" />
                    </div>
                    <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Medals of Honor</h3>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    {achievements.map(a => (
                        <div
                            key={a.key}
                            className={`glass-card p-6 rounded-[2rem] border transition-all duration-700 relative overflow-hidden group ${a.is_unlocked ? "border-yellow-500/30 shadow-[0_15px_30px_rgba(234,179,8,0.05)]" : "border-white/5 opacity-10 grayscale blur-[2px] active:blur-none transition-all"}`}
                        >
                            {a.is_unlocked && <div className="absolute inset-0 bg-yellow-500/2 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            <div className="text-4xl mb-4 relative z-10 group-hover:scale-110 transition-transform duration-500">{a.icon}</div>
                            <div className="text-[11px] font-black text-white mb-2 uppercase tracking-tight relative z-10">{a.name}</div>
                            <div className="text-[9px] text-slate-500 font-black uppercase leading-relaxed tracking-wider opacity-80 relative z-10">{a.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}