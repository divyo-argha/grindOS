import { unlockAchievement, updateUser, upsertDailyLog } from "../lib/db";

export async function onTaskCompleted(user: any, task: any, totalCompleted: number) {
    // XP
    const newXP = user.total_xp + task.xp_value;
    await updateUser({ total_xp: newXP });

    // Daily log
    await upsertDailyLog({ tasks_completed: 1, xp_earned: task.xp_value });

    // Achievements
    if (totalCompleted === 1) await unlockAchievement("first_task");
    if (totalCompleted >= 100) await unlockAchievement("tasks_100");
    if (task.priority === "critical") await unlockAchievement("deep_work");
}

export async function onDayCompleted(user: any) {
    const newStreak = user.current_streak + 1;
    const longestStreak = Math.max(newStreak, user.longest_streak);
    await updateUser({ current_streak: newStreak, longest_streak: longestStreak });

    if (newStreak >= 7) await unlockAchievement("streak_7");
    if (newStreak >= 30) await unlockAchievement("streak_30");
}

export async function onRatingChange(newRating: number) {
    if (newRating >= 1600) await unlockAchievement("rating_1600");
    if (newRating >= 2000) await unlockAchievement("rating_2000");
    if (newRating >= 2600) await unlockAchievement("rating_god");
}

export function getMotivationalMessage(rating: number, streak: number, todayXP: number): string {
    if (streak >= 7) return `🔥 ${streak}-day streak! You're unstoppable.`;
    if (todayXP >= 100) return `⚡ ${todayXP} XP today. Beast mode activated.`;
    if (rating >= 2000) return `👑 Candidate Master energy. Keep grinding.`;
    return "💪 Every task is a step forward. Let's go.";
}