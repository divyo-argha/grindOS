import { create } from "zustand";
import * as db from "../lib/db";
import { calculateRatingChange, calculateSprintDifficulty } from "../engines/ratingEngine";
import { insertRatingHistory } from "../lib/db";
import { onRatingChange } from "../engines/gamificationEngine";

interface Sprint {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: "planned" | "active" | "completed" | "failed";
    difficulty_rating: number;
    minimum_target_xp: number;
    maximum_possible_xp: number;
    earned_xp: number;
    rating_before: number | null;
    rating_after: number | null;
    rating_change: number;
}

interface SprintStore {
    sprints: Sprint[];
    activeSprint: Sprint | null;
    loading: boolean;
    fetchSprints: () => Promise<void>;
    fetchActiveSprint: () => Promise<void>;
    createSprint: (data: any) => Promise<void>;
    completeSprint: (sprintId: number, earnedXP: number, userRating: number) => Promise<number>;
    updateEarnedXP: (sprintId: number, xp: number) => Promise<void>;
}

export const useSprintStore = create<SprintStore>((set, get) => ({
    sprints: [],
    activeSprint: null,
    loading: false,

    fetchSprints: async () => {
        const sprints = await db.getSprints();
        set({ sprints });
    },

    fetchActiveSprint: async () => {
        try {
            const sprint = await db.getActiveSprint();
            console.log("Fetched active sprint:", sprint);
            set({ activeSprint: sprint });
        } catch (error) {
            console.error("Failed to fetch active sprint:", error);
        }
    },

    createSprint: async (data) => {
        try {
            console.log("Creating sprint with data:", data);
            const difficulty = calculateSprintDifficulty(
                data.maximum_possible_xp,
                data.taskCount || 0,
                data.daysAvailable || 7
            );
            console.log("Calculated difficulty:", difficulty);
            await db.createSprint({ ...data, difficulty_rating: difficulty });
            console.log("Sprint created in DB");
            await get().fetchActiveSprint();
            await get().fetchSprints();
        } catch (error) {
            console.error("Failed to create sprint:", error);
            throw error;
        }
    },

    completeSprint: async (sprintId, earnedXP, userRating) => {
        const sprint = get().sprints.find(s => s.id === sprintId) || get().activeSprint;
        if (!sprint) return userRating;

        const change = calculateRatingChange(
            userRating,
            sprint.difficulty_rating,
            earnedXP,
            sprint.minimum_target_xp
        );
        const newRating = Math.max(0, userRating + change);
        const isSuccess = earnedXP >= sprint.minimum_target_xp;

        await db.updateSprint(sprintId, {
            status: isSuccess ? "completed" : "failed",
            earned_xp: earnedXP,
            rating_before: userRating,
            rating_after: newRating,
            rating_change: change,
        });

        await insertRatingHistory(sprintId, userRating, newRating, change,
            `Sprint "${sprint.name}" ${isSuccess ? "completed" : "failed"}`
        );

        await onRatingChange(newRating);
        await get().fetchSprints();
        set({ activeSprint: null });

        return newRating;
    },

    updateEarnedXP: async (sprintId, xp) => {
        await db.updateSprint(sprintId, { earned_xp: xp });
        await get().fetchActiveSprint();
    },
}));