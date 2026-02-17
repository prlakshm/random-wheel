import { useState, useCallback } from "react";
import SpinWheel from "@/components/SpinWheel";

const Index = () => {
  const [names, setNames] = useState<string[]>(["pranavi", "nayani", "Jake", "Nathan", "arjun"]);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const addName = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !names.includes(trimmed)) {
      setNames((prev) => [...prev, trimmed]);
      setInputValue("");
    }
  };

  const removeName = (name: string) => {
    setNames((prev) => prev.filter((n) => n !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addName();
  };

  const handleResult = useCallback((name: string) => {
    setResult(name);
    setShowResult(true);
    setSpinning(false);
  }, []);

  const handleSpin = () => {
    if (names.length < 2) return;
    setShowResult(false);
    setResult(null);
    setSpinning(true);
    // The wheel component handles the spin internally via its own spin function
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary md:text-5xl">
          🎡 Spin the Wheel! 🎉
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add names and let fate decide
        </p>
      </header>

      {/* Wheel */}
      <div className="mb-6">
        <SpinWheelWrapper names={names} onResult={handleResult} spinning={spinning} />
      </div>

      {/* Result */}
      {showResult && result && (
        <div className="mb-4 animate-bounce rounded-lg bg-primary px-6 py-3 text-xl font-bold text-primary-foreground shadow-lg">
          🎉 {result} wins! 🎉
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={names.length < 2 || spinning}
        className="mb-8 rounded-full px-10 py-4 text-xl font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        style={{ background: "var(--gradient-spin)" }}
      >
        🎯 SPIN THE WHEEL! 🎯
      </button>

      {/* Input */}
      <div className="flex w-full max-w-md gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a name... ✨"
          className="flex-1 rounded-lg border border-border bg-popover px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={addName}
          className="rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition-all hover:scale-105 active:scale-95"
        >
          + Add
        </button>
      </div>

      {/* Name List */}
      {names.length > 0 && (
        <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
          {names.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
            >
              {name}
              <button
                onClick={() => removeName(name)}
                className="ml-1 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

import { useRef } from "react";

// Inline wheel with spin trigger
const SpinWheelWrapper = ({ names, onResult, spinning }: { names: string[]; onResult: (name: string) => void; spinning: boolean }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const hasTriggered = useRef(false);

  // Trigger spin when `spinning` goes from false to true
  if (spinning && !isSpinning && !hasTriggered.current) {
    hasTriggered.current = true;
    const extraSpins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 360;
    const totalRotation = rotation + extraSpins * 360 + randomAngle;

    // Use setTimeout to defer state update
    setTimeout(() => {
      setRotation(totalRotation);
      setIsSpinning(true);

      setTimeout(() => {
        const finalAngle = totalRotation % 360;
        const segmentAngle = 360 / names.length;
        const pointerAngle = (360 - finalAngle + 90) % 360;
        const idx = Math.floor(((pointerAngle + 360) % 360) / segmentAngle) % names.length;
        onResult(names[idx]);
        setIsSpinning(false);
        hasTriggered.current = false;
      }, 4000);
    }, 0);
  }

  if (!spinning && !isSpinning) {
    hasTriggered.current = false;
  }

  const COLORS = [
    "hsl(45, 90%, 65%)",
    "hsl(210, 70%, 65%)",
    "hsl(330, 70%, 70%)",
    "hsl(170, 60%, 65%)",
    "hsl(280, 50%, 65%)",
    "hsl(20, 80%, 65%)",
  ];

  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 10;

  const renderSegments = () => {
    if (names.length === 0) return null;
    if (names.length === 1) {
      return <circle cx={center} cy={center} r={radius} fill={COLORS[0]} />;
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
      const midAngle = ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180);
      const textRadius = radius * 0.65;
      const tx = center + textRadius * Math.cos(midAngle);
      const ty = center + textRadius * Math.sin(midAngle);
      const textAngle = (i + 0.5) * segmentAngle;

      return (
        <g key={i}>
          <path
            d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
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
            style={{ fontFamily: "Fredoka, sans-serif", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
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
        style={{ right: "calc(50% - 170px)", top: "50%", transform: "translateY(-50%)" }}
      >
        <svg width="28" height="32" viewBox="0 0 28 32">
          <polygon points="0,0 28,16 0,32" fill="hsl(20, 80%, 65%)" />
        </svg>
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
        }}
      >
        {renderSegments()}
        <circle cx={center} cy={center} r={18} fill="white" />
        <circle cx={center} cy={center} r={12} fill="hsl(270, 30%, 92%)" />
      </svg>
    </div>
  );
};

export default Index;
