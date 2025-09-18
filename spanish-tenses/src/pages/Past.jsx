// src/pages/Past.jsx
import { useMemo, useRef, useState } from "react";
import AccentPad from "../components/AccentPad";

/* ---------- Tabs ---------- */
const MODES = [
  { key: "indefinido", label: "Pretérito indefinido" },
  { key: "imperfecto", label: "Pretérito imperfecto" },
];

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

/* ---------- Indefinido (simple past) ---------- */
// Regular samples + several irregulars (full forms)
const INDEFINIDO_VERBS = [
  // regular examples
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
  { infinitive: "mirar",  type: "ar" },
  { infinitive: "aprender", type: "er" },

  // irregulars (full conjugations)
  { infinitive: "ir", irregular: {
      preterite: { yo:"fui", tú:"fuiste", él:"fue", nos:"fuimos", vos:"fuisteis", ellos:"fueron" }
    }
  },
  { infinitive: "ser", irregular: {
      preterite: { yo:"fui", tú:"fuiste", él:"fue", nos:"fuimos", vos:"fuisteis", ellos:"fueron" }
    }
  },
  { infinitive: "tener", irregular: {
      preterite: { yo:"tuve", tú:"tuviste", él:"tuvo", nos:"tuvimos", vos:"tuvisteis", ellos:"tuvieron" }
    }
  },
  { infinitive: "estar", irregular: {
      preterite: { yo:"estuve", tú:"estuviste", él:"estuvo", nos:"estuvimos", vos:"estuvisteis", ellos:"estuvieron" }
    }
  },
  { infinitive: "poder", irregular: {
      preterite: { yo:"pude", tú:"pudiste", él:"pudo", nos:"pudimos", vos:"pudisteis", ellos:"pudieron" }
    }
  },
  { infinitive: "poner", irregular: {
      preterite: { yo:"puse", tú:"pusiste", él:"puso", nos:"pusimos", vos:"pusisteis", ellos:"pusieron" }
    }
  },
  { infinitive: "venir", irregular: {
      preterite: { yo:"vine", tú:"viniste", él:"vino", nos:"vinimos", vos:"vinisteis", ellos:"vinieron" }
    }
  },
  { infinitive: "decir", irregular: {
      preterite: { yo:"dije", tú:"dijiste", él:"dijo", nos:"dijimos", vos:"dijisteis", ellos:"dijeron" } // -eron
    }
  },
  { infinitive: "traer", irregular: {
      preterite: { yo:"traje", tú:"trajiste", él:"trajo", nos:"trajimos", vos:"trajisteis", ellos:"trajeron" } // -eron
    }
  },
  { infinitive: "hacer", irregular: {
      preterite: { yo:"hice", tú:"hiciste", él:"hizo", nos:"hicimos", vos:"hicisteis", ellos:"hicieron" }
    }
  },
];

function conjugateIndefinido(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  if (verb.irregular?.preterite) return verb.irregular.preterite;
  const stem = verb.infinitive.slice(0, -2);
  const ends = verb.type === "ar"
    ? ["é","aste","ó","amos","asteis","aron"]
    : ["í","iste","ió","imos","isteis","ieron"]; // -er / -ir
  const out = {};
  persons.forEach((p,i)=> out[p] = stem + ends[i]);
  return out;
}

/* ---------- Imperfecto ---------- */
// Regular: -ar → aba, abas, aba, ábamos, abais, aban
//          -er/-ir → ía, ías, ía, íamos, íais, ían
// Irregular only 3 verbs: ser, ir, ver
const IMPERFECTO_VERBS = [
  // regular examples
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
  { infinitive: "trabajar", type: "ar" },
  { infinitive: "escribir", type: "ir" },

  // irregular 3
  { infinitive: "ser", irregular: {
      imperfecto: { yo:"era", tú:"eras", él:"era", nos:"éramos", vos:"erais", ellos:"eran" }
    }
  },
  { infinitive: "ir", irregular: {
      imperfecto: { yo:"iba", tú:"ibas", él:"iba", nos:"íbamos", vos:"ibais", ellos:"iban" }
    }
  },
  { infinitive: "ver", irregular: {
      imperfecto: { yo:"veía", tú:"veías", él:"veía", nos:"veíamos", vos:"veíais", ellos:"veían" }
    }
  },
];

function conjugateImperfecto(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  if (verb.irregular?.imperfecto) return verb.irregular.imperfecto;

  const stem = verb.infinitive.slice(0, -2);
  const type = verb.type ?? verb.infinitive.slice(-2);
  const ends = type === "ar"
    ? ["aba","abas","aba","ábamos","abais","aban"]
    : ["ía","ías","ía","íamos","íais","ían"]; // -er / -ir
  const out = {};
  persons.forEach((p,i)=> out[p] = stem + ends[i]);
  return out;
}

/* ---------- Component ---------- */
export default function Past({ onRoundScore }) {
  const [mode, setMode] = useState("indefinido");
  // filters per mode
  const [filterIndef, setFilterIndef] = useState("all");       // all | regular | irregular
  const [filterImperf, setFilterImperf] = useState("all");     // all | regular | irregular
  const [showRules, setShowRules] = useState(false);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const [showAccents, setShowAccents] = useState(false);
  const [focusedKey, setFocusedKey] = useState(null);
  const inputRefs = useRef(Object.fromEntries(PERSONS.map(p => [p.key, null])));

  function resetRoundState() {
    setAnswers({});
    setChecked(false);
    setLastScore(null);
    setIdx(0);
  }

  /* ----- pools per mode ----- */
  const indefPool = useMemo(() => {
    if (filterIndef === "regular")   return INDEFINIDO_VERBS.filter(v => !v.irregular);
    if (filterIndef === "irregular") return INDEFINIDO_VERBS.filter(v =>  v.irregular);
    return INDEFINIDO_VERBS;
  }, [filterIndef]);

  const imperfPool = useMemo(() => {
    if (filterImperf === "regular")   return IMPERFECTO_VERBS.filter(v => !v.irregular);
    if (filterImperf === "irregular") return IMPERFECTO_VERBS.filter(v =>  v.irregular);
    return IMPERFECTO_VERBS;
  }, [filterImperf]);

  /* ----- current item ----- */
  const item = useMemo(() => {
    if (mode === "indefinido") {
      const v = indefPool[idx % indefPool.length];
      return v ? { verb: v.infinitive, forms: conjugateIndefinido(v) } : null;
    }
    if (mode === "imperfecto") {
      const v = imperfPool[idx % imperfPool.length];
      return v ? { verb: v.infinitive, forms: conjugateImperfecto(v) } : null;
    }
    return null;
  }, [mode, idx, indefPool, imperfPool]);

  /* ----- actions ----- */
  function setAnswer(k, v) { setAnswers(a => ({ ...a, [k]: v })); }

  function check() {
    if (!item) return;
    const correct = PERSONS.filter(
      p => (answers[p.key] ?? "").toLowerCase() === item.forms[p.key].toLowerCase()
    ).length;
    setLastScore(`${correct}/${PERSONS.length}`);
    setChecked(true);
    onRoundScore?.(correct, PERSONS.length);
  }

  function next() {
    setAnswers({});
    setChecked(false);
    setLastScore(null);
    const len = mode === "indefinido" ? indefPool.length : imperfPool.length;
    setIdx(i => rndNext(len, i));
  }

  function insertChar(ch) {
    const key = focusedKey;
    if (!key) return;
    const el = inputRefs.current[key];
    const curr = answers[key] ?? "";
    if (el && typeof el.selectionStart === "number") {
      const s = el.selectionStart, e = el.selectionEnd ?? s;
      const newVal = curr.slice(0, s) + ch + curr.slice(e);
      setAnswers(a => ({ ...a, [key]: newVal }));
      requestAnimationFrame(() => {
        if (inputRefs.current[key]) {
          inputRefs.current[key].focus();
          inputRefs.current[key].setSelectionRange(s + ch.length, s + ch.length);
        }
      });
    } else {
      setAnswers(a => ({ ...a, [key]: (a[key] ?? "") + ch }));
    }
  }

  /* ---------- UI ---------- */
  return (
    <section className="max-w-3xl">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); resetRoundState(); }}
            className={
              "px-3 py-2 rounded-lg text-sm font-medium border " +
              (mode === m.key ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-100 text-gray-800")
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Headers / controls */}
      {mode === "indefinido" ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Pretérito — Indefinido</h2>
            {item && (
              <p className="mt-1 text-gray-700">
                Verb: <span className="font-medium">{item.verb}</span>
              </p>
            )}
            <div className="mt-2">
                <button
                  onClick={() => setShowRules((s) => !s)}
                  className="px-3 py-1 rounded bg-orange-100 text-orange-800 hover:bg-orange-300 text-xs"
                >
                  {showRules ? "Hide rules" : "Show rules"}
                </button>

                {showRules && (
                  <div className="mt-2 p-3 rounded border bg-orange-50 text-xs leading-relaxed">
                    <p>
                      <strong>Rule (regular -ar):</strong>{" "}
                      <code>-é, -aste, -ó, -amos, -asteis, -aron</code>
                    </p>
                    <p className="mt-1">
                      <strong>Rule (regular -er / -ir):</strong>{" "}
                      <code>-í, -iste, -ió, -imos, -isteis, -ieron</code>
                    </p>
                    <p className="mt-1">
                      Many verbs are irregular with special stems (e.g.,{" "}
                      <em>tener → tuve, estar → estuve, decir → dije</em>).
                    </p>
                  </div>
                )}
              </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterIndef}
              onChange={(e)=>{ setFilterIndef(e.target.value); resetRoundState(); }}
              className="h-9 px-3 rounded-lg border bg-white text-sm"
              title="Choose verb set"
            >
              <option value="all">All verbs</option>
              <option value="regular">Regular only</option>
              <option value="irregular">Irregular only</option>
            </select>

            <button
              onClick={() => setShowAccents(s => !s)}
              className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-100 text-sm whitespace-nowrap"
            >
              {showAccents ? "Hide accents" : "Show accents"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Pretérito — Imperfecto</h2>
            {item && (
              <p className="mt-1 text-gray-700">
                Verb: <span className="font-medium">{item.verb}</span>
              </p>
            )}
              <div className="mt-2">
                <button
                  onClick={() => setShowRules((s) => !s)}
                  className="px-3 py-1 rounded bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs"
                >
                  {showRules ? "Hide rules" : "Show rules"}
                </button>

                {showRules && (
                  <div className="mt-2 p-3 rounded border bg-orange-50 text-xs leading-relaxed">
                    <p className="mt-1 text-xs text-gray-500">
                      Regular endings: <code>-ar → aba, abas, aba, ábamos, abais, aban</code> ·{" "}
                      <code>-er/-ir → ía, ías, ía, íamos, íais, ían</code>. Irregulars:{" "}
                      <em>ser: era/eras/…</em>, <em>ir: iba/ibas/…</em>, <em>ver: veía/veías/…</em>.
                    </p>
                  </div>
                )}
              </div>

          </div>

          <div className="flex gap-2">
            <select
              value={filterImperf}
              onChange={(e)=>{ setFilterImperf(e.target.value); resetRoundState(); }}
              className="h-9 px-3 rounded-lg border bg-white text-sm"
              title="Choose verb set"
            >
              <option value="all">All verbs</option>
              <option value="regular">Regular only</option>
              <option value="irregular">Irregular only</option>
            </select>

            <button
              onClick={() => setShowAccents(s => !s)}
              className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-100 text-sm whitespace-nowrap"
            >
              {showAccents ? "Hide accents" : "Show accents"}
            </button>
          </div>
        </div>
      )}

      {showAccents && <AccentPad onInsert={insertChar} />}

      {/* Drill grid */}
      <div className="mt-4 grid gap-3">
        {PERSONS.map(p => {
          const val = answers[p.key] ?? "";
          const correct = item?.forms[p.key] ?? "";
          const isRight = val.toLowerCase() === correct.toLowerCase();
          return (
            <label key={p.key} className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm">
              <span className="w-40">{p.label}</span>
              <input
                ref={el => (inputRefs.current[p.key] = el)}
                value={val}
                onChange={e => setAnswer(p.key, e.target.value)}
                onFocus={() => setFocusedKey(p.key)}
                disabled={checked}
                placeholder="type the form"
                className="flex-1 border rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
              />
              {checked && (
                <span className={`w-32 text-sm ${isRight ? "text-green-600" : "text-red-600"}`}>
                  {isRight ? "✓ correct" : `✗ ${correct}`}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-6">
        {!checked ? (
          <button onClick={check} className="px-4 py-2 rounded-lg bg-orange-900 text-white hover:bg-orange-700 transition">Check</button>
        ) : (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition">Next verb</button>
        )}
        {lastScore && <span className="text-sm text-gray-700">Score: {lastScore}</span>}
      </div>
    </section>
  );
}
