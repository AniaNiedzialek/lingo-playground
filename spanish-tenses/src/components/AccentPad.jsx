export default function AccentPad({ onInsert }) {
  const chars = ["á","é","í","ó","ú","ñ","Á","É","Í","Ó","Ú","Ñ"];
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {chars.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onInsert(c)}
          className="px-2 py-1 border rounded bg-white hover:bg-gray-100"
          title={`Insert ${c}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
