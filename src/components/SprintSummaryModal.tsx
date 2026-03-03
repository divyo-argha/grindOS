import { Trophy, TrendingUp, Zap, Star, ChevronRight, Award } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { useSprintStore } from "../store/sprintStore";
import { useUserStore } from "../store/userStore";
import { getRank } from "../engines/ratingEngine";
import { getSprintSummaryMessage } from "../engines/sprintEngine";

export function SprintSummaryModal() {
    const { sprintSummaryOpen, setSprintSummaryOpen } = useUIStore();
    const { activeSprint, sprints } = useSprintStore();
    const { user } = useUserStore();

    if (!sprintSummaryOpen) return null;

    // Use the most recent completed sprint if active is null
    const summarySprint = activeSprint || sprints[0];
    if (!summarySprint) return null;

    const rank = user ? getRank(user.rating) : null;
    const isSuccess = (summarySprint.rating_change || 0) >= 0;
    const messageData = getSprintSummaryMessage(
        summarySprint.earned_xp || 0,
        summarySprint.minimum_target_xp || 100
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in"
                onClick={() => setSprintSummaryOpen(false)}
            />

            <div className="relative w-full max-w-lg glass-morphism rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-bounce-in">
                <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-indigo-600/20 to-transparent" />

                <div className="p-10 relative z-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl animate-float">
                                <Trophy size={48} className={isSuccess ? "text-yellow-400" : "text-slate-500"} />
                            </div>
                            {isSuccess && (
                                <div className="absolute -top-3 -right-3 animate-pulse">
                                    <Star size={32} className="text-yellow-400 fill-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">Mission Debrief</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">System Evaluation Complete</p>

                    <div className="glass-card rounded-[2rem] p-8 border border-white/5 mb-8 relative overflow-hidden group">
                        <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity flex items-center justify-center grayscale ${isSuccess ? "text-indigo-500" : "text-red-500"}`}>
                            <Zap size={150} />
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm font-bold text-slate-200 leading-relaxed mb-8 italic">
                                "{messageData.subtitle}"
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">XP Earned</div>
                                    <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
                                        <Zap size={16} className="text-yellow-400" />
                                        {summarySprint.earned_xp}
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">LP Δ</div>
                                    <div className={`text-2xl font-black flex items-center justify-center gap-2 ${isSuccess ? "text-green-400" : "text-red-400"}`}>
                                        <TrendingUp size={16} />
                                        {isSuccess ? `+${summarySprint.rating_change}` : summarySprint.rating_change}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {rank && (
                        <div className="flex flex-col items-center mb-10">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">New Standing</span>
                            <div className="group relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur group-hover:opacity-40 transition-opacity" />
                                <div className="px-6 py-3 glass-card rounded-2xl border border-white/10 flex items-center gap-3 relative">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: rank.color }}>
                                        <Award size={18} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-black text-white leading-none mb-1 uppercase tracking-tight">{rank.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{user?.rating} LP ELITE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setSprintSummaryOpen(false)}
                        className="w-full bg-white text-slate-950 py-5 rounded-[1.5rem] font-black text-xs shadow-2xl hover:bg-slate-100 transition-all active:scale-[0.98] group"
                    >
                        <div className="flex items-center justify-center gap-2">
                            ACKNOWLEDGE & PROCEED
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <p className="mt-6 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Protocol V2.1.0 // grindOS</p>
                </div>
            </div>
        </div>
    );
}
