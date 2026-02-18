import { useState } from "react";
import SpinWheel from "@/components/SpinWheel";

const Index = () => {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [spinning, setSpinning] = useState(false);

  // ✅ Pairing system
  const [firstPick, setFirstPick] = useState<string | null>(null);

  // 🚫 Forbidden pairs
  const forbiddenPairs = [
    ["pranavi", "tommy"],
    ["emily", "tommy"],
    ["emily", "jake"],
    ["pranavi", "emily"],
    ["emily", "evelyn"],
    ["evelyn", "emily"],
    ["jake", "nathan"],
    ["nathan", "arjun"],
    ["arjun", "jake"],
    ["kris", "tommy"],
    ["tommy", "evelyn"],
    ["arissa", "julia"]
  ];


  // ✅ Get forbidden match for a person
  const getForbiddenMatch = (person: string) => {
    const pair = forbiddenPairs.find(
      ([a, b]) => a === person || b === person
    );

    if (!pair) return null;

    return pair[0] === person ? pair[1] : pair[0];
  };

  // ✨ Fancy button
  const fancyButton =
    "inline-flex items-center rounded-md font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 tracking-wide";

  // ✅ Add name
  const addName = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed || names.includes(trimmed)) return;

    setNames((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  // ✅ Remove manually
  const removeName = (name: string) => {
    setNames((prev) => prev.filter((n) => n !== name));
  };

  // ✅ Spin click
  const handleSpin = () => {
    if (names.length < 2) return;

    setShowResult(false);
    setResult(null);

    setSpinning(true);
  };

  // ✅ Handle wheel result
const handleResult = (winner: string) => {
  setSpinning(false);

  // -------------------
  // FIRST PICK
  // -------------------
  if (!firstPick) {
    setFirstPick(winner);

    // Remove first winner from pool
    setNames((prev) => prev.filter((n) => n !== winner));

    // ✅ AUTO-SPIN AGAIN after a short delay
    setTimeout(() => {
      setSpinning(true);
    }, 700);

    return;
  }

  // -------------------
  // SECOND PICK
  // -------------------
  setResult(`${firstPick} + ${winner}`);
  setShowResult(true);

  // Remove second winner too
  setNames((prev) => prev.filter((n) => n !== winner));

  // Reset pairing
  setFirstPick(null);
};


  // ✅ Filter names BEFORE spinning (auto-avoid forbidden)
  const filteredNames =
    firstPick === null
      ? names
      : names.filter(
          (n) => n !== getForbiddenMatch(firstPick)
        );

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-5xl font-extrabold text-primary">
          Spin the Wheel!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          And let fate decide...
        </p>

  
      </header>

      {/* Wheel + Overlay */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Wheel fades when overlay shows */}
        <div
          className={`transition-opacity duration-500 ${
            showResult ? "opacity-30" : "opacity-100"
          }`}
        >
          <SpinWheel
            names={filteredNames}
            spinning={spinning}
            onResult={handleResult}
          />
        </div>

        {/* Winner Overlay */}
        {showResult && result && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="
                animate-bounce
                rounded-2xl
                bg-primary
                px-10
                py-6
                text-3xl
                font-bold
                text-white
                shadow-2xl
                backdrop-blur-md
                text-center
                whitespace-nowrap
              "
            >
              🎉 {result}! 🎉
            </div>
          </div>
        )}
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={filteredNames.length < 2 || spinning || firstPick !== null}
        className={`${fancyButton} mb-6 px-10 py-4 text-xl`}
        style={{ background: "var(--gradient-spin)" }}
      >
        🎯 SPIN THE WHEEL 🎯
      </button>

      {/* Input Row */}
      <div className="flex w-full max-w-md gap-3">
        <input
          type="text"
          value={inputValue}
          placeholder="Type a name... ✨"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addName()}
          className="flex-1 rounded-lg border border-border bg-popover px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          onClick={addName}
          disabled={!inputValue.trim()}
          className={`${fancyButton} px-6 py-3`}
          style={{ background: "var(--gradient-spin)" }}
        >
          + Add
        </button>
      </div>

      {/* Name Pills */}
      {names.length > 0 && (
        <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
          {names.map((name) => (
            <span
              key={name}
              className="flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 px-4 py-1 text-sm font-medium shadow-sm transition-all hover:scale-105 capitalize"
            >
              {name}
              <button
                onClick={() => removeName(name)}
                className="text-muted-foreground hover:text-destructive"
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

export default Index;
