export const RANKS = [
    { min: 0, max: 799, name: "Dumb", color: "#808080", class: "rank-dumb" },
    { min: 800, max: 999, name: "Procrastinator", color: "#555555", class: "rank-procrastinator" },
    { min: 1000, max: 1199, name: "Lazy", color: "#8B4513", class: "rank-lazy" },
    { min: 1200, max: 1399, name: "Newbie", color: "#22c55e", class: "rank-newbie" },
    { min: 1400, max: 1599, name: "Pupil", color: "#06b6d4", class: "rank-pupil" },
    { min: 1600, max: 1799, name: "Specialist", color: "#3b82f6", class: "rank-specialist" },
    { min: 1800, max: 1999, name: "Expert", color: "#a855f7", class: "rank-expert" },
    { min: 2000, max: 2199, name: "Candidate Master", color: "#ec4899", class: "rank-candidate" },
    { min: 2200, max: 2399, name: "Master", color: "#f97316", class: "rank-master" },
    { min: 2400, max: 2599, name: "Legend", color: "#ef4444", class: "rank-legend" },
    { min: 2600, max: Infinity, name: "GOD", color: "#FFD700", class: "rank-god" },
];

export const PRIORITY_CONFIG = {
    low: { label: "Low", color: "#6b7280", xp: 5 },
    medium: { label: "Medium", color: "#3b82f6", xp: 10 },
    high: { label: "High", color: "#f97316", xp: 20 },
    critical: { label: "Critical", color: "#ef4444", xp: 35 },
};

export const STATUS_CONFIG = {
    todo: { label: "Todo", color: "#6b7280" },
    in_progress: { label: "In Progress", color: "#3b82f6" },
    completed: { label: "Completed", color: "#22c55e" },
    failed: { label: "Failed", color: "#ef4444" },
    deferred: { label: "Deferred", color: "#8B4513" },
};

export const MOOD_CONFIG = {
    great: { emoji: "🔥", label: "Great", color: "#22c55e" },
    good: { emoji: "😊", label: "Good", color: "#3b82f6" },
    neutral: { emoji: "😐", label: "Neutral", color: "#6b7280" },
    bad: { emoji: "😔", label: "Bad", color: "#f97316" },
    terrible: { emoji: "💀", label: "Terrible", color: "#ef4444" },
};

export const DB_PATH = import.meta.env.VITE_DB_PATH || "productivity-os.db";