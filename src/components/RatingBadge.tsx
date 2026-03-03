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
        sm: { fontSize: '10px', padding: '4px 10px', borderRadius: '8px' },
        md: { fontSize: '12px', padding: '6px 14px', borderRadius: '10px' },
        lg: { fontSize: '14px', padding: '8px 20px', borderRadius: '12px' },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                    style={{
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        border: `1px solid ${rank.color}44`,
                        color: rank.color,
                        background: `${rank.color}11`,
                        ...sizes[size]
                    }}
                >
                    {rank.name}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                    {rating} LP
                </span>
            </div>

            {showProgress && (
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>Next Tier</span>
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#64748b' }}>{progress}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${progress}%`,
                                backgroundColor: rank.color,
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}