import { RANKS } from "../lib/constants";

export function getRank(rating: number) {
    return RANKS.find(r => rating >= r.min && rating <= r.max) ?? RANKS[0];
}

export function getKFactor(rating: number): number {
    if (rating < 1200) return 40;
    if (rating < 2000) return 25;
    return 15;
}

export function calculateExpectedScore(userRating: number, difficultyRating: number): number {
    return 1 / (1 + Math.pow(10, (difficultyRating - userRating) / 400));
}

export function calculateActualScore(earnedXP: number, targetXP: number): number {
    const ratio = earnedXP / targetXP;
    if (ratio >= 1.0) return 1.0;
    if (ratio >= 0.9) return 0.75;
    if (ratio >= 0.7) return 0.5;
    if (ratio >= 0.5) return 0.25;
    return 0.0;
}

export function calculateRatingChange(
    userRating: number,
    difficultyRating: number,
    earnedXP: number,
    targetXP: number
): number {
    const K = getKFactor(userRating);
    const expected = calculateExpectedScore(userRating, difficultyRating);
    const actual = calculateActualScore(earnedXP, targetXP);
    return Math.round(K * (actual - expected));
}

export function calculateSprintDifficulty(
    totalXP: number,
    taskCount: number,
    daysAvailable: number,
    hasDeadlines = false
): number {
    return Math.round(
        1000
        + (totalXP * 2)
        + (taskCount * 10)
        + Math.max(0, (14 - daysAvailable) * 15)
        + (hasDeadlines ? 50 : 0)
    );
}

export function getSprintResult(earnedXP: number, targetXP: number): "success" | "partial" | "failed" {
    const ratio = earnedXP / targetXP;
    if (ratio >= 1.0) return "success";
    if (ratio >= 0.7) return "partial";
    return "failed";
}

export function getRatingProgressToNext(rating: number): number {
    const rank = getRank(rating);
    if (rank.max === Infinity) return 100;
    const total = rank.max - rank.min + 1;
    const progress = rating - rank.min;
    return Math.round((progress / total) * 100);
}