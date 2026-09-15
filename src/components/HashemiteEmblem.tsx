interface Props { size?: number; color?: string; }

export default function HashemiteEmblem({ size = 28, color = '#A88631' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M 20 4 L 22 10 L 28 8 L 26 14 L 32 16 L 26 18 L 28 24 L 22 22 L 20 28 L 18 22 L 12 24 L 14 18 L 8 16 L 14 14 L 12 8 L 18 10 Z"
        fill={color}
      />
      <circle cx="20" cy="16" r="3" fill="#FFFFFF" stroke={color} strokeWidth="1" />
      <path
        d="M 14 28 Q 20 32 26 28"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 12 32 Q 20 36 28 32"
        stroke={color}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
