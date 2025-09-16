// src/pages/Future.jsx
import { useMemo, useRef, useState } from "react";
import AccentPad from "../components/AccentPad";

/* ---------- Tabs (categories) ---------- */
const MODES = [
  { key: "simple", label: "Simple" },
  { key: "ir-a", label: "Ir a + infinitivo" },
  { key: "condicional", label: "Condicional" },
  { key: "compuesto", label: "Futuro compuesto" },
];

/* ---------- Futuro simple data ---------- */
const FUTURO_SIMPLE_VERBS = [
  { infinitive: "hablar" },
  { infinitive: "comer" },
  { infinitive: "vivir" },
  { infinitive: "mirar" },
  { infinitive: "aprender" },
  // irregular stems
  { infinitive: "decir", irregular: { futureBase: "dir" } },
  { infinitive: "hacer", irregular: { futureBase: "har" } },
  { infinitive: "tener", irregular: { futureBase: "tendr" } },
  { infinitive: "poner", irregular: { futureBase: "pondr" } },
  { infinitive: "poder", irregular: { futureBase: "podr" } },
  { infinitive: "venir", irregular: { futureBase: "vendr" } },
  { infinitive: "salir", irregular: { futureBase: "saldr" } },
  { infinitive: "querer", irregular: { futureBase: "querr" } },
  { infinitive: "saber", irregular: { futureBase: "sabr" } },
  { infinitive: "caber", irregular: { futureBase: "cabr" } },
  { infinitive: "haber", irregular: { futureBase: "habr" } },
  { infinitive: "valer", irregular: { futureBase: "valdr" } },
];

function conjugateFutureSimple(verb) {
  const persons = ["yo", "tú", "él", "nos", "vos", "ellos"];
  const base = verb.irregular?.futureBase ?? verb.infinitive;
  const ends = ["é", "ás", "á", "emos", "éis", "án"];
  const out = {};
  persons.forEach((p, i) => (out[p] = base + ends[i]));
  return out;
}

/* ---------- Ir a + infinitivo data ---------- */
const IR_A_VERBS = [
  "estudiar",
  "comer",
  "viajar",
  "hacer",
  "ver",
  "leer",
  "escribir",
  "trabajar",
  "jugar",
  "vivir",
].map((inf) => ({ infinitive: inf }));

function conjugateIrA(verb) {
  // present of "ir" + a + infinitive
  const persons = ["yo", "tú", "él", "nos", "vos", "ellos"];
  const ir = ["voy", "vas", "va", "vamos", "vais", "van"];
  const out = {};
  persons.forEach((p, i) => (out[p] = `${ir[i]} a ${verb.infinitive}`));
  return out;
}

/* ---------- Shared ---------- */
const PERSONS = [
  { key: "yo", label: "yo" },
  { key: "tú", label: "tú" },
  { key: "él", label: "él/ella/usted" },
  { key: "nos", label: "nosotros" },
  { key: "vos", label: "vosotros" },
  { key: "ellos", label: "ellos/ellas/ustedes" },
];

const rndNext = (max, avoid) =>
  max <= 1 ? 0 : ((avoid + 1 + Math.floor(Math.random() * (max - 1))) % max);

export default function Future({ onRoundScore }) {
  const [mode, setMode] = useState("simple");
  const [filter, setFilter] = useState("all"); // simple-only: all | regular | irregular

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [showAccents, setShowAccents] = useState(false);
  const [focusedKey, setFocusedKey] = useState(null);
  const inputRefs = useRef(Object.fromEntries(PERSONS.map((p) => [p.key, null])));

  function resetRoundState() {
    setAnswers({});
    setChecked(false);
    setLastScore(null);
    setIdx(0);
  }

  /* ----- pools & current item per mode ----- */
  const simplePool = useMemo(() => {
    if (filter === "regular")
      return FUTURO_SIMPLE_VERBS.filter((v) => !v.irregular);
    if (filter === "irregular")
      return FUTURO_SIMPLE_VERBS.filter((v) => v.irregular);
    return FUTURO_SIMPLE_VERBS;
  }, [filter]);

  const irAPool = IR_A_VERBS;

  const item = useMemo(() => {
    if (mode === "simple") {
      const v = simplePool[idx % simplePool.length];
      return v ? { verb: v.infinitive, forms: conjugateFutureSimple(v) } : null;
    }
    if (mode === "ir-a") {
      const v = irAPool[idx % irAPool.length];
      return v ? { verb: v.infinitive, forms: conjugateIrA(v) } : null;
    }
    return null;
  }, [mode, idx, simplePool, irAPool]);

  /* ----- actions ----- */
  function setAnswer(k, v) {
    setAnswers((a) => ({ ...a, [k]: v }));
  }

  function check() {
    if (!item) return;
    const correct = PERSONS.filter(
      (p) =>
        (answers[p.key] ?? "").toLowerCase() ===
        item.forms[p.key].toLowerCase()
    ).length;
    setLastScore(`${correct}/${PERSONS.length}`);
    setChecked(true);
    onRoundScore?.(correct, PERSONS.length);
  }

  function next() {
    setAnswers({});
    setChecked(false);
    setLastScore(null);
    const len = mode === "simple" ? simplePool.length : irAPool.length;
    setIdx((i) => rndNext(len, i));
  }

  function insertChar(ch) {
    const key = focusedKey;
    if (!key) return;
    const el = inputRefs.current[key];
    const curr = answers[key] ?? "";
    if (el && typeof el.selectionStart === "number") {
      const s = el.selectionStart,
        e = el.selectionEnd ?? s;
      const newVal = curr.slice(0, s) + ch + curr.slice(e);
      setAnswers((a) => ({ ...a, [key]: newVal }));
      requestAnimationFrame(() => {
        if (inputRefs.current[key]) {
          inputRefs.current[key].focus();
          inputRefs.current[key].setSelectionRange(s + ch.length, s + ch.length);
        }
      });
    } else {
      setAnswers((a) => ({ ...a, [key]: (a[key] ?? "") + ch }));
    }
  }

  /* ---------- UI ---------- */
  return (
    <section className="max-w-3xl">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMode(m.key);
              resetRoundState();
            }}
            className={
              "px-3 py-2 rounded-lg text-sm font-medium border " +
              (mode === m.key
                ? "bg-gray-900 text-white"
                : "bg-white hover:bg-gray-100 text-gray-800")
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* SIMPLE */}
      {mode === "simple" && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Futuro — Simple</h2>
              {item && (
                <p className="mt-1 text-gray-700">
                  Verb: <span className="font-medium">{item.verb}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Rule: <code>infinitive</code> + <code>é, ás, á, emos, éis, án</code>.
                Irregulars use special stems (<em>tendr-, dir-, sabr-, …</em>).
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  resetRoundState();
                }}
                className="h-9 px-3 rounded-lg border bg-white text-sm"
                title="Choose verb set"
              >
                <option value="all">All verbs</option>
                <option value="regular">Regular only</option>
                <option value="irregular">Irregular only</option>
              </select>

              <button
                onClick={() => setShowAccents((s) => !s)}
                className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-100 text-sm whitespace-nowrap"
              >
                {showAccents ? "Hide accents" : "Show accents"}
              </button>
            </div>
          </div>

          {showAccents && <AccentPad onInsert={insertChar} />}

          <DrillGrid
            item={item}
            answers={answers}
            setAnswer={setAnswer}
            checked={checked}
            inputRefs={inputRefs}
            setFocusedKey={setFocusedKey}
          />

          <FooterButtons
            checked={checked}
            check={check}
            next={next}
            lastScore={lastScore}
          />
        </>
      )}

      {/* IR A + INFINITIVO */}
      {mode === "ir-a" && (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Ir a + infinitivo</h2>
              {item && (
                <p className="mt-1 text-gray-700">
                  Verb: <span className="font-medium">{item.verb}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Pattern: <em>voy/vas/va/vamos/vais/van</em> + <code>a</code> + infinitive
                (e.g., <em>voy a estudiar</em>).
              </p>
            </div>

            <button
              onClick={() => setShowAccents((s) => !s)}
              className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-100 text-sm whitespace-nowrap"
            >
              {showAccents ? "Hide accents" : "Show accents"}
            </button>
          </div>

          {showAccents && <AccentPad onInsert={insertChar} />}

          <DrillGrid
            item={item}
            answers={answers}
            setAnswer={setAnswer}
            checked={checked}
            inputRefs={inputRefs}
            setFocusedKey={setFocusedKey}
          />

          <FooterButtons
            checked={checked}
            check={check}
            next={next}
            lastScore={lastScore}
          />
        </>
      )}

      {/* Placeholders for the other tabs */}
      {mode === "condicional" && (
        <ComingSoon
          title="Condicional simple"
          text="Infinitive + ía, ías, ía, íamos, íais, ían; irregular stems like tendr-, dir-, har-, querr-, podr-…"
        />
      )}
      {mode === "compuesto" && (
        <ComingSoon
          title="Futuro compuesto"
          text="Futuro de ‘haber’ + participio (e.g., habré terminado)."
        />
      )}
    </section>
  );
}

/* ---------- Small presentational helpers ---------- */
function DrillGrid({ item, answers, setAnswer, checked, inputRefs, setFocusedKey }) {
  return (
    <div className="mt-4 grid gap-3">
      {PERSONS.map((p) => {
        const val = answers[p.key] ?? "";
        const correct = item?.forms[p.key] ?? "";
        const isRight = val.toLowerCase() === correct.toLowerCase();
        return (
          <label
            key={p.key}
            className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm"
          >
            <span className="w-40">{p.label}</span>
            <input
              ref={(el) => (inputRefs.current[p.key] = el)}
              value={val}
              onChange={(e) => setAnswer(p.key, e.target.value)}
              onFocus={() => setFocusedKey(p.key)}
              disabled={checked}
              placeholder="type the form"
              className="flex-1 border rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
            />
            {checked && (
              <span
                className={`w-32 text-sm ${
                  isRight ? "text-green-600" : "text-red-600"
                }`}
              >
                {isRight ? "✓ correct" : `✗ ${correct}`}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function FooterButtons({ checked, check, next, lastScore }) {
  return (
    <div className="flex items-center gap-3 mt-6">
      {!checked ? (
        <button
          onClick={check}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Check
        </button>
      ) : (
        <button
          onClick={next}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition"
        >
          Next verb
        </button>
      )}
      {lastScore && <span className="text-sm text-gray-700">Score: {lastScore}</span>}
    </div>
  );
}

function ComingSoon({ title, text }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-700">{text}</p>
    </div>
  );
}
