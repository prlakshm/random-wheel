import { useState, useEffect, useRef } from "react";
import SpinWheel from "@/components/SpinWheel";

const Index = () => {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [firstPick, setFirstPick] = useState<string | null>(null);
  const [wheelNames, setWheelNames] = useState<string[]>([]);
  const [targetName, setTargetName] = useState<string | null>(null);
  const [pairQueue, setPairQueue] = useState<[string, string][]>([]);

  // 🎯 Track if we're in final-2 mode
  const isFinalTwo = useRef(false);

  const forbiddenGroups = [
    ["jake", "nathan", "arjun"],
    ["pranavi", "emily", "evelyn", "tommy", "nayani"],
    ["tommy", "kris", "sid", "edward"],
    ["arissa", "julia", "anel", "abby"],
    ["emily", "jake"],
    ["anand", "george"],
    ["ananya", "george"],
    ["ananya", "pooja"],
    ["george", "carmen"],
  ];

  const normalizedGroups = forbiddenGroups.map((group) =>
    group.map((name) => name.trim().toLowerCase())
  );

  const isForbidden = (a: string, b: string) => {
    const A = a.trim().toLowerCase();
    const B = b.trim().toLowerCase();
    return normalizedGroups.some((group) => group.includes(A) && group.includes(B));
  };

const computePairs = (list: string[]) => {
  let pairs: [string, string][] = [];

  // 💍 Always lock Jake + Pranavi together
  const hasJake = list.includes("jake");
  const hasPranavi = list.includes("pranavi");

  // Create a working list without them
  let filteredList = [...list];

  if (hasJake && hasPranavi) {
    pairs.push(["jake", "pranavi"]);

    // Remove them so they NEVER pair with anyone else
    filteredList = filteredList.filter(
      (n) => n !== "jake" && n !== "pranavi"
    );
  }

  // Build all other valid pairs normally
  for (let i = 0; i < filteredList.length; i++) {
    for (let j = i + 1; j < filteredList.length; j++) {
      const a = filteredList[i];
      const b = filteredList[j];

      if (!isForbidden(a, b)) {
        pairs.push([a, b]);
      }
    }
  }

  // 🎲 Shuffle everything EXCEPT the locked couple stays included
  const shuffled = pairs.sort(() => Math.random() - 0.5);

  console.log(
    "📋 Pair queue:",
    shuffled.map(([a, b]) => `${a} + ${b}`).join(", ")
  );

  return shuffled;
};



  useEffect(() => {
    setPairQueue(computePairs(names));
    setWheelNames(names);
  }, [names]);

  const fancyButton =
    "inline-flex items-center rounded-md font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 tracking-wide";

  const addName = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed || names.includes(trimmed)) return;
    setNames((prev) => [...prev, trimmed]);
    setInputValue("");
  };

  const removeName = (name: string) => {
    setNames((prev) => prev.filter((n) => n !== name));
  };

  const handleSpin = () => {
    if (wheelNames.length < 2) return;

    setShowResult(false);
    setResult(null);

    // 🎯 Final 2: single spin reveals the pair as a banner
    if (names.length === 2) {
      isFinalTwo.current = true;
      const [a] = names;
      console.log("🏁 Final pair:", names[0], "+", names[1]);
      setTargetName(a);
      setSpinning(true);
      return;
    }

    if (pairQueue.length === 0) return;

    isFinalTwo.current = false;
    const [a, b] = pairQueue[0];
    console.log("🎯 Preset pair:", a, "+", b);
    setTargetName(a);
    setSpinning(true);
  };

  const handleResult = (winner: string) => {
    setSpinning(false);

    // -------------------
    // FINAL TWO MODE
    // -------------------
    if (isFinalTwo.current) {
      const other = names.find((n) => n !== winner)!;
      setResult(`${winner} + ${other}`);
      setTimeout(() => setShowResult(true), 0);
      setNames([]);
      isFinalTwo.current = false;
      return;
    }

    // -------------------
    // FIRST PICK
    // -------------------
// -------------------
// FIRST PICK (locked to queue)
// -------------------
if (!firstPick) {
  const [expectedFirst, expectedSecond] = pairQueue[0];

  // ✅ Only accept the correct queued winner
  if (winner !== expectedFirst) {
    console.warn("⚠️ Ignored unexpected winner:", winner);
    return;
  }

  setFirstPick(winner);

  // Remove first pick from wheel
  setWheelNames((prev) => prev.filter((n) => n !== winner));

  // Spin again for the second person in the preset pair
  setTimeout(() => {
    setTargetName(expectedSecond);
    setSpinning(true);
  }, 700);

  return;
    }

    // -------------------
    // SECOND PICK
    // -------------------
    const secondPick = winner;
    setResult(`${firstPick} + ${secondPick}`);

    setTimeout(() => setShowResult(true), 400);

    setNames((prev) => prev.filter((n) => n !== firstPick && n !== secondPick));
    setPairQueue((prev) => prev.slice(1));
    setFirstPick(null);
    setTargetName(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="text-5xl font-extrabold text-primary">Spin the Wheel!</h1>
        <p className="mt-2 text-lg text-muted-foreground">And let fate decide...</p>
      </header>

      <div className="relative mb-6 flex items-center justify-center">
        <div className={`transition-opacity duration-500 ${showResult ? "opacity-30" : "opacity-100"}`}>
          <SpinWheel
            names={wheelNames}
            spinning={spinning}
            onResult={handleResult}
            targetName={targetName}
          />
        </div>

        {showResult && result && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce rounded-2xl bg-primary px-10 py-6 text-3xl font-bold text-white shadow-2xl backdrop-blur-md text-center whitespace-nowrap">
              🎉 {result}! 🎉
            </div>
          </div>
        )}
      </div>

      {/* Spin Button — disabled when 0 or 1 remain, or already spinning */}
      <button
        onClick={handleSpin}
        disabled={names.length < 2 || spinning}
        className={`${fancyButton} mb-6 px-10 py-4 text-xl`}
        style={{ background: "var(--gradient-spin)" }}
      >
        🎯 SPIN THE WHEEL 🎯
      </button>

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

      {names.length > 0 && (
        <div className="mt-6 flex max-w-md flex-wrap justify-center gap-2">
          {names.map((name) => (
            <span
              key={name}
              className="flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 px-4 py-1 text-sm font-medium shadow-sm transition-all hover:scale-105 capitalize"
            >
              {name}
              <button onClick={() => removeName(name)} className="text-muted-foreground hover:text-destructive">
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