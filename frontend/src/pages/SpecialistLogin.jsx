import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { specialistLogin } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function SpecialistLogin() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSpecialist } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Ingrese su código");
      return;
    }
    setLoading(true);
    try {
      const sp = await specialistLogin(code.trim());
      setSpecialist(sp);
      toast.success(`Bienvenida, ${sp.name.split(" ")[0]}`);
      setTimeout(() => navigate("/mi-agenda"), 200);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Código inválido");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white" data-testid="specialist-login-screen">
      <div className="relative hidden lg:block overflow-hidden border-r border-black">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80"
          alt="Salón"
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 brightness-90"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="font-mono-label text-xs">ACCESO ESPECIALISTA · MANUEL &amp; TORRES</div>
          <div>
            <h1 className="font-serif-display text-6xl xl:text-7xl leading-[0.9] font-light">
              Mi<br/><em className="italic font-normal">Agenda</em>
            </h1>
            <p className="font-mono-label text-[10px] mt-6 opacity-80">
              Consulte sus citas asignadas con su código personal
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-sm">
          <button
            type="button"
            onClick={() => navigate("/")}
            data-testid="back-to-pin"
            className="btn-invert font-mono-label text-[10px] text-neutral-500 hover:text-black flex items-center gap-2 mb-10"
          >
            <ArrowLeft className="w-3 h-3" /> Volver
          </button>

          <p className="font-mono-label text-[10px] text-neutral-500">─── Identifíquese</p>
          <h2 className="font-serif-display text-5xl mt-3 leading-none">
            Ingrese su <em className="italic">código</em>
          </h2>
          <p className="text-sm text-neutral-600 mt-4 font-light">
            Su ID personal de cuatro dígitos asignado por la administración.
          </p>

          <div className="mt-10">
            <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">
              <KeyRound className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
              CÓDIGO ESPECIALISTA
            </label>
            <input
              data-testid="specialist-code-input"
              type="text"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="• • • •"
              className="w-full border border-black px-4 py-5 bg-white outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 font-serif-display text-4xl text-center tracking-[0.5em]"
            />
          </div>

          <button
            type="submit"
            data-testid="specialist-submit-btn"
            disabled={loading || code.length < 1}
            className="btn-invert mt-6 w-full border border-black bg-black text-white py-4 font-mono-label text-[10px] hover:bg-white hover:text-black disabled:opacity-40"
          >
            {loading ? "VERIFICANDO..." : "INGRESAR"}
          </button>

          <p className="text-center text-[10px] font-mono-label text-neutral-400 mt-12">
            ¿Olvidó su código? Consulte con la administración.
          </p>
        </form>
      </div>
    </div>
  );
}
