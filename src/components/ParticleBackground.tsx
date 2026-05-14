const COLORS = {
  green: "#6CFFB2",
  blue: "#6CA8FF",
  purple: "#B06CFF",
  cyan: "#6CFFF3",
  pink: "#FF6CB5",
} as const;

const POSITIONS: [number, number][] = [
  [10, 15],
  [20, 80],
  [35, 40],
  [70, 20],
  [80, 70],
  [55, 85],
  [85, 40],
  [40, 10],
];

const COLOR_KEYS = Object.keys(COLORS) as (keyof typeof COLORS)[];

function Particle({
  x,
  y,
  size,
  color,
  index,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  index: number;
}) {
  return (
    <div
      className="absolute animate-pulse"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        animationDelay: `${index * 0.5}s`,
        animationDuration: `${3 + (index % 3)}s`,
        willChange: "transform, opacity",
      }}
    >
      {/* Outer soft glow */}
      <div
        style={{
          inset: "10%",
          position: "absolute",
          borderRadius: "50%",
          background: color,
          opacity: 0.12,
        }}
      />
      {/* Core solid-ish particle */}
      <div
        style={{
          inset: "40%",
          position: "absolute",
          borderRadius: "50%",
          background: color,
          opacity: 0.9,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
      {/* Inner ring */}
      <div
        style={{
          inset: 0,
          position: "absolute",
          borderRadius: "50%",
          border: `2px solid ${color}`,
          opacity: 0.25,
        }}
      />
      {/* Outer faint ring */}
      <div
        style={{
          inset: -3,
          position: "absolute",
          borderRadius: "50%",
          border: `2px solid ${color}`,
          opacity: 0.08,
        }}
      />
    </div>
  );
}

export default function ParticleBackground() {
  return (
    /*
      absolute instead of fixed: root-wrap is position:relative and fills
      the full viewport, so inset-0 covers the same area. Fixed elements
      jitter on Android when the soft keyboard opens because the browser
      recalculates the viewport and re-composites fixed layers.
    */
    <div className="particle-bg absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
      {POSITIONS.map((pos, i) => {
        const size = i % 3 === 0 ? 42 : i % 3 === 1 ? 30 : 22;
        const color = COLORS[COLOR_KEYS[i % COLOR_KEYS.length]];
        return (
          <Particle
            key={i}
            x={pos[0]}
            y={pos[1]}
            size={size}
            color={color}
            index={i}
          />
        );
      })}
    </div>
  );
}
