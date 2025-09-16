import { useMemo, useState } from "react";

/** 1) verbs: regular + a few irregulars for PRESENT */
const VERBS = [
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
  // irregulars
  { infinitive: "ir", type: "irregular", irregular: {
      present: { yo:"voy", tú:"vas", él:"va", nos:"vamos", vos:"vais", ellos:"van" }
    }
  },
  { infinitive: "ser", type: "irregular", irregular: {
      present: { yo:"soy", tú:"eres", él:"es", nos:"somos", vos:"sois", ellos:"son" }
    }
  },
  { infinitive: "tener", type: "er", irregular: {
      // keep type for regular past/future later; override present now
      present: { yo:"tengo", tú:"tienes", él:"tiene", nos:"tenemos", vos:"tenéis", ellos:"tienen" }
    }
  },
];

function conjugatePresent(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];

  // 2) irregular shortcut
  if (verb.irregular?.present) return verb.irregular.present;

  // 3) regular endings
  const stem = verb.infinitive.slice(0, -2);
  const ends = verb.type === "ar"
    ? ["o","as","a","amos","áis","an"]
    : ["o","es","e", verb.type==="er" ? "emos":"imos", verb.type==="er" ? "éis":"ís", "en"];

  const out = {};
  persons.forEach((p, i) => { out[p] = stem + ends[i]; });
  return out;
}

const PERSONS = [
  { key: "yo",   label: "yo" },
  { key: "tú",   label: "tú" },
  { key: "él",   label: "él/ella/usted" },
  { key: "nos",  label: "nosotros" },
  { key: "vos",  label: "vosotros" },
  { key: "ellos",label: "ellos/ellas/ustedes" },
];

// helper: random index different from current
function randomNext(max, avoid) {
  if (max <= 1) return 0;
  let r = Math.floor(Math.random() * max);
  if (r === avoid) r = (r + 1) % max;
  return r;
}

export default function Present() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [lastScore, setLastScore] = useState(null); // e.g., 4/6

  const item = useMemo(() => {
    const v = VERBS[idx % VERBS.length];
    return { verb: v.infinitive, forms: conjugatePresent(v) };
  }, [idx]);

  function setAnswer(k, v) { setAnswers(a => ({ ...a, [k]: v.trim() })); }

  function check() {
    // compute score
    const correct = PERSONS.filter(p =>
      (answers[p.key] ?? "").toLowerCase() === item.forms[p.key].toLowerCase()
    ).length;
    setLastScore(`${correct}/${PERSONS.length}`);
    setChecked(true);
  }

  function next() {
    setAnswers({});
    setChecked(false);
    setIdx(i => randomNext(VERBS.length, i));  // 4) randomize next verb
    setLastScore(null);
  }

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-semibold">Presente — Conjugation Drill</h2>
      <p className="mt-1 text-gray-700">
        Verb: <span className="font-medium">{item.verb}</span>
      </p>

      <div className="mt-4 grid gap-3">
        {PERSONS.map(p => {
          const val = answers[p.key] ?? "";
          const correct = item.forms[p.key];
          const isRight = val.toLowerCase() === correct.toLowerCase();
          return (
            <label
              key={p.key}
              className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm"
            >
              <span className="w-40">{p.label}</span>
              <input
                value={val}
                onChange={e => setAnswer(p.key, e.target.value)}
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

        {/* 5) show score after check */}
        {lastScore && (
          <span className="text-sm text-gray-700">Score: {lastScore}</span>
        )}
      </div>
    </section>
  );
}
