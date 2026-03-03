import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useSprintStore } from "../store/sprintStore";
import { getRank, getRatingProgressToNext } from "../engines/ratingEngine";
import { RANKS } from "../lib/constants";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { getRatingHistory, getAchievements } from "../lib/db";
import { useUIStore } from "../store/uiStore";
import { ArrowLeft, Award, TrendingUp, Zap, History, Shield, Star, Crown, Flame } from "lucide-react";

export function Profile() {
    const { user, fetchUser } = useUserStore();
    const { sprints, fetchSprints } = useSprintStore();
    const { setView } = useUIStore();
    const [ratingHistory, setRatingHistory] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        fetchUser();
        fetchSprints();
        getRatingHistory().then(setRatingHistory);
        getAchievements().then(setAchievements);
    }, []);

    if (!user) return <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Initializing User Profile...</div>;

    const rank = getRank(user.rating);
    const progress = getRatingProgressToNext(user.rating);
    const completedSprints = sprints.filter(s => s.status === "completed" || s.status === "failed");
    const successRate = completedSprints.length > 0
        ? Math.round((completedSprints.filter(s => s.status === "completed").length / completedSprints.length) * 100)
        : 0;

    const chartData = ratingHistory.map((r, i) => ({ i: i + 1, rating: r.rating_after }));

    return (
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden animate-fade-in relative">
            {/* Navigation Header */}
            <div className="sticky top-0 z-20 px-6 py-4 glass-morphism border-b border-white/5 flex items-center gap-4">
                <button
                    onClick={() => setView("dashboard")}
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm font-black text-white uppercase tracking-widest">Global Profile</h1>
            </div>

            {/* Profile Hero Section */}
            <div className="px-8 pt-10 pb-12 flex flex-col items-center text-center relative overflow-hidden">
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
                    <div className="flex justify-between items-end mb-3">
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
                        <div className="text-lg font-black text-white leading-none mb-1">{s.value}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Performance Visualization */}
            <div className="px-6 space-y-4 mb-8">
                <div className="glass-card rounded-[2.5rem] p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <History size={14} className="text-slate-500" />
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
                            <div className="h-full flex items-center justify-center text-slate-600 italic text-xs">
                                Insufficient data for trajectory mapping
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-3xl p-6 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                            <Award size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white underline decoration-slate-600 underline-offset-4 decoration-2">Sprint Combat Record</h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{completedSprints.length} OPERATIONS COMPLETED</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black" style={{ color: successRate >= 70 ? "#22c55e" : successRate >= 40 ? "#f97316" : "#ef4444" }}>
                            {successRate}%
                        </div>
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">WIN RATE</div>
                    </div>
                </div>
            </div>

            {/* Rank Ladder / Global Tiers */}
            <div className="px-6 mb-8">
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 pt-10 relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-500 px-4 py-1 rounded-full shadow-lg shadow-indigo-500/20 z-10">
                        <Shield size={12} className="text-white fill-white/20" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Ranking Tiers</span>
                    </div>

                    <div className="space-y-px mt-4">
                        {RANKS.slice().reverse().map(r => {
                            const isCurrent = user.rating >= r.min && user.rating <= r.max;
                            return (
                                <div key={r.name} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isCurrent ? "bg-white/10 border border-white/10 scale-[1.02] shadow-xl" : "hover:bg-white/5 opacity-40 hover:opacity-100"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: r.color, backgroundColor: 'currentColor' }} />
                                        <span className="text-xs font-black uppercase tracking-tight" style={{ color: r.color }}>{r.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">{r.max === Infinity ? `${r.min}+` : `${r.min} \u2014 ${r.max}`}</span>
                                        {isCurrent && (
                                            <div className="animate-pulse">
                                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Achievements Collection */}
            <div className="px-6 pb-20">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 ml-2 flex items-center gap-2">
                    <Award size={14} className="text-yellow-500" />
                    Medal Collection
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {achievements.map(a => (
                        <div
                            key={a.key}
                            className={`glass-card p-5 rounded-3xl border transition-all ${a.is_unlocked ? "border-yellow-500/30 scale-100" : "border-white/5 opacity-30 grayscale blur-[1px] hover:blur-0 hover:grayscale-0 hover:opacity-60"
                                }`}
                        >
                            <div className="text-3xl mb-3">{a.icon}</div>
                            <div className="text-xs font-black text-white mb-1 uppercase tracking-tight leading-tight">{a.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed">{a.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}