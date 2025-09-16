// src/pages/Past.jsx
import { useMemo, useRef, useState } from "react";
import AccentPad from "../components/AccentPad";

/* ---------- Tabs ---------- */
const MODES = [
  { key: "indefinido", label: "Pretérito indefinido" },
  { key: "compuesto",  label: "Pretérito compuesto" },
];

/* ---------- Indefinido data ---------- */
// Regular samples + several irregulars (full forms)
const INDEFINIDO_VERBS = [
  // regular examples
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
  { infinitive: "mirar",  type: "ar" },
  { infinitive: "aprender", type: "er" },

  // irregulars (full conjugations)
  { infinitive: "ir", type: "irregular", irregular: {
      preterite: { yo:"fui", tú:"fuiste", él:"fue", nos:"fuimos", vos:"fuisteis", ellos:"fueron" }
    }
  },
  { infinitive: "ser", type: "irregular", irregular: {
      preterite: { yo:"fui", tú:"fuiste", él:"fue", nos:"fuimos", vos:"fuisteis", ellos:"fueron" }
    }
  },
  { infinitive: "tener", type: "irregular", irregular: {
      preterite: { yo:"tuve", tú:"tuviste", él:"tuvo", nos:"tuvimos", vos:"tuvisteis", ellos:"tuvieron" }
    }
  },
  { infinitive: "estar", type: "irregular", irregular: {
      preterite: { yo:"estuve", tú:"estuviste", él:"estuvo", nos:"estuvimos", vos:"estuvisteis", ellos:"estuvieron" }
    }
  },
  { infinitive: "poder", type: "irregular", irregular: {
      preterite: { yo:"pude", tú:"pudiste", él:"pudo", nos:"pudimos", vos:"pudisteis", ellos:"pudieron" }
    }
  },
  { infinitive: "poner", type: "irregular", irregular: {
      preterite: { yo:"puse", tú:"pusiste", él:"puso", nos:"pusimos", vos:"pusisteis", ellos:"pusieron" }
    }
  },
  { infinitive: "venir", type: "irregular", irregular: {
      preterite: { yo:"vine", tú:"viniste", él:"vino", nos:"vinimos", vos:"vinisteis", ellos:"vinieron" }
    }
  },
  { infinitive: "decir", type: "irregular", irregular: {
      preterite: { yo:"dije", tú:"dijiste", él:"dijo", nos:"dijimos", vos:"dijisteis", ellos:"dijeron" } // -eron
    }
  },
  { infinitive: "traer", type: "irregular", irregular: {
      preterite: { yo:"traje", tú:"trajiste", él:"trajo", nos:"trajimos", vos:"trajisteis", ellos:"trajeron" } // -eron
    }
  },
  { infinitive: "hacer", type: "irregular", irregular: {
      preterite: { yo:"hice", tú:"hiciste", él:"hizo", nos:"hicimos", vos:"hicisteis", ellos:"hicieron" }
    }
  },
];

// Regular endings for indefinido
function conjugateIndefinido(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  if (verb.irregular?.preterite) return verb.irregular.preterite;

  const stem = verb.infinitive.slice(0, -2);
  const ends = verb.type === "ar"
    ? ["é","aste","ó","amos","asteis","aron"]
    : ["í","iste","ió","imos","isteis","ieron"];
  const out = {};
  persons.forEach((p,i)=> out[p] = stem + ends[i]);
  return out;
}

/* ---------- Compuesto data ---------- */
// "haber" (presente) + participio
const HABER_PRESENTE = {
  yo:"he", tú:"has", él:"ha", nos:"hemos", vos:"habéis", ellos:"han"
};
// irregular participles
const IRREG_PARTICIPLES = {
  "hacer":"hecho", "decir":"dicho", "ver":"visto", "poner":"puesto",
  "escribir":"escrito", "abrir":"abierto", "romper":"roto",
  "volver":"vuelto", "morir":"muerto", "freír":"frito"
};

// pool of infinitives (regular + some with irregular participles)
const COMPUESTO_VERBS = [
  "hablar","comer","vivir","mirar","aprender","trabajar","estudiar",
  "hacer","decir","ver","poner","escribir","abrir","romper","volver","morir","freír"
].map(inf => ({ infinitive: inf }));

function participleFor(inf) {
  if (IRREG_PARTICIPLES[inf]) return IRREG_PARTICIPLES[inf];
  const base = inf.slice(0, -2);
  const type = inf.slice(-2);
  if (type === "ar") return base + "ado";
  // -er / -ir
  return base + "ido";
}

function conjugateCompuesto(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  const part = participleFor(verb.infinitive);
  const out = {};
  persons.forEach(p => out[p] = `${HABER_PRESENTE[p]} ${part}`);
  return out;
}

/* ---------- Shared ---------- */
const PERSONS = [
  { key:"yo",label:"yo" },
  { key:"tú",label:"tú" },
  { key:"él",label:"él/ella/usted" },
  { key:"nos",label:"nosotros" },
  { key:"vos",label:"vosotros" },
  { key:"ellos",label:"ellos/ellas/ustedes" },
];

const rndNext = (max, avoid) =>
  max <= 1 ? 0 : ((avoid + 1 + Math.floor(Math.random() * (max - 1))) % max);

export default function Past({ onRoundScore }) {
  const [mode, setMode] = useState("indefinido");
  const [filter, setFilter] = useState("all"); // indefinido: all | regular | irregular

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

  /* ----- pools ----- */
  const indefPool = useMemo(() => {
    if (filter === "regular")   return INDEFINIDO_VERBS.filter(v => !v.irregular);
    if (filter === "irregular") return INDEFINIDO_VERBS.filter(v =>  v.irregular);
    return INDEFINIDO_VERBS;
  }, [filter]);

  const compPool = COMPUESTO_VERBS;

  /* ----- item ----- */
  const item = useMemo(() => {
    if (mode === "indefinido") {
      const v = indefPool[idx % indefPool.length];
      return v ? { verb: v.infinitive, forms: conjugateIndefinido(v) } : null;
    }
    if (mode === "compuesto") {
      const v = compPool[idx % compPool.length];
      return v ? { verb: v.infinitive, forms: conjugateCompuesto(v) } : null;
    }
    return null;
  }, [mode, idx, indefPool, compPool]);

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
    const len = mode === "indefinido" ? indefPool.length : compPool.length;
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

  /* ----- UI ----- */
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

      {/* HEADERS / CONTROLS */}
      {mode === "indefinido" ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Pretérito — Indefinido</h2>
            {item && (
              <p className="mt-1 text-gray-700">
                Verb: <span className="font-medium">{item.verb}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Regular endings: <code>-ar → é, aste, ó, amos, asteis, aron</code> ·{" "}
              <code>-er/-ir → í, iste, ió, imos, isteis, ieron</code>. Irregulars use special forms.
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e)=>{ setFilter(e.target.value); resetRoundState(); }}
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
            <h2 className="text-2xl font-semibold">Pretérito — Compuesto</h2>
            {item && (
              <p className="mt-1 text-gray-700">
                Verb: <span className="font-medium">{item.verb}</span>
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Pattern: <em>haber</em> (presente) + participio. Ej.:{" "}
              <em>he hablado, has comido, ha vivido</em>. Irregulares:{" "}
              <em>hecho, dicho, visto, puesto, escrito, abierto, roto, vuelto, muerto, frito…</em>
            </p>
          </div>

          <button
            onClick={() => setShowAccents(s => !s)}
            className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-100 text-sm whitespace-nowrap"
          >
            {showAccents ? "Hide accents" : "Show accents"}
          </button>
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
          <button onClick={check} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Check</button>
        ) : (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition">Next verb</button>
        )}
        {lastScore && <span className="text-sm text-gray-700">Score: {lastScore}</span>}
      </div>
    </section>
  );
}
