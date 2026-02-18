import { useState, useEffect, useCallback } from "react";

const COLORS = [
  "hsl(45, 90%, 65%)",
  "hsl(210, 70%, 65%)",
  "hsl(330, 70%, 70%)",
  "hsl(170, 60%, 65%)",
  "hsl(280, 50%, 65%)",
  "hsl(20, 80%, 65%)",
];

interface SpinWheelProps {
  names: string[];
  spinning: boolean;
  onResult: (name: string) => void;
}

const SpinWheel = ({ names, spinning, onResult }: SpinWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // ⭐ New: animate removal
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 10;

  // ✅ Spin logic
  const spinWheel = useCallback(() => {
    if (isSpinning || names.length < 2) return;

    setIsSpinning(true);

    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    setRotation(totalRotation);

setTimeout(() => {
  const finalAngle = totalRotation % 360;
  const segmentAngle = 360 / names.length;

  const pointerAngle = (360 - finalAngle + 90) % 360;
  const idx = Math.floor(pointerAngle / segmentAngle) % names.length;

  const winner = names[idx];

  // ✅ Start fade-out slightly early
  setTimeout(() => {
    setRemovingIndex(idx);
  }, 300); // starts ~0.3s before stop

  // ✅ Fully finish after fade
  setTimeout(() => {
    onResult(winner);
    setRemovingIndex(null);
    setIsSpinning(false);
  }, 900);

}, 4000);

  }, [isSpinning, names, rotation, onResult]);

  // ✅ Trigger spin when parent sets spinning=true
  useEffect(() => {
    if (spinning && !isSpinning) {
      spinWheel();
    }
  }, [spinning, isSpinning, spinWheel]);


  // ✅ Render wheel segments
  const renderSegments = () => {
    if (names.length === 0) {
      return (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#eee"
        />
      );
    }

    // ✅ Special case: 1 name
    if (names.length === 1) {
      const tx = center + radius * 0.5;
      const ty = center;

      return (
        <>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={COLORS[0]}
            stroke="white"
            strokeWidth={4}
          />

          <text
            x={tx}
            y={ty}
            fill="white"
            fontSize={16}
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontFamily: "Fredoka, sans-serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          >
            {names[0].length > 12
              ? names[0].slice(0, 11) + "…"
              : names[0]}
          </text>
        </>
      );
    }

    const segmentAngle = 360 / names.length;

    return names.map((name, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);

      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const largeArc = segmentAngle > 180 ? 1 : 0;

      const midAngle =
        ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180);

      const textRadius = radius * 0.65;
      const tx = center + textRadius * Math.cos(midAngle);
      const ty = center + textRadius * Math.sin(midAngle);

      const textAngle = (i + 0.5) * segmentAngle;

      const isRemoving = removingIndex === i;

      return (
        <g
          key={i}
          style={{
            transition: "opacity 0.6s ease-in",
            opacity: isRemoving ? 0 : 1,
          }}
        >

          {/* Segment */}
          <path
            d={`M ${center} ${center}
              L ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
              Z`}
            fill={COLORS[i % COLORS.length]}
            stroke="white"
            strokeWidth={4}
            style={{
              transition: "transform 0.6s ease-in",
              transform: isRemoving ? "scale(0)" : "scale(1)",
              transformOrigin: `${center}px ${center}px`,
            }}
          />

          {/* Text */}
          <text
            x={tx}
            y={ty}
            fill="white"
            fontSize={names.length > 8 ? 11 : 14}
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${textAngle}, ${tx}, ${ty})`}
            style={{
              fontFamily: "Fredoka, sans-serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              pointerEvents: "none",
              transition: "opacity 0.6s ease-in",
              opacity: isRemoving ? 0 : 1,
            }}
          >
            {name.length > 10 ? name.slice(0, 9) + "…" : name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer */}
      <div
        className="absolute z-10"
        style={{
          right: "calc(50% - 170px)",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <svg
          width="28"
          height="32"
          viewBox="0 0 28 32"
          style={{ transform: "scaleX(-1)" }}
        >
          <polygon
            points="0,0 28,16 0,32"
            fill="hsl(20, 80%, 65%)"
          />
        </svg>
      </div>

      {/* Wheel */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none",
        }}
      >
        {renderSegments()}

        {/* Center */}
        <circle cx={center} cy={center} r={18} fill="white" />
        <circle
          cx={center}
          cy={center}
          r={12}
          fill="hsl(270, 30%, 92%)"
        />
      </svg>
    </div>
  );
};

export default SpinWheel;
