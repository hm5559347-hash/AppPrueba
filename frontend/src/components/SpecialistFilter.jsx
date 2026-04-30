import { Users } from "lucide-react";

export default function SpecialistFilter({ specialists, value, onChange }) {
  return (
    <div className="px-6 lg:px-12 py-5 border-b border-neutral-200" data-testid="specialist-filter">
      <div className="flex items-center gap-3 mb-3">
        <Users className="w-3 h-3 text-neutral-500" strokeWidth={1.5} />
        <span className="font-mono-label text-[10px] text-neutral-500">
          Filtrar por especialista
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="filter-all"
          onClick={() => onChange("all")}
          className={`btn-invert border px-4 py-2 font-mono-label text-[10px] ${
            value === "all"
              ? "border-black bg-black text-white"
              : "border-neutral-300 hover:border-black"
          }`}
        >
          Todos ({specialists.length})
        </button>
        {specialists.map((s) => (
          <button
            key={s.id}
            type="button"
            data-testid={`filter-specialist-${s.id}`}
            onClick={() => onChange(s.id)}
            className={`btn-invert border pl-1.5 pr-4 py-1.5 flex items-center gap-2 ${
              value === s.id
                ? "border-black bg-black text-white"
                : "border-neutral-300 hover:border-black"
            }`}
          >
            {s.avatar_url ? (
              <img
                src={s.avatar_url}
                alt=""
                className="w-7 h-7 object-cover grayscale"
              />
            ) : (
              <span className="w-7 h-7 bg-neutral-200 flex items-center justify-center font-mono-label text-[9px] text-neutral-600">
                {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
            )}
            <span className="font-mono-label text-[10px]">
              {s.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
