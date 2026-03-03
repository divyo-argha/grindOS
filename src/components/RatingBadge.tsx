import { getRank, getRatingProgressToNext } from "../engines/ratingEngine";

interface Props {
    rating: number;
    showProgress?: boolean;
    size?: "sm" | "md" | "lg";
}

export function RatingBadge({ rating, showProgress = false, size = "md" }: Props) {
    const rank = getRank(rating);
    const progress = getRatingProgressToNext(rating);

    const sizes = {
        sm: "text-[10px] px-2 py-0.5 rounded-lg",
        md: "text-xs px-3 py-1 rounded-xl",
        lg: "text-sm px-4 py-1.5 rounded-2xl",
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 group">
                <span
                    className={`font-black uppercase tracking-widest border shadow-sm transition-all group-hover:shadow-lg ${sizes[size]}`}
                    style={{
                        color: rank.color,
                        borderColor: `${rank.color}33`,
                        background: `${rank.color}08`,
                        boxShadow: `0 0 10px ${rank.color}11`
                    }}
                >
                    {rank.name}
                </span>
                <span className="text-slate-500 font-mono font-bold text-xs group-hover:text-slate-300 transition-colors uppercase tracking-widest">
                    {rating} LP
                </span>
            </div>

            {showProgress && (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Next Tier</span>
                        <span className="text-[9px] font-black text-slate-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-px border border-white/5">
                        <div
                            className="h-full rounded-full transition-all duration-1000 relative"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: rank.color,
                                boxShadow: `0 0 10px ${rank.color}44`
                            }}
                        >
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}