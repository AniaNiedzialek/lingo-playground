import { useMemo, useState } from "react";

// includes irregular future stems
const VERBS = [
  { infinitive: "hablar", type: "ar" },
  { infinitive: "comer",  type: "er" },
  { infinitive: "vivir",  type: "ir" },
  // common irregular future stems:
  { infinitive: "decir",  type: "irregular", irregular: { futureBase: "dir" } },
  { infinitive: "hacer",  type: "irregular", irregular: { futureBase: "har" } },
  { infinitive: "tener",  type: "er",        irregular: { futureBase: "tendr" } },
  { infinitive: "poner",  type: "er",        irregular: { futureBase: "pondr" } },
  { infinitive: "poder",  type: "er",        irregular: { futureBase: "podr" } },
  { infinitive: "venir",  type: "ir",        irregular: { futureBase: "vendr" } },
  { infinitive: "salir",  type: "ir",        irregular: { futureBase: "saldr" } },
  { infinitive: "querer", type: "er",        irregular: { futureBase: "querr" } },
  { infinitive: "saber",  type: "er",        irregular: { futureBase: "sabr" } },
];

function conjugateFuture(verb) {
  const persons = ["yo","tú","él","nos","vos","ellos"];
  const base = verb.irregular?.futureBase ?? verb.infinitive; // irregular stem or infinitive
  const ends = ["é","ás","á","emos","éis","án"];
  const out = {};
  persons.forEach((p,i)=> { out[p] = base + ends[i]; });
  return out;
}

const PERSONS = [
  { key:"yo",label:"yo"},{key:"tú",label:"tú"},{key:"él",label:"él/ella/usted"},
  { key:"nos",label:"nosotros"},{key:"vos",label:"vosotros"},{key:"ellos",label:"ellos/ellas/ustedes"},
];

function randomNext(max, avoid){ if(max<=1) return 0; let r=Math.floor(Math.random()*max); if(r===avoid) r=(r+1)%max; return r; }

export default function Future(){
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [checked,setChecked]=useState(false);
  const [lastScore,setLastScore]=useState(null);

  const item=useMemo(()=>{
    const v=VERBS[idx%VERBS.length];
    return {verb:v.infinitive, forms:conjugateFuture(v)};
  },[idx]);

  function setAnswer(k,v){ setAnswers(a=>({...a,[k]:v.trim()})); }
  function check(){
    const correct = PERSONS.filter(p => (answers[p.key]??"").toLowerCase()===item.forms[p.key].toLowerCase()).length;
    setLastScore(`${correct}/${PERSONS.length}`);
    setChecked(true);
  }
  function next(){ setAnswers({}); setChecked(false); setIdx(i=>randomNext(VERBS.length,i)); setLastScore(null); }

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-semibold">Futuro — Conjugation Drill</h2>
      <p className="mt-1 text-gray-700">Verb: <span className="font-medium">{item.verb}</span></p>

      <div className="mt-4 grid gap-3">
        {PERSONS.map(p=>{
          const val=answers[p.key]??"";
          const correct=item.forms[p.key];
          const isRight=val.toLowerCase()===correct.toLowerCase();
          return(
            <label key={p.key} className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm">
              <span className="w-40">{p.label}</span>
              <input
                value={val} onChange={e=>setAnswer(p.key,e.target.value)} disabled={checked}
                placeholder="type the form"
                className="flex-1 border rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
              />
              {checked && <span className={`w-32 text-sm ${isRight?"text-green-600":"text-red-600"}`}>{isRight?"✓ correct":`✗ ${correct}`}</span>}
            </label>
          );
        })}
      </div>

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
