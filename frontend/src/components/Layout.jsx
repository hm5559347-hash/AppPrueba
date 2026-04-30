import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CalendarDays, CalendarRange, Plus, Layers, LogOut, MapPin, ArrowLeftRight } from "lucide-react";

const navItems = [
  { to: "/agenda", label: "Agenda del Día", icon: CalendarDays, testid: "nav-daily" },
  { to: "/semana", label: "Vista Semanal", icon: CalendarRange, testid: "nav-weekly" },
  { to: "/nueva-cita", label: "Nueva Cita", icon: Plus, testid: "nav-new-appointment" },
  { to: "/catalogo", label: "Catálogo", icon: Layers, testid: "nav-catalog" },
];

export default function Layout() {
  const { logout, branch, clearBranch } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChangeBranch = () => {
    clearBranch();
    navigate("/sucursal");
  };

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Sidebar (desktop) / Top bar (mobile) */}
      <aside className="lg:w-72 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-black flex flex-col" data-testid="sidebar">
        <div className="p-6 lg:p-8 border-b border-black">
          <div className="font-mono-label text-[10px] text-neutral-500">SALÓN · MMXXVI</div>
          <h1 className="font-serif-display text-3xl lg:text-4xl mt-1 leading-none">
            Manuel<br/>
            <em className="italic">&amp; Torres</em>
          </h1>
          {branch && (
            <button
              onClick={handleChangeBranch}
              data-testid="change-branch-btn"
              className="btn-invert w-full mt-4 border border-black p-3 hover:bg-black hover:text-white text-left group"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                <div className="font-mono-label text-[9px] opacity-60">SUCURSAL ACTIVA</div>
              </div>
              <div className="font-serif-display text-base mt-1 leading-tight" data-testid="active-branch-name">
                {branch.name.replace(/^Manuel & Torres · /, "")}
              </div>
              <div className="font-mono-label text-[9px] mt-1 opacity-60 flex items-center gap-1 group-hover:opacity-100">
                <ArrowLeftRight className="w-2.5 h-2.5" /> Cambiar
              </div>
            </button>
          )}
        </div>

        <nav className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-visible">
          {navItems.map(({ to, label, icon: Icon, testid }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 lg:px-8 py-4 lg:py-5 border-b lg:border-b border-r lg:border-r-0 border-neutral-200 whitespace-nowrap font-mono-label text-[11px] btn-invert ${
                  isActive ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"
                }`
              }
            >
              <Icon className="w-4 h-4" strokeWidth={1.25} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block flex-1" />

        <div className="p-6 lg:p-8 border-t border-black">
          <div className="font-mono-label text-[10px] text-neutral-500 mb-2">HOY</div>
          <div className="font-serif-display text-xl capitalize" data-testid="today-date">{today}</div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="btn-invert mt-6 w-full border border-black py-3 px-4 font-mono-label text-[10px] hover:bg-black hover:text-white flex items-center justify-center gap-2"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
