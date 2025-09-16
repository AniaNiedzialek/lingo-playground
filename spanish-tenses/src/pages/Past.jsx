import { useMemo, useState } from "react";

const VERBS = [
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
];

function conjugatePreterite(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  const stem = verb.infinitive.slice(0, -2);
  const ends = verb.type === "ar"
    ? ["é","aste","ó","amos","asteis","aron"]
    : ["í","iste","ió","imos","isteis","ieron"]; // -er/-ir
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

export default function Past() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const item = useMemo(() => {
    const v = VERBS[idx % VERBS.length];
    return { verb: v.infinitive, forms: conjugatePreterite(v) };
  }, [idx]);

  function setAnswer(k, v) { setAnswers(a => ({ ...a, [k]: v.trim() })); }
  function check() { setChecked(true); }
  function next() { setAnswers({}); setChecked(false); setIdx(i => (i + 1) % VERBS.length); }

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-semibold">Pretérito — Conjugation Drill</h2>
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

      <div className="flex gap-2 mt-6">
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
      </div>
    </section>
  );
}
