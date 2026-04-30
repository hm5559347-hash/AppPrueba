import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import SpecialistFilter from "../components/SpecialistFilter";
import { fetchAppointments, fetchSpecialists, fetchServices } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // make Monday=0
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i);

export default function WeeklyAgenda() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialist, setFilterSpecialist] = useState("all");
  const { branch } = useAuth();

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const load = async () => {
    if (!branch) return;
    setLoading(true);
    try {
      const ws = weekStart.toISOString().slice(0, 10);
      const [a, sp, sv] = await Promise.all([
        fetchAppointments({ week_start: ws, branch_id: branch.id }),
        fetchSpecialists({ branch_id: branch.id }),
        fetchServices(),
      ]);
      setAppointments(a);
      setSpecialists(sp);
      setServices(sv);
    } catch { toast.error("Error cargando datos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [weekStart, branch]);

  const goPrev = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d);
  };
  const goNext = () => {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d);
  };
  const goToday = () => setWeekStart(startOfWeek(new Date()));

  const getApptsFor = (dateStr, hour) =>
    appointments.filter(
      (a) =>
        a.date === dateStr &&
        parseInt(a.start_time.split(":")[0]) === hour &&
        (filterSpecialist === "all" || a.specialist_id === filterSpecialist)
    );

  const findSp = (id) => specialists.find((s) => s.id === id);

  const fmtRange = () => {
    const end = new Date(weekStart); end.setDate(end.getDate() + 6);
    const f = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return `${f(weekStart)} — ${f(end)}`;
  };

  return (
    <div data-testid="weekly-agenda-page">
      <PageHeader
        eyebrow="VISTA SEMANAL"
        title="Agenda"
        italic="semanal"
        description="Vista calendario de toda la semana. Navegue entre semanas con las flechas."
        action={
          <div className="flex items-center gap-2">
            <button onClick={goPrev} data-testid="week-prev"
              className="btn-invert border border-black h-12 w-12 flex items-center justify-center hover:bg-black hover:text-white">
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button onClick={goToday} data-testid="week-today"
              className="btn-invert border border-black h-12 px-4 font-mono-label text-[10px] hover:bg-black hover:text-white">
              HOY
            </button>
            <button onClick={goNext} data-testid="week-next"
              className="btn-invert border border-black h-12 w-12 flex items-center justify-center hover:bg-black hover:text-white">
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        }
      />

      <div className="px-6 lg:px-12 py-4 border-b border-neutral-200">
        <div className="font-mono-label text-[10px] text-neutral-500">SEMANA EN CURSO</div>
        <div className="font-serif-display text-3xl mt-1" data-testid="week-range">{fmtRange()}</div>
      </div>

      <SpecialistFilter
        specialists={specialists}
        value={filterSpecialist}
        onChange={setFilterSpecialist}
      />

      <div className="p-6 lg:p-12">
        {loading ? (
          <div className="text-center py-20 font-mono-label text-xs text-neutral-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto border border-black">
            <table className="w-full border-collapse text-xs" data-testid="weekly-grid">
              <thead>
                <tr>
                  <th className="border-b border-r border-neutral-300 p-2 w-16 font-mono-label text-[9px] text-neutral-500">HORA</th>
                  {days.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <th key={i} className={`border-b border-r border-neutral-300 last:border-r-0 p-3 text-left ${isToday ? "bg-black text-white" : ""}`}>
                        <div className="font-mono-label text-[9px] opacity-70">{DAYS_ES[i]}</div>
                        <div className="font-serif-display text-2xl leading-none mt-1">{d.getDate()}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td className="border-b border-r border-neutral-200 p-2 align-top font-mono-label text-[9px] text-neutral-500">
                      {String(h).padStart(2, "0")}:00
                    </td>
                    {days.map((d, i) => {
                      const ds = d.toISOString().slice(0, 10);
                      const items = getApptsFor(ds, h);
                      return (
                        <td key={i} className="border-b border-r border-neutral-200 last:border-r-0 p-1 align-top min-h-[60px] h-[60px]">
                          <div className="space-y-1">
                            {items.map((a) => {
                              const sp = findSp(a.specialist_id);
                              const cls = a.status === "En curso" ? "bg-black text-white" :
                                          a.status === "Finalizada" ? "bg-neutral-100 text-neutral-400 line-through" :
                                          "bg-white border border-black";
                              return (
                                <div key={a.id} data-testid={`week-appt-${a.id}`}
                                     className={`${cls} p-1.5 text-[10px] leading-tight`}>
                                  <div className="font-mono-label text-[8px] opacity-70">{a.start_time}</div>
                                  <div className="font-medium truncate">{a.client_name}</div>
                                  <div className="opacity-70 truncate">{sp?.name?.split(" ")[0]}</div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
