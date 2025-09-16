// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Present from "./pages/Present";
import Past from "./pages/Past";
import Future from "./pages/Future";

export default function App() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1 className="text-4xl font-bold text-orange-800">Spanish Tenses Practice</h1>

      <p>Choose a tense to practice:</p>

      <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Link to="/present">Presente</Link>
        <Link to="/past">Pretérito</Link>
        <Link to="/future">Futuro</Link>
      </nav>

      <Routes>
        <Route path="/" element={<p>Select a tense above to practice.</p>} />
        <Route path="/present" element={<Present />} />
        <Route path="/past" element={<Past />} />
        <Route path="/future" element={<Future />} />
      </Routes>
    </main>
  );
}
