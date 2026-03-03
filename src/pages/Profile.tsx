import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { useSprintStore } from "../store/sprintStore";
import { getRank, getRatingProgressToNext } from "../engines/ratingEngine";
import { RANKS } from "../lib/constants";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getRatingHistory, getAchievements } from "../lib/db";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useUIStore } from "../store/uiStore";

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

    if (!user) return <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>;

    const rank = getRank(user.rating);
    const progress = getRatingProgressToNext(user.rating);
    const completedSprints = sprints.filter(s => s.status === "completed" || s.status === "failed");
    const successRate = completedSprints.length > 0
        ? Math.round((completedSprints.filter(s => s.status === "completed").length / completedSprints.length) * 100)
        : 0;

    const chartData = ratingHistory.map((r, i) => ({ i: i + 1, rating: r.rating_after }));

    return (
        <div className="flex flex-col h-full bg-surface-0 overflow-y-auto">
            {/* Back */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-3">
                <button onClick={() => setView("dashboard")} className="text-slate-500 hover:text-slate-300">
                    <ArrowLeft size={16} />
                </button>
                <span className="text-sm font-bold text-slate-200">Profile</span>
            </div>

            {/* Hero */}
            <div className="px-4 py-5 border-b border-surface-3 text-center">
                <div className="text-4xl mb-2">👤</div>
                <div className="text-lg font-bold text-slate-100">{user.name}</div>
                <div className="text-3xl font-bold mt-1" style={{ color: rank.color }}>{user.rating}</div>
                <div className="text-base font-semibold mt-0.5" style={{ color: rank.color }}>{rank.name}</div>
                <div className="mt-3 mx-auto max-w-xs">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress to next rank</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: rank.color }} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-0 border-b border-surface-3">
                {[
                    { label: "Best Rating", value: user.best_rating },
                    { label: "Total XP", value: user.total_xp.toLocaleString() },
                    { label: "Streak", value: `${user.current_streak}d 🔥` },
                ].map(s => (
                    <div key={s.label} className="flex flex-col items-center py-3 border-r last:border-r-0 border-surface-3">
                        <div className="text-lg font-bold font-mono text-slate-100">{s.value}</div>
                        <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Rating chart */}
            {chartData.length > 1 && (
                <div className="px-4 py-4 border-b border-surface-3">
                    <div className="text-xs text-slate-500 mb-2 font-medium">Rating History</div>
                    <ResponsiveContainer width="100%" height={80}>
                        <LineChart data={chartData}>
                            <Line type="monotone" dataKey="rating" stroke={rank.color} dot={false} strokeWidth={2} />
                            <Tooltip
                                contentStyle={{ background: "#1a1a24", border: "1px solid #22222f", borderRadius: 6, fontSize: 11 }}
                                labelFormatter={() => ""}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Sprint stats */}
            <div className="px-4 py-3 border-b border-surface-3">
                <div className="text-xs text-slate-500 mb-2 font-medium">Sprint Performance</div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{completedSprints.length} sprints completed</span>
                    <span className="font-mono" style={{ color: successRate >= 70 ? "#22c55e" : successRate >= 40 ? "#f97316" : "#ef4444" }}>
                        {successRate}% success rate
                    </span>
                </div>
            </div>

            {/* Rank ladder */}
            <div className="px-4 py-3 border-b border-surface-3">
                <div className="text-xs text-slate-500 mb-2 font-medium">Rank Ladder</div>
                <div className="space-y-1">
                    {RANKS.map(r => (
                        <div key={r.name} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${user.rating >= r.min && user.rating <= r.max ? "bg-surface-3" : ""}`}>
                            <span style={{ color: r.color }} className="font-medium">{r.name}</span>
                            <span className="text-slate-600 font-mono">{r.max === Infinity ? `${r.min}+` : `${r.min}–${r.max}`}</span>
                            {user.rating >= r.min && <span className="text-xs ml-2" style={{ color: r.color }}>← you</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements */}
            <div className="px-4 py-3">
                <div className="text-xs text-slate-500 mb-2 font-medium">Achievements</div>
                <div className="grid grid-cols-3 gap-2">
                    {achievements.map(a => (
                        <div
                            key={a.key}
                            className={`flex flex-col items-center text-center p-2 rounded-lg border ${a.is_unlocked ? "border-yellow-500/30 bg-yellow-500/10" : "border-surface-3 bg-surface-1 opacity-40"
                                }`}
                        >
                            <div className="text-2xl mb-1">{a.icon}</div>
                            <div className="text-xs font-medium text-slate-300">{a.name}</div>
                            <div className="text-xs text-slate-600 leading-tight mt-0.5">{a.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}