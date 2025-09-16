import { useEffect, useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Present from "./pages/Present";
import Past from "./pages/Past";
import Future from "./pages/Future";
import { load, save } from "./utils/storage";

const linkBase = "px-3 py-2 rounded-lg text-sm font-medium transition";
const linkClass = ({ isActive }) =>
  isActive ? `${linkBase} bg-gray-900 text-white` : `${linkBase} text-gray-700 hover:bg-gray-200`;

export default function App() {
  const [score, setScore] = useState(() => load("totalScore", { correct: 0, total: 0 }));

  function handleRoundScore(correct, total) {
    setScore(s => ({ correct: s.correct + correct, total: s.total + total }));
  }
  function resetScore() {
    setScore({ correct: 0, total: 0 });
  }

  useEffect(() => {
    save("totalScore", score);
  }, [score]);

  return (
    <main className="min-h-screen">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Spanish Tenses Practice</h1>
            <p className="text-xs text-gray-600">
              Total score: <span className="font-medium">{score.correct}</span> / {score.total}
              {score.total > 0 && (
                <span> ({Math.round((score.correct / score.total) * 100)}%)</span>
              )}
              <button
                onClick={resetScore}
                className="ml-3 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Reset
              </button>
            </p>
          </div>

          <nav className="flex gap-2">
            <NavLink to="/present" className={linkClass}>Presente</NavLink>
            <NavLink to="/past" className={linkClass}>Pretérito</NavLink>
            <NavLink to="/future" className={linkClass}>Futuro</NavLink>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<p className="text-sm text-gray-600">Choose a tense above to practice.</p>} />
          <Route path="/present" element={<Present onRoundScore={handleRoundScore} />} />
          <Route path="/past" element={<Past onRoundScore={handleRoundScore} />} />
          <Route path="/future" element={<Future onRoundScore={handleRoundScore} />} />
        </Routes>
      </div>
    </main>
  );
}
