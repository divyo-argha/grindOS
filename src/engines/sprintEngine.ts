import { getSprintResult } from "./ratingEngine";

export interface SprintMetrics {
    progress: number;
    daysRemaining: number;
    health: "excellent" | "good" | "warning" | "danger";
}

export function calculateSprintMetrics(earnedXP: number, targetXP: number, endDate: string): SprintMetrics {
    const progress = Math.round((earnedXP / targetXP) * 100);
    const daysRemaining = Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));

    // Health logic
    let health: SprintMetrics["health"] = "good";
    const totalDays = 7; // Assuming default 7 for health calc if not provided
    const dayRatio = (totalDays - daysRemaining) / totalDays;
    const progressRatio = earnedXP / targetXP;

    if (progressRatio >= 1.0) health = "excellent";
    else if (progressRatio >= dayRatio) health = "good";
    else if (progressRatio >= dayRatio * 0.5) health = "warning";
    else health = "danger";

    return { progress, daysRemaining, health };
}

export function getSprintSummaryMessage(earnedXP: number, targetXP: number): { title: string; subtitle: string } {
    const result = getSprintResult(earnedXP, targetXP);

    if (result === "success") {
        return {
            title: "Sprint Mastered!",
            subtitle: "You exceeded your goals. The grind never stops."
        };
    } else if (result === "partial") {
        return {
            title: "Partial Victory",
            subtitle: "Not quite the target, but progress is progress."
        };
    } else {
        return {
            title: "Sprint Failed",
            subtitle: "A hard loss, but a lesson learned. Sync back up."
        };
    }
}
