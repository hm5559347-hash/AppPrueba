import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import SpecialistFilter from "../components/SpecialistFilter";
import { fetchAppointments, fetchSpecialists, fetchServices, updateAppointmentStatus, deleteAppointment } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Plus, Clock, User, Trash2, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 08..20

const STATUS_STYLES = {
  Confirmada: "bg-white border-black text-black",
  "En curso": "bg-black border-black text-white",
  Finalizada: "bg-neutral-200 border-neutral-400 text-neutral-500 line-through",
};

export default function DailyAgenda() {
  const [appointments, setAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialist, setFilterSpecialist] = useState("all");
  const navigate = useNavigate();
  const { branch } = useAuth();

  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    if (!branch) return;
    setLoading(true);
    try {
      const [a, sp, sv] = await Promise.all([
        fetchAppointments({ date: today, branch_id: branch.id }),
        fetchSpecialists({ branch_id: branch.id }),
        fetchServices(),
      ]);
      setAppointments(a);
      setSpecialists(sp);
      setServices(sv);
    } catch (e) {
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [branch]);

  const findSpecialist = (id) => specialists.find((s) => s.id === id);
  const findService = (id) => services.find((s) => s.id === id);

  const filteredAppointments = useMemo(() => {
    if (filterSpecialist === "all") return appointments;
    return appointments.filter((a) => a.specialist_id === filterSpecialist);
  }, [appointments, filterSpecialist]);

  const grouped = useMemo(() => {
    const map = {};
    HOURS.forEach((h) => (map[h] = []));
    filteredAppointments.forEach((a) => {
      const h = parseInt(a.start_time.split(":")[0]);
      if (map[h]) map[h].push(a);
    });
    return map;
  }, [filteredAppointments]);

  const changeStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Cita ${status.toLowerCase()}`);
      load();
    } catch { toast.error("No se pudo actualizar"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    try {
      await deleteAppointment(id);
      toast.success("Cita eliminada");
      load();
    } catch { toast.error("No se pudo eliminar"); }
  };

  const stats = {
    total: filteredAppointments.length,
    enCurso: filteredAppointments.filter((a) => a.status === "En curso").length,
    finalizadas: filteredAppointments.filter((a) => a.status === "Finalizada").length,
  };

  const activeSpecialist = specialists.find((s) => s.id === filterSpecialist);

  return (
    <div data-testid="daily-agenda-page">
      <PageHeader
        eyebrow={activeSpecialist ? `CITAS DE ${activeSpecialist.name.toUpperCase()}` : "VISTA DIARIA"}
        title="Agenda"
        italic="del día"
        description={
          activeSpecialist
            ? `Citas asignadas a ${activeSpecialist.name} (${activeSpecialist.specialty}) para hoy.`
            : "Citas programadas para hoy, organizadas por hora. Filtre por especialista para ver sus citas."
        }
        action={
          <button
            data-testid="header-new-appointment-btn"
            onClick={() => navigate("/nueva-cita")}
            className="btn-invert border border-black bg-black text-white px-6 py-3 font-mono-label text-[10px] hover:bg-white hover:text-black flex items-center gap-2"
          >
            <Plus className="w-3 h-3" strokeWidth={2} />
            Nueva Cita
          </button>
        }
      />

      <SpecialistFilter
        specialists={specialists}
        value={filterSpecialist}
        onChange={setFilterSpecialist}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 border-b border-black">
        {[
          { label: "Citas hoy", value: stats.total, testid: "stat-total" },
          { label: "En curso", value: stats.enCurso, testid: "stat-active" },
          { label: "Finalizadas", value: stats.finalizadas, testid: "stat-done" },
        ].map((s, i) => (
          <div key={s.label} data-testid={s.testid}
               className={`p-6 lg:p-8 ${i < 2 ? "border-r border-neutral-200" : ""}`}>
            <div className="font-mono-label text-[10px] text-neutral-500">{s.label}</div>
            <div className="font-serif-display text-5xl lg:text-6xl mt-2 leading-none">
              {String(s.value).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="p-6 lg:p-12">
        {loading ? (
          <div className="text-center py-20 font-mono-label text-xs text-neutral-500">Cargando...</div>
        ) : appointments.length === 0 ? (
          <div className="border border-black p-12 text-center" data-testid="empty-state">
            <div className="font-serif-display text-3xl mb-2">Sin citas para hoy</div>
            <p className="text-sm text-neutral-600 mb-6">Comience agregando una nueva cita.</p>
            <button
              onClick={() => navigate("/nueva-cita")}
              className="btn-invert border border-black bg-black text-white px-6 py-3 font-mono-label text-[10px] hover:bg-white hover:text-black"
              data-testid="empty-new-appointment-btn"
            >
              + Nueva Cita
            </button>
          </div>
        ) : (
          <div className="space-y-1" data-testid="timeline">
            {HOURS.map((h) => {
              const items = grouped[h] || [];
              return (
                <div key={h} className="grid grid-cols-[80px_1fr] gap-6 border-t border-neutral-200 py-4 first:border-t-0">
                  <div className="font-serif-display text-3xl text-neutral-400 leading-none pt-1">
                    {String(h).padStart(2, "0")}<span className="text-base align-top">:00</span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="h-12 border-l border-dashed border-neutral-300" />
                    ) : (
                      items
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((a) => {
                          const sp = findSpecialist(a.specialist_id);
                          const sv = findService(a.service_id);
                          return (
                            <div
                              key={a.id}
                              data-testid={`appointment-card-${a.id}`}
                              className={`group border ${STATUS_STYLES[a.status]} p-4 lg:p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start transition-colors`}
                            >
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                                  <span className="font-mono-label text-[10px]">
                                    {a.start_time} — {a.end_time}
                                  </span>
                                  <span className="font-mono-label text-[10px] opacity-70">·</span>
                                  <span className="font-mono-label text-[10px]">{a.status}</span>
                                </div>
                                <div className="font-serif-display text-2xl lg:text-3xl leading-tight">
                                  {a.client_name}
                                </div>
                                <div className="text-sm mt-1 opacity-80">
                                  {sv?.name || "—"} · <span className="opacity-70">{sp?.name || "—"}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {a.status === "Confirmada" && (
                                  <button
                                    onClick={() => changeStatus(a.id, "En curso")}
                                    data-testid={`start-${a.id}`}
                                    className="btn-invert border border-current px-3 py-2 font-mono-label text-[9px] hover:bg-current hover:text-white flex items-center gap-1"
                                  >
                                    <Play className="w-3 h-3" strokeWidth={1.5} /> Iniciar
                                  </button>
                                )}
                                {a.status === "En curso" && (
                                  <button
                                    onClick={() => changeStatus(a.id, "Finalizada")}
                                    data-testid={`finish-${a.id}`}
                                    className="btn-invert border border-current px-3 py-2 font-mono-label text-[9px] hover:bg-white hover:text-black flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> Finalizar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(a.id)}
                                  data-testid={`delete-${a.id}`}
                                  className="btn-invert border border-current/50 p-2 hover:bg-current hover:text-white"
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
