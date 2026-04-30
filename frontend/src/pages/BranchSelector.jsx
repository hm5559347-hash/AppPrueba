import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchBranches } from "../lib/api";
import { toast } from "sonner";
import { MapPin, ArrowRight, LogOut } from "lucide-react";

export default function BranchSelector() {
  const { authed, setBranch, logout } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) {
      navigate("/", { replace: true });
      return;
    }
    fetchBranches()
      .then(setBranches)
      .catch(() => toast.error("Error cargando sucursales"))
      .finally(() => setLoading(false));
  }, [authed, navigate]);

  const select = (br) => {
    setBranch(br);
    toast.success(`Sucursal ${br.name.split("·").pop().trim()} seleccionada`);
    setTimeout(() => navigate("/agenda"), 150);
  };

  const handleExit = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="branch-selector-screen">
      <header className="border-b border-black px-6 lg:px-12 py-6 flex items-center justify-between">
        <div>
          <div className="font-mono-label text-[10px] text-neutral-500">PASO 2 DE 2</div>
          <div className="font-serif-display text-2xl mt-1 leading-none">
            Manuel <em className="italic">&amp;</em> Torres
          </div>
        </div>
        <button
          onClick={handleExit}
          data-testid="branch-exit-btn"
          className="btn-invert border border-black px-4 py-2 font-mono-label text-[10px] hover:bg-black hover:text-white flex items-center gap-2"
        >
          <LogOut className="w-3 h-3" /> Salir
        </button>
      </header>

      <div className="flex-1 px-6 lg:px-12 py-10 lg:py-16 max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <div className="font-mono-label text-[10px] text-neutral-500">─── Seleccione sucursal</div>
          <h1 className="font-serif-display text-5xl lg:text-6xl leading-[0.9] mt-3">
            ¿Dónde trabajará <em className="italic">hoy</em>?
          </h1>
          <p className="text-sm text-neutral-600 mt-4 max-w-xl font-light">
            Todas las citas, especialistas y agendas se mostrarán filtradas por la sucursal seleccionada.
            Podrá cambiar de sucursal en cualquier momento desde el menú lateral.
          </p>
        </div>

        {loading ? (
          <div className="font-mono-label text-xs text-neutral-500">Cargando...</div>
        ) : branches.length === 0 ? (
          <div className="border border-black p-12 text-center">
            <div className="font-serif-display text-3xl mb-2">Sin sucursales registradas</div>
            <p className="text-sm text-neutral-600">Contacte al administrador para crear una sucursal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="branches-grid">
            {branches.map((b, i) => (
              <button
                key={b.id}
                data-testid={`branch-option-${b.id}`}
                onClick={() => select(b)}
                className="btn-invert group text-left border border-black p-6 hover:bg-black hover:text-white flex flex-col min-h-[200px]"
              >
                <div className="font-mono-label text-[10px] opacity-60">
                  SUCURSAL {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-serif-display text-3xl mt-3 leading-tight">{b.name}</h3>
                {b.address && (
                  <div className="flex items-start gap-2 mt-3 text-xs opacity-80">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <span>{b.address}</span>
                  </div>
                )}
                <div className="flex-1" />
                <div className="font-mono-label text-[10px] mt-6 flex items-center gap-2 opacity-60 group-hover:opacity-100">
                  INGRESAR <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
