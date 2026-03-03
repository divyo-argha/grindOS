import { create } from "zustand";
import * as db from "../lib/db";
import { getRank } from "../engines/ratingEngine";

interface User {
    id: number;
    name: string;
    rating: number;
    best_rating: number;
    current_streak: number;
    longest_streak: number;
    total_xp: number;
}

interface UserStore {
    user: User | null;
    rank: any;
    loading: boolean;
    fetchUser: () => Promise<void>;
    updateRating: (newRating: number) => Promise<void>;
    updateName: (name: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    rank: null,
    loading: false,

    fetchUser: async () => {
        set({ loading: true });
        const user = await db.getUser();
        set({ user, rank: getRank(user?.rating ?? 1000), loading: false });
    },

    updateRating: async (newRating) => {
        const user = get().user;
        if (!user) return;
        const bestRating = Math.max(newRating, user.best_rating);
        await db.updateUser({ rating: newRating, best_rating: bestRating });
        await get().fetchUser();
    },

    updateName: async (name) => {
        await db.updateUser({ name });
        await get().fetchUser();
    },
}));