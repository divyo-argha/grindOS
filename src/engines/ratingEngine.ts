export const RANKS = [
    { min: 0, max: 799, name: 'Dumb', color: '#808080' },
    { min: 800, max: 999, name: 'Procrastinator', color: '#555555' },
    { min: 1000, max: 1199, name: 'Lazy', color: '#8B4513' },
    { min: 1200, max: 1399, name: 'Newbie', color: '#22c55e' },
    { min: 1400, max: 1599, name: 'Pupil', color: '#06b6d4' },
    { min: 1600, max: 1799, name: 'Specialist', color: '#3b82f6' },
    { min: 1800, max: 1999, name: 'Expert', color: '#a855f7' },
    { min: 2000, max: 2199, name: 'Candidate Master', color: '#ec4899' },
    { min: 2200, max: 2399, name: 'Master', color: '#f97316' },
    { min: 2400, max: 2599, name: 'Legend', color: '#ef4444' },
    { min: 2600, max: Infinity, name: 'GOD', color: '#FFD700' },
];

export function getRank(rating: number) {
    return RANKS.find(r => rating >= r.min && rating <= r.max) ?? RANKS[0];
}

export function getKFactor(rating: number): number {
    if (rating < 1200) return 40;
    if (rating < 2000) return 25;
    return 15;
}

export function calculateRatingChange(
    userRating: number,
    difficultyRating: number,
    earnedXP: number,
    targetXP: number
): number {
    const K = getKFactor(userRating);
    const expected = 1 / (1 + Math.pow(10, (difficultyRating - userRating) / 400));
    const ratio = earnedXP / targetXP;
    const actual = ratio >= 1.0 ? 1.0 : ratio >= 0.9 ? 0.5 : 0.0;
    return Math.round(K * (actual - expected));
}

export function calculateSprintDifficulty(
    totalXP: number,
    taskCount: number,
    daysAvailable: number
): number {
    return Math.round(
        1000 + (totalXP * 2) + (taskCount * 10) + Math.max(0, (14 - daysAvailable) * 15)
    );
}