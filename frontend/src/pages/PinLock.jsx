import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPin } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Delete } from "lucide-react";

export default function PinLock() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePress = async (digit) => {
    if (loading) return;
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setLoading(true);
      try {
        await verifyPin(next);
        login();
        toast.success("Acceso autorizado");
        setTimeout(() => navigate("/sucursal"), 200);
      } catch (e) {
        toast.error("PIN incorrecto");
        setTimeout(() => setPin(""), 400);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    }
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white" data-testid="pin-lock-screen">
      {/* Left: editorial image */}
      <div className="relative hidden lg:block overflow-hidden border-r border-black">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80"
          alt="Salón de belleza"
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 brightness-90"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="font-mono-label text-xs">EST. MMXXVI · SALÓN</div>
          <div>
            <h1 className="font-serif-display text-6xl xl:text-7xl leading-[0.9] font-light">
              Manuel<br/>
              <em className="italic font-normal">&amp; Torres</em>
            </h1>
            <p className="font-mono-label text-[10px] mt-6 opacity-80">
              Sistema interno de gestión · Multi-sucursal
            </p>
          </div>
        </div>
      </div>

      {/* Right: PIN pad */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <p className="font-mono-label text-[10px] text-neutral-500" data-testid="pin-greeting">
              ─── Bienvenida
            </p>
            <h2 className="font-serif-display text-5xl mt-3 leading-none">
              Ingrese su <em className="italic">PIN</em>
            </h2>
            <p className="text-sm text-neutral-600 mt-4 font-light">
              Cuatro dígitos para acceder al panel administrativo.
            </p>
          </div>

          {/* Dots */}
          <div className="flex gap-4 mb-12 justify-center" data-testid="pin-dots">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                data-testid={`pin-dot-${i}`}
                className={`pin-dot w-4 h-4 border border-black ${
                  i < pin.length ? "bg-black" : "bg-white"
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3" data-testid="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                data-testid={`pin-key-${n}`}
                onClick={() => handlePress(String(n))}
                disabled={loading}
                className="btn-invert h-16 border border-black bg-white hover:bg-black hover:text-white font-serif-display text-3xl disabled:opacity-50"
              >
                {n}
              </button>
            ))}
            <button
              data-testid="pin-key-clear"
              onClick={() => setPin("")}
              className="btn-invert h-16 border border-neutral-300 text-neutral-500 hover:border-black hover:text-black font-mono-label text-[10px]"
            >
              CLEAR
            </button>
            <button
              data-testid="pin-key-0"
              onClick={() => handlePress("0")}
              disabled={loading}
              className="btn-invert h-16 border border-black bg-white hover:bg-black hover:text-white font-serif-display text-3xl disabled:opacity-50"
            >
              0
            </button>
            <button
              data-testid="pin-key-delete"
              onClick={handleDelete}
              className="btn-invert h-16 border border-neutral-300 text-neutral-500 hover:border-black hover:text-black flex items-center justify-center"
            >
              <Delete className="w-5 h-5" strokeWidth={1} />
            </button>
          </div>

          <p className="text-center text-[10px] font-mono-label text-neutral-400 mt-12">
            v1.0 · Sólo personal autorizado
          </p>

          <div className="mt-8 pt-8 border-t border-neutral-200">
            <p className="font-mono-label text-[9px] text-neutral-500 text-center mb-3">
              ¿Es especialista?
            </p>
            <button
              type="button"
              data-testid="specialist-access-btn"
              onClick={() => navigate("/especialista")}
              className="btn-invert w-full border border-black py-3 font-mono-label text-[10px] hover:bg-black hover:text-white"
            >
              ACCESO ESPECIALISTA →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
