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

      // Pointer is on the RIGHT side
      const pointerAngle = (360 - finalAngle + 90) % 360;
      const idx =
        Math.floor(pointerAngle / segmentAngle) % names.length;

      onResult(names[idx]);
      setIsSpinning(false);
    }, 4000);
  }, [isSpinning, names, rotation, onResult]);

  // ✅ Trigger spin when parent sets spinning=true
  useEffect(() => {
    if (spinning) {
      spinWheel();
    }
  }, [spinning, spinWheel]);

  // ✅ Render wheel segments
  const renderSegments = () => {
    if (names.length === 0) {
      return (
        <circle cx={center} cy={center} r={radius} fill="#eee" />
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

      return (
        <g key={i}>
          <path
            d={`M ${center} ${center}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z`}
            fill={COLORS[i % COLORS.length]}
          />

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
      {/* ✅ Pointer (flipped so it points LEFT) */}
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
            ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
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
