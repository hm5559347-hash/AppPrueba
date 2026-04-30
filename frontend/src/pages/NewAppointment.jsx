import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { createAppointment, fetchSpecialists, fetchServices, fetchAppointments } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Check } from "lucide-react";

function timeToMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTime(m) {
  const h = Math.floor(m / 60); const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function NewAppointment() {
  const navigate = useNavigate();
  const { branch } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [specialistId, setSpecialistId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!branch) return;
    Promise.all([fetchSpecialists({ branch_id: branch.id }), fetchServices()]).then(([sp, sv]) => {
      setSpecialists(sp); setServices(sv);
    }).catch(() => toast.error("Error cargando datos"));
  }, [branch]);

  useEffect(() => {
    if (specialistId && date && branch) {
      fetchAppointments({ date, branch_id: branch.id }).then((a) =>
        setAppointments(a.filter((x) => x.specialist_id === specialistId))
      );
    } else {
      setAppointments([]);
    }
  }, [specialistId, date, branch]);

  const sp = specialists.find((s) => s.id === specialistId);
  const sv = services.find((s) => s.id === serviceId);

  // Generate available time slots based on specialist schedule + service duration, every 30 min
  const slots = (() => {
    if (!sp || !sv) return [];
    const start = timeToMin(sp.start_time);
    const end = timeToMin(sp.end_time);
    const dur = sv.duration_minutes;
    const out = [];
    for (let t = start; t + dur <= end; t += 30) {
      const slotStart = t;
      const slotEnd = t + dur;
      const conflict = appointments.some((a) => {
        const aS = timeToMin(a.start_time);
        const aE = timeToMin(a.end_time);
        return slotStart < aE && aS < slotEnd;
      });
      out.push({ time: minToTime(slotStart), conflict });
    }
    return out;
  })();

  const submit = async (e) => {
    e.preventDefault();
    if (!specialistId || !serviceId || !clientName || !date || !startTime) {
      toast.error("Complete todos los campos");
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        specialist_id: specialistId,
        service_id: serviceId,
        client_name: clientName,
        date,
        start_time: startTime,
      });
      toast.success("Cita registrada");
      navigate("/agenda");
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo crear la cita");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="new-appointment-page">
      <PageHeader
        eyebrow="REGISTRO"
        title="Nueva"
        italic="Cita"
        description="Seleccione especialista, servicio y horario disponible. El sistema previene conflictos automáticamente."
      />

      <form onSubmit={submit} className="p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl">
        {/* Step 1: Specialist */}
        <div data-testid="step-specialist">
          <div className="font-mono-label text-[10px] text-neutral-500 mb-4">01 · Especialista</div>
          <div className="space-y-2">
            {specialists.map((s) => (
              <button
                key={s.id}
                type="button"
                data-testid={`specialist-option-${s.id}`}
                onClick={() => { setSpecialistId(s.id); setStartTime(""); }}
                className={`w-full text-left border p-4 btn-invert flex items-center gap-3 ${
                  specialistId === s.id ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"
                }`}
              >
                {s.avatar_url && (
                  <img src={s.avatar_url} alt="" className="w-12 h-12 object-cover grayscale border border-current/20" />
                )}
                <div className="flex-1">
                  <div className="font-serif-display text-xl leading-none">{s.name}</div>
                  <div className="text-[11px] opacity-70 mt-1">{s.specialty}</div>
                  <div className="font-mono-label text-[9px] opacity-60 mt-1">{s.start_time} — {s.end_time}</div>
                </div>
                {specialistId === s.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Service */}
        <div data-testid="step-service">
          <div className="font-mono-label text-[10px] text-neutral-500 mb-4">02 · Servicio</div>
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                data-testid={`service-option-${s.id}`}
                onClick={() => { setServiceId(s.id); setStartTime(""); }}
                className={`w-full text-left border p-4 btn-invert ${
                  serviceId === s.id ? "border-black bg-black text-white" : "border-neutral-300 hover:border-black"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <div className="font-serif-display text-xl leading-none">{s.name}</div>
                  <div className="font-mono-label text-[10px]">${s.cost}</div>
                </div>
                <div className="font-mono-label text-[9px] opacity-60 mt-2">{s.duration_minutes} MIN</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Client + date + time */}
        <div data-testid="step-details">
          <div className="font-mono-label text-[10px] text-neutral-500 mb-4">03 · Detalles</div>
          <div className="space-y-5">
            <div>
              <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">CLIENTE</label>
              <input
                data-testid="client-name-input"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full border border-black px-4 py-3 bg-white outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 font-serif-display text-lg"
              />
            </div>
            <div>
              <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">FECHA</label>
              <input
                data-testid="date-input"
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setDate(e.target.value); setStartTime(""); }}
                className="w-full border border-black px-4 py-3 bg-white outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 font-mono-label text-xs"
              />
            </div>
            <div>
              <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">HORARIO DISPONIBLE</label>
              {!sp || !sv ? (
                <div className="text-xs text-neutral-500 border border-dashed border-neutral-300 p-4">
                  Seleccione especialista y servicio.
                </div>
              ) : slots.length === 0 ? (
                <div className="text-xs text-neutral-500 border border-dashed border-neutral-300 p-4">
                  No hay turnos disponibles.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto" data-testid="slots-grid">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      data-testid={`slot-${s.time}`}
                      disabled={s.conflict}
                      onClick={() => setStartTime(s.time)}
                      className={`btn-invert border py-2 px-2 font-mono-label text-[10px] ${
                        s.conflict
                          ? "border-neutral-200 text-neutral-300 line-through cursor-not-allowed"
                          : startTime === s.time
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 hover:border-black"
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {sv && startTime && (
              <div className="border border-black p-4 bg-neutral-50" data-testid="summary">
                <div className="font-mono-label text-[9px] text-neutral-500 mb-2">RESUMEN</div>
                <div className="text-sm">
                  <strong>{startTime}</strong> — {minToTime(timeToMin(startTime) + sv.duration_minutes)}
                </div>
                <div className="text-xs text-neutral-600 mt-1">{sv.name} · {sp?.name}</div>
                <div className="text-xs text-neutral-600">Costo: ${sv.cost}</div>
              </div>
            )}

            <button
              type="submit"
              data-testid="submit-appointment-btn"
              disabled={submitting}
              className="btn-invert w-full border border-black bg-black text-white py-4 font-mono-label text-[10px] hover:bg-white hover:text-black disabled:opacity-50"
            >
              {submitting ? "REGISTRANDO..." : "CONFIRMAR CITA"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
