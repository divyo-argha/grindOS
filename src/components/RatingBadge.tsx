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
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span
                    className={`font-bold rounded ${sizes[size]} border`}
                    style={{ color: rank.color, borderColor: rank.color + "44", background: rank.color + "11" }}
                >
                    {rank.name}
                </span>
                <span className="text-slate-400 font-mono text-sm">{rating}</span>
            </div>
            {showProgress && (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%`, background: rank.color }}
                        />
                    </div>
                    <span className="text-xs text-slate-500">{progress}%</span>
                </div>
            )}
        </div>
    );
}