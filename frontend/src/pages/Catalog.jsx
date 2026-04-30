import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  fetchServices, createService, updateService, deleteService,
  fetchSpecialists, createSpecialist, updateSpecialist, deleteSpecialist,
  fetchBranches, createBranch, updateBranch, deleteBranch,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, MapPin } from "lucide-react";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="modal">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-black p-5">
          <h3 className="font-serif-display text-2xl">{title}</h3>
          <button onClick={onClose} data-testid="modal-close" className="btn-invert border border-black w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ServiceForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { name: "", duration_minutes: 60, description: "" });
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({
      name: form.name,
      duration_minutes: parseInt(form.duration_minutes),
      description: form.description || "",
    }); }} className="space-y-4">
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">NOMBRE</label>
        <input data-testid="service-name-input" required type="text" value={form.name}
          onChange={(e) => upd("name", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none font-serif-display text-lg" />
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">DURACIÓN (MIN)</label>
        <input data-testid="service-duration-input" required type="number" min="5" step="5" value={form.duration_minutes}
          onChange={(e) => upd("duration_minutes", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none font-mono-label text-xs" />
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">DESCRIPCIÓN</label>
        <textarea data-testid="service-description-input" rows={2} value={form.description || ""}
          onChange={(e) => upd("description", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none text-sm" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="btn-invert flex-1 border border-black py-3 font-mono-label text-[10px] hover:bg-black hover:text-white">CANCELAR</button>
        <button type="submit" data-testid="service-submit-btn"
          className="btn-invert flex-1 border border-black bg-black text-white py-3 font-mono-label text-[10px] hover:bg-white hover:text-black">GUARDAR</button>
      </div>
    </form>
  );
}

function SpecialistForm({ initial, onSubmit, onCancel, branches, defaultBranchId }) {
  const [form, setForm] = useState(initial || {
    name: "", specialty: "", start_time: "09:00", end_time: "18:00",
    avatar_url: "", access_code: "", branch_id: defaultBranchId || "",
  });
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">NOMBRE</label>
        <input data-testid="specialist-name-input" required type="text" value={form.name}
          onChange={(e) => upd("name", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none font-serif-display text-lg" />
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">ESPECIALIDAD</label>
        <input data-testid="specialist-specialty-input" required type="text" value={form.specialty}
          onChange={(e) => upd("specialty", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none text-sm" />
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">SUCURSAL</label>
        <select data-testid="specialist-branch-select" required value={form.branch_id || ""}
          onChange={(e) => upd("branch_id", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none text-sm bg-white">
          <option value="">— Seleccione sucursal —</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">ENTRADA</label>
          <input data-testid="specialist-start-input" required type="time" value={form.start_time}
            onChange={(e) => upd("start_time", e.target.value)}
            className="w-full border border-black px-4 py-3 outline-none font-mono-label text-xs" />
        </div>
        <div>
          <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">SALIDA</label>
          <input data-testid="specialist-end-input" required type="time" value={form.end_time}
            onChange={(e) => upd("end_time", e.target.value)}
            className="w-full border border-black px-4 py-3 outline-none font-mono-label text-xs" />
        </div>
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">
          CÓDIGO DE ACCESO (4 DÍGITOS)
        </label>
        <input data-testid="specialist-access-code-input" type="text" inputMode="numeric" maxLength={4}
          value={form.access_code || ""}
          onChange={(e) => upd("access_code", e.target.value.replace(/\D/g, ""))}
          placeholder="Ej: 1001"
          className="w-full border border-black px-4 py-3 outline-none font-mono-label text-sm tracking-[0.3em]" />
        <p className="font-mono-label text-[9px] text-neutral-400 mt-1">
          Código que el especialista usará para consultar su agenda.
        </p>
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">URL AVATAR (OPCIONAL)</label>
        <input data-testid="specialist-avatar-input" type="url" value={form.avatar_url || ""}
          onChange={(e) => upd("avatar_url", e.target.value)}
          className="w-full border border-black px-4 py-3 outline-none text-xs" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="btn-invert flex-1 border border-black py-3 font-mono-label text-[10px] hover:bg-black hover:text-white">CANCELAR</button>
        <button type="submit" data-testid="specialist-submit-btn"
          className="btn-invert flex-1 border border-black bg-black text-white py-3 font-mono-label text-[10px] hover:bg-white hover:text-black">GUARDAR</button>
      </div>
    </form>
  );
}

function BranchForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { name: "", address: "" });
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">NOMBRE DE SUCURSAL</label>
        <input data-testid="branch-name-input" required type="text" value={form.name}
          onChange={(e) => upd("name", e.target.value)}
          placeholder="Ej: Manuel & Torres · Centro"
          className="w-full border border-black px-4 py-3 outline-none font-serif-display text-lg" />
      </div>
      <div>
        <label className="font-mono-label text-[9px] text-neutral-500 block mb-2">DIRECCIÓN</label>
        <input data-testid="branch-address-input" type="text" value={form.address || ""}
          onChange={(e) => upd("address", e.target.value)}
          placeholder="Ej: Av. Reforma 123"
          className="w-full border border-black px-4 py-3 outline-none text-sm" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="btn-invert flex-1 border border-black py-3 font-mono-label text-[10px] hover:bg-black hover:text-white">CANCELAR</button>
        <button type="submit" data-testid="branch-submit-btn"
          className="btn-invert flex-1 border border-black bg-black text-white py-3 font-mono-label text-[10px] hover:bg-white hover:text-black">GUARDAR</button>
      </div>
    </form>
  );
}

export default function Catalog() {
  const [tab, setTab] = useState("services");
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editing, setEditing] = useState(null); // { type, item }
  const [creating, setCreating] = useState(null); // type
  const { branch } = useAuth();

  const load = async () => {
    try {
      const [sv, sp, br] = await Promise.all([fetchServices(), fetchSpecialists(), fetchBranches()]);
      setServices(sv); setSpecialists(sp); setBranches(br);
    } catch { toast.error("Error cargando datos"); }
  };
  useEffect(() => { load(); }, []);

  const findBranch = (id) => branches.find((b) => b.id === id);

  const handleServiceSubmit = async (data) => {
    try {
      if (editing?.type === "service") await updateService(editing.item.id, data);
      else await createService(data);
      toast.success("Servicio guardado");
      setEditing(null); setCreating(null); load();
    } catch { toast.error("No se pudo guardar"); }
  };
  const handleSpecialistSubmit = async (data) => {
    try {
      if (!data.branch_id) {
        toast.error("Seleccione una sucursal");
        return;
      }
      if (editing?.type === "specialist") await updateSpecialist(editing.item.id, data);
      else await createSpecialist(data);
      toast.success("Especialista guardado");
      setEditing(null); setCreating(null); load();
    } catch { toast.error("No se pudo guardar"); }
  };
  const handleBranchSubmit = async (data) => {
    try {
      if (editing?.type === "branch") await updateBranch(editing.item.id, data);
      else await createBranch(data);
      toast.success("Sucursal guardada");
      setEditing(null); setCreating(null); load();
    } catch { toast.error("No se pudo guardar"); }
  };
  const removeService = async (id) => {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    try { await deleteService(id); toast.success("Eliminado"); load(); }
    catch { toast.error("Error al eliminar"); }
  };
  const removeSpecialist = async (id) => {
    if (!window.confirm("¿Eliminar este especialista?")) return;
    try { await deleteSpecialist(id); toast.success("Eliminado"); load(); }
    catch { toast.error("Error al eliminar"); }
  };
  const removeBranch = async (id) => {
    if (!window.confirm("¿Eliminar esta sucursal? No podrá eliminarla si tiene especialistas o citas.")) return;
    try { await deleteBranch(id); toast.success("Eliminada"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Error al eliminar"); }
  };

  const filteredSpecialists = specialists.filter((s) =>
    !branch ? true : s.branch_id === branch.id
  );

  const tabBtnClass = (active) =>
    `btn-invert px-6 lg:px-8 py-4 font-mono-label text-[10px] border-r border-neutral-200 ${
      active ? "bg-black text-white" : "hover:bg-neutral-100"
    }`;

  const addLabel = tab === "services" ? "Servicio" : tab === "specialists" ? "Especialista" : "Sucursal";

  return (
    <div data-testid="catalog-page">
      <PageHeader
        eyebrow="PANEL DE CONTROL"
        title="Catálogo &"
        italic="Equipo"
        description={branch
          ? `Gestione servicios, equipo y sucursales. Los especialistas mostrados corresponden a ${branch.name}.`
          : "Administre los servicios, sucursales y equipo del salón."}
      />

      {/* Tabs */}
      <div className="border-b border-black flex overflow-x-auto">
        <button data-testid="tab-services" onClick={() => setTab("services")} className={tabBtnClass(tab === "services")}>
          Servicios ({services.length})
        </button>
        <button data-testid="tab-specialists" onClick={() => setTab("specialists")} className={tabBtnClass(tab === "specialists")}>
          Especialistas ({filteredSpecialists.length})
        </button>
        <button data-testid="tab-branches" onClick={() => setTab("branches")} className={tabBtnClass(tab === "branches")}>
          Sucursales ({branches.length})
        </button>
        <div className="flex-1" />
        <button
          data-testid="add-new-btn"
          onClick={() => setCreating(tab === "services" ? "service" : tab === "specialists" ? "specialist" : "branch")}
          className="btn-invert px-6 py-4 bg-black text-white font-mono-label text-[10px] hover:bg-white hover:text-black hover:border hover:border-black flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-3 h-3" /> Agregar {addLabel}
        </button>
      </div>

      <div className="p-6 lg:p-12">
        {tab === "services" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="services-grid">
            {services.map((s) => (
              <div key={s.id} data-testid={`service-card-${s.id}`}
                   className="border border-black p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-mono-label text-[9px] text-neutral-500">SERVICIO</div>
                  <div className="font-serif-display text-xl">${s.cost}</div>
                </div>
                <h3 className="font-serif-display text-3xl leading-tight">{s.name}</h3>
                <div className="font-mono-label text-[9px] text-neutral-500 mt-2">{s.duration_minutes} MIN</div>
                {s.description && <p className="text-xs text-neutral-600 mt-3 flex-1">{s.description}</p>}
                <div className="flex gap-2 mt-6">
                  <button data-testid={`edit-service-${s.id}`} onClick={() => setEditing({ type: "service", item: s })}
                    className="btn-invert flex-1 border border-black py-2 font-mono-label text-[9px] hover:bg-black hover:text-white flex items-center justify-center gap-2">
                    <Pencil className="w-3 h-3" /> EDITAR
                  </button>
                  <button data-testid={`delete-service-${s.id}`} onClick={() => removeService(s.id)}
                    className="btn-invert border border-black w-10 hover:bg-black hover:text-white flex items-center justify-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : tab === "specialists" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="specialists-grid">
            {filteredSpecialists.map((s) => {
              const br = findBranch(s.branch_id);
              return (
                <div key={s.id} data-testid={`specialist-card-${s.id}`}
                     className="border border-black overflow-hidden flex flex-col">
                  {s.avatar_url ? (
                    <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                      <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover grayscale" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                      <span className="font-serif-display text-6xl text-neutral-300">
                        {s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="font-mono-label text-[9px] text-neutral-500">ESPECIALISTA</div>
                    <h3 className="font-serif-display text-2xl mt-1">{s.name}</h3>
                    <p className="text-xs text-neutral-600 mt-1">{s.specialty}</p>
                    {br && (
                      <div className="font-mono-label text-[9px] text-neutral-500 mt-3 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {br.name.replace(/^Manuel & Torres · /, "")}
                      </div>
                    )}
                    <div className="font-mono-label text-[9px] text-neutral-500 mt-1">
                      {s.start_time} — {s.end_time}
                    </div>
                    {s.access_code && (
                      <div className="font-mono-label text-[9px] text-neutral-500 mt-1">
                        CÓDIGO · <span className="text-black tracking-[0.3em]" data-testid={`specialist-code-${s.id}`}>{s.access_code}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button data-testid={`edit-specialist-${s.id}`} onClick={() => setEditing({ type: "specialist", item: s })}
                        className="btn-invert flex-1 border border-black py-2 font-mono-label text-[9px] hover:bg-black hover:text-white flex items-center justify-center gap-2">
                        <Pencil className="w-3 h-3" /> EDITAR
                      </button>
                      <button data-testid={`delete-specialist-${s.id}`} onClick={() => removeSpecialist(s.id)}
                        className="btn-invert border border-black w-10 hover:bg-black hover:text-white flex items-center justify-center">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="branches-grid-admin">
            {branches.map((b, i) => {
              const count = specialists.filter((s) => s.branch_id === b.id).length;
              return (
                <div key={b.id} data-testid={`branch-card-${b.id}`} className="border border-black p-6 flex flex-col">
                  <div className="font-mono-label text-[9px] text-neutral-500">
                    SUCURSAL {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-serif-display text-3xl leading-tight mt-2">{b.name}</h3>
                  {b.address && (
                    <div className="flex items-start gap-2 mt-3 text-xs text-neutral-600">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={1.5} />
                      <span>{b.address}</span>
                    </div>
                  )}
                  <div className="font-mono-label text-[9px] text-neutral-500 mt-4">
                    {count} ESPECIALISTA{count !== 1 ? "S" : ""}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button data-testid={`edit-branch-${b.id}`} onClick={() => setEditing({ type: "branch", item: b })}
                      className="btn-invert flex-1 border border-black py-2 font-mono-label text-[9px] hover:bg-black hover:text-white flex items-center justify-center gap-2">
                      <Pencil className="w-3 h-3" /> EDITAR
                    </button>
                    <button data-testid={`delete-branch-${b.id}`} onClick={() => removeBranch(b.id)}
                      className="btn-invert border border-black w-10 hover:bg-black hover:text-white flex items-center justify-center">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={creating === "service" || editing?.type === "service"}
             onClose={() => { setCreating(null); setEditing(null); }}
             title={editing ? "Editar servicio" : "Nuevo servicio"}>
        <ServiceForm
          initial={editing?.item}
          onSubmit={handleServiceSubmit}
          onCancel={() => { setCreating(null); setEditing(null); }}
        />
      </Modal>

      <Modal open={creating === "specialist" || editing?.type === "specialist"}
             onClose={() => { setCreating(null); setEditing(null); }}
             title={editing ? "Editar especialista" : "Nuevo especialista"}>
        <SpecialistForm
          initial={editing?.item}
          branches={branches}
          defaultBranchId={branch?.id}
          onSubmit={handleSpecialistSubmit}
          onCancel={() => { setCreating(null); setEditing(null); }}
        />
      </Modal>

      <Modal open={creating === "branch" || editing?.type === "branch"}
             onClose={() => { setCreating(null); setEditing(null); }}
             title={editing ? "Editar sucursal" : "Nueva sucursal"}>
        <BranchForm
          initial={editing?.item}
          onSubmit={handleBranchSubmit}
          onCancel={() => { setCreating(null); setEditing(null); }}
        />
      </Modal>
    </div>
  );
}
