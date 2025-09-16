import { useMemo, useRef, useState } from "react";
import AccentPad from "../components/AccentPad";

const VERBS = [
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
  { infinitive: "ir", type: "irregular", irregular: {
      present: { yo:"voy", tú:"vas", él:"va", nos:"vamos", vos:"vais", ellos:"van" }
    }
  },
  { infinitive: "ser", type: "irregular", irregular: {
      present: { yo:"soy", tú:"eres", él:"es", nos:"somos", vos:"sois", ellos:"son" }
    }
  },
  { infinitive: "tener", type: "er", irregular: {
      present: { yo:"tengo", tú:"tienes", él:"tiene", nos:"tenemos", vos:"tenéis", ellos:"tienen" }
    }
  },
];

function conjugatePresent(v) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  if (v.irregular?.present) return v.irregular.present;
  const stem = v.infinitive.slice(0, -2);
  const ends = v.type === "ar"
    ? ["o","as","a","amos","áis","an"]
    : ["o","es","e", v.type==="er" ? "emos":"imos", v.type==="er" ? "éis":"ís", "en"];
  const out = {}; persons.forEach((p,i)=> out[p]=stem+ends[i]); return out;
}
const PERSONS = [
  { key:"yo",label:"yo"},{ key:"tú",label:"tú"},{ key:"él",label:"él/ella/usted"},
  { key:"nos",label:"nosotros"},{ key:"vos",label:"vosotros"},{ key:"ellos",label:"ellos/ellas/ustedes"},
];
const rndNext = (max, avoid)=> (max<=1?0:((avoid+1+Math.floor(Math.random()*(max-1)))%max));

export default function Present({ onRoundScore }) {
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [checked,setChecked]=useState(false);
  const [lastScore,setLastScore]=useState(null);
  const [showAccents,setShowAccents]=useState(false);
  const [focusedKey,setFocusedKey]=useState(null);

  const inputRefs = useRef(Object.fromEntries(PERSONS.map(p=>[p.key, null])));

  const item = useMemo(()=>{
    const v = VERBS[idx%VERBS.length];
    return { verb: v.infinitive, forms: conjugatePresent(v) };
  },[idx]);

  function setAnswer(k,v){ setAnswers(a=>({...a,[k]:v})); }

  function check(){
    const correct = PERSONS.filter(p => (answers[p.key]??"").toLowerCase() === item.forms[p.key].toLowerCase()).length;
    setLastScore(`${correct}/${PERSONS.length}`);
    setChecked(true);
    onRoundScore?.(correct, PERSONS.length); // report up to App
  }

  function next(){ setAnswers({}); setChecked(false); setIdx(i=>rndNext(VERBS.length,i)); setLastScore(null); }

  function insertChar(ch){
    const key = focusedKey;
    if(!key) return;
    const el = inputRefs.current[key];
    const curr = answers[key] ?? "";
    if (el && typeof el.selectionStart === "number") {
      const s = el.selectionStart, e = el.selectionEnd ?? s;
      const newVal = curr.slice(0, s) + ch + curr.slice(e);
      setAnswers(a => ({ ...a, [key]: newVal }));
      // restore caret after React updates the value
      requestAnimationFrame(() => {
        if (inputRefs.current[key]) {
          inputRefs.current[key].focus();
          inputRefs.current[key].setSelectionRange(s + ch.length, s + ch.length);
        }
      });
    } else {
      // fallback: append
      setAnswers(a => ({ ...a, [key]: (a[key] ?? "") + ch }));
    }
  }

  return (
    <section className="max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Presente — Conjugation Drill</h2>
          <p className="mt-1 text-gray-700">
            Verb: <span className="font-medium">{item.verb}</span>
          </p>
        </div>
        <button
          onClick={()=>setShowAccents(s=>!s)}
          className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-100"
        >
          {showAccents ? "Hide accents" : "Show accents"}
        </button>
      </div>

      {showAccents && <AccentPad onInsert={insertChar} />}

      <div className="mt-4 grid gap-3">
        {PERSONS.map(p=>{
          const val = answers[p.key] ?? "";
          const correct = item.forms[p.key];
          const isRight = val.toLowerCase() === correct.toLowerCase();
          return (
            <label key={p.key} className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm">
              <span className="w-40">{p.label}</span>
              <input
                ref={el => (inputRefs.current[p.key] = el)}
                value={val}
                onChange={e=>setAnswer(p.key, e.target.value)}
                onFocus={()=>setFocusedKey(p.key)}
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
          <button onClick={check} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            Check
          </button>
        ) : (
          <button onClick={next} className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition">
            Next verb
          </button>
        )}
        {lastScore && <span className="text-sm text-gray-700">Score: {lastScore}</span>}
      </div>
    </section>
  );
}
