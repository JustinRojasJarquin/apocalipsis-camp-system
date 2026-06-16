import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, Building2, Compass, Eye, LogOut, MapPin, Package,
  Pencil, Plus, ShieldAlert, Trash2, Users, ClipboardCheck, Check, X,
  PlusCircle, AlertTriangle, CheckCircle, Play, XCircle, UserPlus, Box,
  Truck, FileText, Activity, Hash, Shield, KeyRound, BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCampamentos, deleteCampamento } from "../features/campamentos/campamentos.api";
import CampamentosForm from "../features/campamentos/components/CampamentosForm";
import type { Campamento } from "../features/campamentos/types";
import { getPersonas, deletePersona, getCargos, getEstados, assignCargoByIA } from "../features/personas/personas.api";
import type { Persona, PersonaCargo, PersonaEstado, CargoIARecommendation } from "../features/personas/types";
import PersonaForm from "../features/personas/components/PersonaForm";
import CargosManager from "../features/personas/components/CargosManager";
import EstadosManager from "../features/personas/components/EstadosManager";
import { getResources, createResource, updateResource, deleteResource } from "../features/inventario/inventario.api";
import type { InventarioResource } from "../features/inventario/types";
import { listarExploraciones, actualizarEstado, eliminarExploracion } from "../features/exploraciones/exploraciones.api";
import type { Exploracion, ExploracionEstado } from "../features/exploraciones/types";
import ExploracionForm from "../features/exploraciones/components/ExploracionForm";
import AsignarPersonas from "../features/exploraciones/components/AsignarPersonas";
import RecursosMision from "../features/exploraciones/components/RecursosMision";
import { getEvaluaciones, createEvaluacionIngreso, updateEvaluacionDecision } from "../features/evaluaciones/evaluaciones.api";
import type { EvaluacionIngreso } from "../features/evaluaciones/types";
import { getUsuarios, createUsuario, changeUsuarioEstado, resetUsuarioPassword } from "../features/usuarios/usuarios.api";
import type { UsuarioSistema } from "../features/usuarios/usuarios.api";
import { getRoles, createRol, updateRol, changeUserRole } from "../features/roles/roles.api";
import type { Rol } from "../features/roles/roles.api";
import { getRecursos, createRecurso, updateRecurso, deleteRecurso } from "../features/recursos/recursos.api";
import type { RecursoItem } from "../features/recursos/types";
import { useAuth } from "../shared/hooks/useAuth";
import { storage } from "../shared/utils/storage";
import { PageModal } from "../shared/components/PageModal";
import EnviosPage from "../features/envios/pages/EnviosPage";
import SolicitudesPage from "../features/solicitudes/pages/SolicitudesPage";

type SysTab = "campamentos" | "roles" | "usuarios" | "recursos";
type CampTab = "detalle" | "personas" | "cargos" | "estados" | "cargoIA" | "inventario" | "exploraciones" | "evaluaciones" | "envios" | "solicitudes";

function AccesoSistemaPage() {
  const { usuario } = useAuth();
  const rolCodigo = usuario?.rol?.codigo ?? "";
  const [sysTab, setSysTab] = useState<SysTab>("campamentos");
  const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
  const [campTab, setCampTab] = useState<CampTab>("detalle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campamentos, setCampamentos] = useState<Campamento[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargos, setCargos] = useState<PersonaCargo[]>([]);
  const [estadosPer, setEstadosPer] = useState<PersonaEstado[]>([]);
  const [inventario, setInventario] = useState<InventarioResource[]>([]);
  const [exploraciones, setExploraciones] = useState<Exploracion[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionIngreso[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [recursos, setRecursos] = useState<RecursoItem[]>([]);
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [personaEditando, setPersonaEditando] = useState<Persona | null>(null);
  const [isDeletingPersonaId, setIsDeletingPersonaId] = useState<number | null>(null);
  const [showInvForm, setShowInvForm] = useState(false);
  const [invForm, setInvForm] = useState({ resourceId: 0, quantity: 0, minThreshold: 0 });
  const [invEditingKey, setInvEditingKey] = useState<string | null>(null);
  const [isSavingInv, setIsSavingInv] = useState(false);
  const [deletingInvKey, setDeletingInvKey] = useState<string | null>(null);
  const [showExploracionForm, setShowExploracionForm] = useState(false);
  const [exploracionDetalle, setExploracionDetalle] = useState<Exploracion | null>(null);
  const [vistaDetalleExp, setVistaDetalleExp] = useState<"personas" | "recursos" | null>(null);
  const [showConfirmDeleteExp, setShowConfirmDeleteExp] = useState(false);
  const [expAEliminar, setExpAEliminar] = useState<Exploracion | null>(null);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [evalPersonaId, setEvalPersonaId] = useState(0);
  const [evalCreating, setEvalCreating] = useState(false);
  const [evalFormDecision, setEvalFormDecision] = useState<Record<number, { comentarios: string; loading: boolean }>>({});
  const [showRolForm, setShowRolForm] = useState(false);
  const [rolForm, setRolForm] = useState({ nombre: "", codigo: "" });
  const [rolEditingId, setRolEditingId] = useState<number | null>(null);
  const [isSavingRol, setIsSavingRol] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ usuario: "", password: "", id_rol: 0, id_persona: 0 });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState<number | null>(null);
  const [resetPwdValue, setResetPwdValue] = useState("");
  const [showRecursoForm, setShowRecursoForm] = useState(false);
  const [recursoForm, setRecursoForm] = useState({ nombre: "", categoria: "COMIDA", unidad: "" });
  const [recursoEditingId, setRecursoEditingId] = useState<number | null>(null);
  const [isSavingRecurso, setIsSavingRecurso] = useState(false);
  const [deletingRecursoId, setDeletingRecursoId] = useState<number | null>(null);
  const [iaSelectedPersona, setIaSelectedPersona] = useState<number>(0);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState<CargoIARecommendation | null>(null);
  const [iaError, setIaError] = useState<string | null>(null);

  const campamentosActivos = campamentos.filter((c) => c.activo !== false);
  const selectedCamp = campamentosActivos.find((c) => c.id_campamento === selectedCampId);
  const personasCamp = selectedCampId ? personas.filter((p) => p.activo !== false && p.id_campamento === selectedCampId) : [];
  const inventarioCamp = selectedCampId ? inventario.filter((r) => r.campId === selectedCampId) : [];
  const exploracionesCamp = selectedCampId ? exploraciones.filter((e) => e.id_campamento === selectedCampId) : [];
  const evaluacionesCamp = selectedCampId ? evaluaciones.filter((e) => e.id_campamento === selectedCampId) : [];
  const iaPersona = personasCamp.find((p) => p.id_persona === iaSelectedPersona) ?? null;
  const categorias = ["COMIDA", "AGUA", "HIGIENE", "DEFENSA", "MUNICION", "MEDICINA", "OTRO"];

  const loadCampData = async (campId: number) => {
    const [i, e, ev, rc] = await Promise.all([
      getResources(campId).catch(() => [] as InventarioResource[]),
      listarExploraciones(campId).catch(() => [] as Exploracion[]),
      getEvaluaciones().catch(() => [] as EvaluacionIngreso[]),
      getRecursos().catch(() => [] as RecursoItem[]),
    ]);
    setInventario(i); setExploraciones(e); setEvaluaciones(ev); setRecursos(rc);
  };
  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [c, p, cg, es] = await Promise.all([getCampamentos(), getPersonas(), getCargos(), getEstados()]);
      setCampamentos(c); setPersonas(p); setCargos(cg); setEstadosPer(es);
      if (selectedCampId) await loadCampData(selectedCampId);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };
  const loadSystemData = async () => {
    try {
      const [r, u, rc] = await Promise.all([getRoles(), getUsuarios(), getRecursos()]);
      setRoles(r); setUsuarios(u); setRecursos(rc);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  };
  useEffect(() => { void loadAll(); }, [selectedCampId]);

  const goToCamp = (id: number) => { setSelectedCampId(id); setCampTab("detalle"); };
  const goBack = () => { setSelectedCampId(null); setCampTab("detalle"); };
  const handleLogout = () => { storage.clearAuth(); window.location.href = "/"; };

  const handleCreatePersona = () => { setPersonaEditando(null); setShowPersonaForm(true); };
  const handleEditPersona = (p: Persona) => { setPersonaEditando(p); setShowPersonaForm(true); };
  const handleDeletePersona = async (p: Persona) => {
    if (!p.id_persona) return;
    if (!window.confirm(`Desactivar a "${p.nombre} ${p.apellidos}"?`)) return;
    setIsDeletingPersonaId(p.id_persona);
    try { await deletePersona(p.id_persona); await loadAll(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setIsDeletingPersonaId(null); }
  };

  const handleInvChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInvForm((f) => ({ ...f, [e.target.name]: Number(e.target.value) }));
  };
  const handleEditInv = (r: InventarioResource) => {
    setInvForm({ resourceId: r.id, quantity: r.quantity, minThreshold: r.minThreshold });
    setInvEditingKey(`${r.campId}-${r.id}`); setShowInvForm(true);
  };
  const handleSaveInv = async (e: FormEvent) => {
    e.preventDefault(); setIsSavingInv(true); setError(null);
    try {
      if (invEditingKey) {
        const [campId, resourceId] = invEditingKey.split("-").map(Number);
        await updateResource(campId, resourceId, { quantity: invForm.quantity, minThreshold: invForm.minThreshold });
      } else {
        await createResource({ campId: selectedCampId!, resourceId: invForm.resourceId, quantity: invForm.quantity, minThreshold: invForm.minThreshold });
      }
      setShowInvForm(false); setInvEditingKey(null); setInvForm({ resourceId: 0, quantity: 0, minThreshold: 0 }); await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); } finally { setIsSavingInv(false); }
  };
  const handleDeleteInv = async (r: InventarioResource) => {
    if (!window.confirm(`Eliminar "${r.name}"?`)) return;
    const key = `${r.campId}-${r.id}`; setDeletingInvKey(key);
    try { await deleteResource(r.campId, r.id); await loadAll(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setDeletingInvKey(null); }
  };

  const handleExpCreated = () => { setShowExploracionForm(false); void loadAll(); };
  const handleExpEstado = async (exp: Exploracion, estado: ExploracionEstado) => {
    try { await actualizarEstado(exp.id_exploracion, estado); await loadAll(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  };
  const handleExpEliminar = (exp: Exploracion) => { setExpAEliminar(exp); setShowConfirmDeleteExp(true); };
  const confirmExpDelete = async () => {
    if (!expAEliminar) return;
    try { await eliminarExploracion(expAEliminar.id_exploracion); setExpAEliminar(null); setShowConfirmDeleteExp(false); await loadAll(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  };

  const handleCreateEval = async () => {
    if (!evalPersonaId) { setError("Selecciona una persona"); return; }
    setEvalCreating(true); setError(null);
    try { await createEvaluacionIngreso({ id_persona: evalPersonaId, id_campamento: selectedCampId! }); setShowEvalForm(false); setEvalPersonaId(0); await loadAll(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setEvalCreating(false); }
  };
  const handleEvalDecision = async (ev: EvaluacionIngreso, decision: "ACEPTADO" | "RECHAZADO") => {
    const state = evalFormDecision[ev.id_evaluacion] || { comentarios: "", loading: false };
    setEvalFormDecision((f) => ({ ...f, [ev.id_evaluacion]: { ...state, loading: true } }));
    try { await updateEvaluacionDecision(ev.id_evaluacion, { decision_final: decision, comentarios: state.comentarios }); await loadAll(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setEvalFormDecision((f) => ({ ...f, [ev.id_evaluacion]: { ...f[ev.id_evaluacion], loading: false } })); }
  };

  const handleSaveRol = async (e: FormEvent) => {
    e.preventDefault(); setIsSavingRol(true); setError(null);
    try { if (rolEditingId) { await updateRol(rolEditingId, rolForm); } else { await createRol(rolForm); } setShowRolForm(false); setRolEditingId(null); setRolForm({ nombre: "", codigo: "" }); await loadSystemData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); } finally { setIsSavingRol(false); }
  };
  const handleSaveUser = async (e: FormEvent) => {
    e.preventDefault(); setIsSavingUser(true); setError(null);
    try { await createUsuario({ ...userForm, password: userForm.password }); setShowUserForm(false); setUserForm({ usuario: "", password: "", id_rol: 0, id_persona: 0 }); await loadSystemData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); } finally { setIsSavingUser(false); }
  };
  const handleToggleUser = async (u: UsuarioSistema) => {
    try { await changeUsuarioEstado(u.id_usuario, !u.activo); await loadSystemData(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  };
  const handleResetPwd = async () => {
    if (!showResetPwd || !resetPwdValue) return;
    try { await resetUsuarioPassword(showResetPwd, resetPwdValue); setShowResetPwd(null); setResetPwdValue(""); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  };
  const handleSaveRecurso = async (e: FormEvent) => {
    e.preventDefault(); setIsSavingRecurso(true); setError(null);
    try { if (recursoEditingId) { await updateRecurso(recursoEditingId, recursoForm); } else { await createRecurso(recursoForm); } setShowRecursoForm(false); setRecursoEditingId(null); setRecursoForm({ nombre: "", categoria: "COMIDA", unidad: "" }); await loadSystemData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); } finally { setIsSavingRecurso(false); }
  };
  const handleDeleteRecurso = async (id: number) => {
    if (!window.confirm("Eliminar recurso del catálogo?")) return;
    setDeletingRecursoId(id);
    try { await deleteRecurso(id); await loadSystemData(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setDeletingRecursoId(null); }
  };

  const handleCargoIA = async () => {
    if (!iaSelectedPersona) { setIaError("Selecciona una persona"); return; }
    setIaLoading(true); setIaError(null); setIaResult(null);
    try {
      const result = await assignCargoByIA(iaSelectedPersona);
      setIaResult(result);
      await loadAll();
    } catch (err) { setIaError(err instanceof Error ? err.message : "No se pudo asignar cargo con IA."); }
    finally { setIaLoading(false); }
  };

  const formatDate = (v?: string | null) => {
    if (!v) return "—"; const d = v.slice(0, 10); const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d); return m ? `${Number(m[3])}/${Number(m[2])}/${m[1]}` : "—";
  };

  return (
    <div className="dashboard-page dashboard-page--biohazard">
      <div className="dashboard-scanline" aria-hidden="true" />
      <div className="dashboard-flicker" aria-hidden="true" />
      <div className="scroll-app" style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-topbar-brand"><ShieldAlert size={18} /><span>Acceso al sistema</span></div>
            <div className="admin-topbar-badge">{rolCodigo ? `Rol: ${rolCodigo}` : "Panel"}</div>
          </div>
          <div className="admin-topbar-center">
            {selectedCampId ? (
              <button type="button" className="btn btn--ghost btn--sm" onClick={goBack} style={{ color: "#9aa8a0" }}>
                <ArrowLeft size={14} /> Volver a sistema
              </button>
            ) : (
              <Link to="/dashboard" className="btn btn--ghost btn--sm" style={{ color: "#9aa8a0", textDecoration: "none" }}>
                <ArrowLeft size={14} /> Volver al panel
              </Link>
            )}
          </div>
          <div className="admin-topbar-right">
            <button type="button" className="admin-topbar-logout" onClick={handleLogout}><LogOut size={14} /> Salir</button>
          </div>
        </div>
        {error && <div className="section-error" style={{ marginBottom: 16 }}>{error}</div>}

        {!selectedCampId && (
          <>
            <section className="module-tabs" style={{ marginTop: 0 }}>
              <button type="button" className={`module-tab${sysTab === "campamentos" ? " module-tab--active" : ""}`} onClick={() => setSysTab("campamentos")}><Building2 size={14} /> Campamentos ({campamentosActivos.length})</button>
              <button type="button" className={`module-tab${sysTab === "roles" ? " module-tab--active" : ""}`} onClick={() => { setSysTab("roles"); void loadSystemData(); }}><KeyRound size={14} /> Roles ({roles.length})</button>
              <button type="button" className={`module-tab${sysTab === "usuarios" ? " module-tab--active" : ""}`} onClick={() => { setSysTab("usuarios"); void loadSystemData(); }}><Shield size={14} /> Usuarios ({usuarios.length})</button>
              <button type="button" className={`module-tab${sysTab === "recursos" ? " module-tab--active" : ""}`} onClick={() => { setSysTab("recursos"); void loadSystemData(); }}><BookOpen size={14} /> Catálogo ({recursos.length})</button>
            </section>

            {sysTab === "campamentos" && (
              <section className="section-card" style={{ marginTop: 0 }}>
                <div className="section-header">
                  <div className="section-header__left"><h3 className="section-header__title"><Building2 size={20} style={{ color: "var(--section-accent)" }} /> Todos los campamentos</h3><p className="section-header__sub">Selecciona un campamento para gestionar todos sus módulos.</p></div>
                  <div className="section-header__actions"><div className="header-stat"><span className="header-stat__label">Activos</span><strong className="header-stat__value">{campamentosActivos.length}</strong></div></div>
                </div>
                <div className="section-body">
                  {loading ? <div className="section-empty"><p className="section-empty__desc">Cargando...</p></div> : campamentosActivos.length === 0 ? <div className="section-empty"><p className="section-empty__title">Sin campamentos</p></div> : (
                    <div className="content-list">{campamentosActivos.map((camp) => (
                      <article key={camp.id_campamento} className="content-card">
                        <div className="content-card__header"><div><h4 className="content-card__title">{camp.nombre}</h4><p className="content-card__meta"><MapPin size={12} style={{ verticalAlign: "middle", marginRight: 4, opacity: 0.6 }} />{camp.ubicacion?.trim() || "Sin ubicacion"}</p></div><span className="status-tag status-tag--active">Activo</span></div>
                        {camp.descripcion?.trim() && <p className="content-card__body">{camp.descripcion.trim()}</p>}
                        <div className="content-card__actions"><button type="button" className="btn btn--primary" onClick={() => goToCamp(camp.id_campamento!)}><Eye size={16} /> Ver detalle completo</button></div>
                      </article>
                    ))}</div>
                  )}
                </div>
              </section>
            )}

            {sysTab === "roles" && (
              <section className="section-card">
                <div className="section-header">
                  <div className="section-header__left"><h3 className="section-header__title"><KeyRound size={18} style={{ color: "var(--section-accent)" }} /> Roles del sistema</h3><p className="section-header__sub">Administra roles y permisos de acceso</p></div>
                  <div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={() => { setRolForm({ nombre: "", codigo: "" }); setRolEditingId(null); setShowRolForm(true); }}><Plus size={13} /> Nuevo rol</button></div>
                </div>
                {showRolForm && (<div style={{ padding: "16px 22px", borderBottom: "1px solid var(--section-border)", background: "rgba(0,0,0,0.12)" }}><form onSubmit={handleSaveRol} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}><div className="filter-group" style={{ flex: "1 1 180px" }}><span className="filter-group__label">Nombre</span><input className="filter-group__input" value={rolForm.nombre} onChange={(e) => setRolForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Administrador" required /></div><div className="filter-group" style={{ flex: "1 1 120px" }}><span className="filter-group__label">Código</span><input className="filter-group__input" value={rolForm.codigo} onChange={(e) => setRolForm((f) => ({ ...f, codigo: e.target.value }))} placeholder="Ej: ADMIN" required /></div><div className="filter-bar__actions"><button type="submit" className="btn btn--primary btn--sm" disabled={isSavingRol}>{isSavingRol ? "Guardando..." : (rolEditingId ? "Actualizar" : "Crear")}</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowRolForm(false)}>Cancelar</button></div></form></div>)}
                <div className="section-body--flush"><div className="section-table-wrapper"><table className="section-table"><thead><tr><th>Código</th><th>Nombre</th><th>Acciones</th></tr></thead><tbody>{roles.length === 0 ? <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--section-muted)" }}>Sin roles</td></tr> : roles.map((r) => (<tr key={r.id_rol}><td><span className="status-tag status-tag--info" style={{ fontSize: 10 }}>{r.codigo}</span></td><td>{r.nombre}</td><td><button type="button" className="btn btn--ghost btn--sm" onClick={() => { setRolForm({ nombre: r.nombre, codigo: r.codigo }); setRolEditingId(r.id_rol); setShowRolForm(true); }}><Pencil size={12} /></button></td></tr>))}</tbody></table></div></div>
              </section>
            )}

            {sysTab === "usuarios" && (
              <section className="section-card">
                <div className="section-header">
                  <div className="section-header__left"><h3 className="section-header__title"><Shield size={18} style={{ color: "var(--section-accent)" }} /> Usuarios del sistema</h3><p className="section-header__sub">{usuarios.length} cuentas registradas</p></div>
                  <div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={() => { setUserForm({ usuario: "", password: "", id_rol: 0, id_persona: 0 }); setShowUserForm(true); }}><Plus size={13} /> Nuevo usuario</button></div>
                </div>
                {showUserForm && (<div style={{ padding: "16px 22px", borderBottom: "1px solid var(--section-border)", background: "rgba(0,0,0,0.12)" }}><form onSubmit={handleSaveUser} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}><div className="filter-group" style={{ flex: "1 1 140px" }}><span className="filter-group__label">Usuario</span><input className="filter-group__input" value={userForm.usuario} onChange={(e) => setUserForm((f) => ({ ...f, usuario: e.target.value }))} placeholder="usuario" required /></div><div className="filter-group" style={{ flex: "1 1 140px" }}><span className="filter-group__label">Contraseña</span><input className="filter-group__input" type="password" value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} placeholder="Mayúscula + número" required /></div><div className="filter-group" style={{ flex: "1 1 120px" }}><span className="filter-group__label">Rol</span><select className="filter-group__input" value={userForm.id_rol} onChange={(e) => setUserForm((f) => ({ ...f, id_rol: Number(e.target.value) }))} required><option value={0}>Seleccionar</option>{roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}</select></div><div className="filter-group" style={{ flex: "1 1 140px" }}><span className="filter-group__label">Persona</span><select className="filter-group__input" value={userForm.id_persona} onChange={(e) => setUserForm((f) => ({ ...f, id_persona: Number(e.target.value) }))} required><option value={0}>Seleccionar</option>{personas.filter((p) => p.activo !== false).map((p) => <option key={p.id_persona} value={p.id_persona!}>{p.nombre} {p.apellidos}</option>)}</select></div><div className="filter-bar__actions"><button type="submit" className="btn btn--primary btn--sm" disabled={isSavingUser}>{isSavingUser ? "Guardando..." : "Crear"}</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowUserForm(false)}>Cancelar</button></div></form></div>)}
                <div className="section-body--flush"><div className="section-table-wrapper"><table className="section-table"><thead><tr><th>Usuario</th><th>Persona</th><th>Rol</th><th>Campamento</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{usuarios.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--section-muted)" }}>Sin usuarios</td></tr> : usuarios.map((u) => (<tr key={u.id_usuario}><td style={{ fontWeight: 600 }}>{u.usuario}</td><td>{u.persona?.nombre} {u.persona?.apellidos || "—"}</td><td><span className="status-tag status-tag--info" style={{ fontSize: 10 }}>{u.rol?.codigo || "—"}</span></td><td style={{ color: "var(--section-muted)", fontSize: 12 }}>{u.persona?.campamento?.nombre || "—"}</td><td><span className={`status-tag ${u.activo ? "status-tag--active" : "status-tag--inactive"}`}>{u.activo ? "Activo" : "Inactivo"}</span></td><td><div style={{ display: "flex", gap: 6 }}><button type="button" className="btn btn--ghost btn--sm" onClick={() => handleToggleUser(u)}>{u.activo ? <XCircle size={12} /> : <CheckCircle size={12} />}</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => { setShowResetPwd(u.id_usuario); setResetPwdValue(""); }}><KeyRound size={12} /></button></div></td></tr>))}</tbody></table></div></div>
                {showResetPwd && (<div style={{ padding: "16px 22px", borderTop: "1px solid var(--section-border)", display: "flex", gap: 12, alignItems: "flex-end" }}><div className="filter-group" style={{ flex: "1 1 250px" }}><span className="filter-group__label">Nueva contraseña</span><input className="filter-group__input" type="password" value={resetPwdValue} onChange={(e) => setResetPwdValue(e.target.value)} placeholder="Mín. 8 chars" /></div><div className="filter-bar__actions"><button type="button" className="btn btn--primary btn--sm" disabled={!resetPwdValue} onClick={() => void handleResetPwd()}>Cambiar</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowResetPwd(null)}>Cancelar</button></div></div>)}
              </section>
            )}

            {sysTab === "recursos" && (
              <section className="section-card">
                <div className="section-header">
                  <div className="section-header__left"><h3 className="section-header__title"><BookOpen size={18} style={{ color: "var(--section-accent)" }} /> Catálogo de recursos</h3><p className="section-header__sub">{recursos.length} items disponibles</p></div>
                  <div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={() => { setRecursoForm({ nombre: "", categoria: "COMIDA", unidad: "" }); setRecursoEditingId(null); setShowRecursoForm(true); }}><Plus size={13} /> Nuevo recurso</button></div>
                </div>
                {showRecursoForm && (<div style={{ padding: "16px 22px", borderBottom: "1px solid var(--section-border)", background: "rgba(0,0,0,0.12)" }}><form onSubmit={handleSaveRecurso} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}><div className="filter-group" style={{ flex: "1 1 180px" }}><span className="filter-group__label">Nombre</span><input className="filter-group__input" value={recursoForm.nombre} onChange={(e) => setRecursoForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Agua" required /></div><div className="filter-group" style={{ flex: "1 1 120px" }}><span className="filter-group__label">Categoría</span><select className="filter-group__input" value={recursoForm.categoria} onChange={(e) => setRecursoForm((f) => ({ ...f, categoria: e.target.value }))}>{categorias.map((c) => <option key={c} value={c}>{c}</option>)}</select></div><div className="filter-group" style={{ flex: "1 1 100px" }}><span className="filter-group__label">Unidad</span><input className="filter-group__input" value={recursoForm.unidad} onChange={(e) => setRecursoForm((f) => ({ ...f, unidad: e.target.value }))} placeholder="litros, kg" /></div><div className="filter-bar__actions"><button type="submit" className="btn btn--primary btn--sm" disabled={isSavingRecurso}>{isSavingRecurso ? "Guardando..." : (recursoEditingId ? "Actualizar" : "Crear")}</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowRecursoForm(false)}>Cancelar</button></div></form></div>)}
                <div className="section-body--flush"><div className="section-table-wrapper"><table className="section-table"><thead><tr><th>Nombre</th><th>Categoría</th><th>Unidad</th><th>Acciones</th></tr></thead><tbody>{recursos.length === 0 ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--section-muted)" }}>Catálogo vacío</td></tr> : recursos.map((r) => (<tr key={r.id_recurso}><td style={{ fontWeight: 600 }}>{r.nombre}</td><td><span className="status-tag status-tag--info" style={{ fontSize: 10 }}>{r.categoria}</span></td><td>{r.unidad || "—"}</td><td><div style={{ display: "flex", gap: 6 }}><button type="button" className="btn btn--ghost btn--sm" onClick={() => { setRecursoForm({ nombre: r.nombre, categoria: r.categoria, unidad: r.unidad || "" }); setRecursoEditingId(r.id_recurso); setShowRecursoForm(true); }}><Pencil size={12} /></button><button type="button" className="btn btn--danger btn--sm" disabled={deletingRecursoId === r.id_recurso} onClick={() => void handleDeleteRecurso(r.id_recurso)}><Trash2 size={12} /></button></div></td></tr>))}</tbody></table></div></div>
              </section>
            )}
          </>
        )}

        {selectedCampId && selectedCamp && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "14px 20px", border: "1px solid var(--section-border)", borderRadius: 10, background: "rgba(0,0,0,0.15)", flexWrap: "wrap" }}>
              <Building2 size={20} style={{ color: "var(--section-accent)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}><strong style={{ color: "var(--section-text)", fontSize: 18 }}>{selectedCamp.nombre}</strong><span style={{ color: "var(--section-muted)", fontSize: 13, marginLeft: 8 }}><MapPin size={12} style={{ verticalAlign: "middle", marginRight: 2 }} />{selectedCamp.ubicacion?.trim() || "Sin ubicacion"}</span></div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={goBack}><ArrowLeft size={14} /> Volver</button>
            </div>

            <section className="module-tabs" style={{ marginTop: 0 }}>
              {(["detalle", "personas", "cargos", "estados", "cargoIA", "inventario", "exploraciones", "evaluaciones", "envios", "solicitudes"] as CampTab[]).map((tab) => (
                <button key={tab} type="button" className={`module-tab${campTab === tab ? " module-tab--active" : ""}`} onClick={() => setCampTab(tab)}>
                  {tab === "detalle" && <Building2 size={14} />} {tab === "personas" && <Users size={14} />} {tab === "cargos" && <Hash size={14} />} {tab === "estados" && <Activity size={14} />} {tab === "cargoIA" && <KeyRound size={14} />} {tab === "inventario" && <Package size={14} />} {tab === "exploraciones" && <Compass size={14} />} {tab === "evaluaciones" && <ClipboardCheck size={14} />} {tab === "envios" && <Truck size={14} />} {tab === "solicitudes" && <FileText size={14} />}
                  {tab === "detalle" ? "Resumen" : tab === "cargos" ? `Cargos (${cargos.length})` : tab === "estados" ? `Estados (${estadosPer.length})` : tab === "cargoIA" ? "Cargo IA" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "personas" && ` (${personasCamp.length})`} {tab === "inventario" && ` (${inventarioCamp.length})`} {tab === "exploraciones" && ` (${exploracionesCamp.length})`} {tab === "evaluaciones" && ` (${evaluacionesCamp.length})`}
                </button>
              ))}
            </section>

            {campTab === "detalle" && (
              <section className="section-card">
                <div className="section-header"><div className="section-header__left"><h3 className="section-header__title">Resumen</h3><p className="section-header__sub">Acceso rápido a cada módulo</p></div></div>
                <div className="section-body">
                  <div className="stat-grid">
                    {[{ label: "Personas", val: personasCamp.length, accent: "#9fef00", tab: "personas" as CampTab }, { label: "Inventario", val: inventarioCamp.length, accent: "#f6c453", tab: "inventario" as CampTab }, { label: "Exploraciones", val: exploracionesCamp.length, accent: "#38bdf8", tab: "exploraciones" as CampTab }, { label: "Evaluaciones", val: evaluacionesCamp.length, accent: "#a78bfa", tab: "evaluaciones" as CampTab }].map((s) => (
                      <div key={s.label} className="stat-card" style={{ "--stat-accent": s.accent } as React.CSSProperties}><span className="stat-card__label">{s.label}</span><strong className="stat-card__value">{s.val}</strong><button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: "auto", paddingLeft: 0 }} onClick={() => setCampTab(s.tab)}>Gestionar <ArrowRight size={12} /></button></div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid var(--section-border)", paddingTop: 16, marginTop: 20 }}><p style={{ color: "var(--section-text)", fontSize: 14, fontWeight: 700 }}>{selectedCamp.nombre}</p>{selectedCamp.descripcion?.trim() && <p style={{ color: "var(--section-muted)", fontSize: 13, marginTop: 4 }}>{selectedCamp.descripcion.trim()}</p>}</div>
                </div>
              </section>
            )}

            {campTab === "personas" && (
              <section className="section-card">
                <div className="section-header"><div className="section-header__left"><h3 className="section-header__title">Personas</h3><p className="section-header__sub">{personasCamp.length} registros</p></div><div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={handleCreatePersona}><Plus size={13} /> Nueva persona</button></div></div>
                {personasCamp.length === 0 ? <div className="section-empty"><p className="section-empty__desc">Sin personas registradas.</p></div> : (
                  <div className="section-body--flush"><div className="section-table-wrapper"><table className="section-table"><thead><tr><th>Cédula</th><th>Nombre</th><th>Apellidos</th><th>Cargo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{personasCamp.map((p) => (<tr key={p.id_persona}><td>{p.cedula}</td><td>{p.nombre}</td><td>{p.apellidos}</td><td>{p.cargo?.nombre ?? "—"}</td><td><span className="status-tag status-tag--active">{p.estado_persona?.nombre ?? "Activo"}</span></td><td><div style={{ display: "flex", gap: 6 }}><button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEditPersona(p)}><Pencil size={12} /></button><button type="button" className="btn btn--danger btn--sm" disabled={isDeletingPersonaId === p.id_persona} onClick={() => void handleDeletePersona(p)}><Trash2 size={12} /></button></div></td></tr>))}</tbody></table></div></div>
                )}
              </section>
            )}

            {campTab === "cargos" && <CargosManager onChanged={() => void loadAll()} />}
            {campTab === "estados" && <EstadosManager onChanged={() => void loadAll()} />}

            {campTab === "cargoIA" && (
              <section className="section-card">
                <div className="section-header">
                  <div className="section-header__left"><h3 className="section-header__title"><KeyRound size={18} style={{ color: "var(--section-accent)" }} /> Asignación de cargo con IA</h3><p className="section-header__sub">Selecciona una persona para que la IA asigne un cargo automáticamente</p></div>
                </div>
                <div className="section-body">
                  <label className="filter-group" style={{ marginBottom: 20 }}>
                    <span className="filter-group__label">Seleccionar persona</span>
                    <select className="filter-group__input" value={iaSelectedPersona} onChange={(e) => { setIaSelectedPersona(Number(e.target.value)); setIaResult(null); setIaError(null); }}>
                      <option value={0}>Selecciona una persona del campamento</option>
                      {personasCamp.map((p) => <option key={p.id_persona} value={p.id_persona!}>{p.nombre} {p.apellidos} — {p.cargo?.nombre ?? "Sin cargo"}</option>)}
                    </select>
                  </label>

                  {iaPersona && (
                    <>
                      {/* ── Detalle de persona ── */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
                        <div className="eval-item"><span className="eval-item__label">Nombre</span><div className="eval-item__value"><strong>{iaPersona.nombre} {iaPersona.apellidos}</strong></div></div>
                        <div className="eval-item"><span className="eval-item__label">Cédula</span><div className="eval-item__value"><strong>{iaPersona.cedula}</strong></div></div>
                        <div className="eval-item"><span className="eval-item__label">Campamento</span><div className="eval-item__value"><strong>{iaPersona.campamento?.nombre ?? `#${iaPersona.id_campamento}`}</strong></div></div>
                        <div className="eval-item"><span className="eval-item__label">Cargo actual</span><div className="eval-item__value"><strong>{iaPersona.cargo?.nombre ?? "Sin cargo"}</strong></div></div>
                        <div className="eval-item"><span className="eval-item__label">Estado</span><div className="eval-item__value"><strong>{iaPersona.estado_persona?.nombre ?? "Sin estado"}</strong></div></div>
                        <div className="eval-item"><span className="eval-item__label">Nacimiento</span><div className="eval-item__value"><strong>{iaPersona.fecha_nacimiento?.slice(0, 10)?.split("-").reverse().join("/") ?? "Sin fecha"}</strong></div></div>
                        <div className="eval-item"><span className="eval-item__label">Código</span><div className="eval-item__value"><strong>{iaPersona.codigo_campamento?.trim() || "Sin código"}</strong></div></div>
                      </div>

                      {/* ── Botones de acción ── */}
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                        <button type="button" className="btn btn--primary" disabled={iaLoading} onClick={() => void handleCargoIA()}>
                          {iaLoading ? "Consultando IA..." : <><KeyRound size={14} /> Asignar cargo con IA</>}
                        </button>
                        <button type="button" className="btn btn--secondary" onClick={() => { setCampTab("evaluaciones"); setEvalPersonaId(iaSelectedPersona); }}>
                          <ClipboardCheck size={14} /> Evaluación de ingreso
                        </button>
                      </div>

                      {iaError && <div style={{ padding: 12, border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, background: "rgba(239,68,68,0.06)", color: "#fca5a5", fontSize: 14, marginBottom: 16 }}>{iaError}</div>}

                      {/* ── Resultado IA ── */}
                      {iaResult && (
                        <div style={{ padding: 16, border: "1px solid rgba(56,189,248,0.3)", borderRadius: 8, background: "rgba(56,189,248,0.06)", marginBottom: 20 }}>
                          <h4 style={{ margin: "0 0 12px", color: "#38bdf8", fontSize: 14, fontWeight: 700 }}>Resultado de la IA</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                            <div className="eval-item"><span className="eval-item__label">Cargo recomendado</span><div className="eval-item__value"><strong style={{ color: "#9fef00" }}>{iaResult.recommendedCargoName}</strong></div></div>
                            <div className="eval-item"><span className="eval-item__label">Resultado</span><div className="eval-item__value"><strong style={{ color: iaResult.changed ? "#9fef00" : "#f6c453" }}>{iaResult.changed ? "Cargo actualizado con la recomendación IA." : "El cargo actual no cambió."}</strong></div></div>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <span className="eval-item__label">Motivo</span>
                            <p style={{ color: "var(--section-muted)", fontSize: 13, margin: "4px 0 0" }}>{iaResult.reason}</p>
                          </div>
                        </div>
                      )}

                      {/* ── Historial de cargos ── */}
                      {iaPersona.asignacion_cargo && iaPersona.asignacion_cargo.length > 0 && (
                        <div>
                          <h4 style={{ margin: "0 0 10px", color: "var(--section-text)", fontSize: 14, fontWeight: 700 }}>Historial de cargos ({iaPersona.asignacion_cargo.length})</h4>
                          <div className="section-body--flush"><div className="section-table-wrapper"><table className="section-table">
                            <thead><tr><th>Cargo</th><th>Campamento</th><th>Inicio</th><th>Fin</th></tr></thead>
                            <tbody>{iaPersona.asignacion_cargo.map((h) => (
                              <tr key={h.id_asignacion}>
                                <td style={{ fontWeight: 600 }}>{h.cargo?.nombre ?? `#${h.id_cargo}`}</td>
                                <td>{h.campamento?.nombre ?? `#${h.id_campamento}`}</td>
                                <td>{h.fecha_inicio?.slice(0, 10)?.split("-").reverse().join("/") ?? "—"}</td>
                                <td>{h.fecha_fin ? h.fecha_fin.slice(0, 10).split("-").reverse().join("/") : <span style={{ color: "#9fef00" }}>Actual</span>}</td>
                              </tr>
                            ))}</tbody>
                          </table></div></div>
                        </div>
                      )}

                      {(!iaPersona.asignacion_cargo || iaPersona.asignacion_cargo.length === 0) && (
                        <p style={{ color: "var(--section-muted)", fontSize: 13 }}>Sin historial de cargos registrado.</p>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            {campTab === "inventario" && (
              <section className="section-card">
                <div className="section-header"><div className="section-header__left"><h3 className="section-header__title">Inventario</h3><p className="section-header__sub">{inventarioCamp.length} recursos</p></div><div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={() => { setInvForm({ resourceId: 0, quantity: 0, minThreshold: 0 }); setInvEditingKey(null); setShowInvForm(true); }}><Plus size={13} /> Agregar</button></div></div>
                {showInvForm && (<div style={{ padding: "16px 22px", borderBottom: "1px solid var(--section-border)", background: "rgba(0,0,0,0.12)" }}><form onSubmit={handleSaveInv} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}><div className="filter-group" style={{ flex: "1 1 160px" }}><span className="filter-group__label">Recurso</span><select className="filter-group__input" name="resourceId" value={invForm.resourceId} onChange={handleInvChange} required disabled={!!invEditingKey}><option value={0}>Seleccionar recurso</option>{recursos.map((r) => <option key={r.id_recurso} value={r.id_recurso}>{r.nombre} ({r.categoria})</option>)}</select></div><div className="filter-group" style={{ flex: "1 1 80px" }}><span className="filter-group__label">Cantidad</span><input className="filter-group__input" name="quantity" type="number" min={0} value={invForm.quantity} onChange={handleInvChange} required /></div><div className="filter-group" style={{ flex: "1 1 80px" }}><span className="filter-group__label">Mínimo</span><input className="filter-group__input" name="minThreshold" type="number" min={0} value={invForm.minThreshold} onChange={handleInvChange} required /></div><div className="filter-bar__actions"><button type="submit" className="btn btn--primary btn--sm" disabled={isSavingInv}>{isSavingInv ? "Guardando..." : invEditingKey ? "Actualizar" : "Crear"}</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => { setShowInvForm(false); setInvEditingKey(null); }}>Cancelar</button></div></form></div>)}
                {inventarioCamp.length === 0 ? <div className="section-empty"><p className="section-empty__desc">Sin inventario.</p></div> : (
                  <div className="section-body--flush"><div className="section-table-wrapper"><table className="section-table"><thead><tr><th>Recurso</th><th>Cantidad</th><th>Mínimo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{inventarioCamp.map((r) => { const key = `${r.campId}-${r.id}`; return (<tr key={key}><td style={{ fontWeight: 600 }}>{r.name}</td><td>{r.quantity}</td><td>{r.minThreshold}</td><td><span className={`status-tag ${r.status === "critical" ? "status-tag--inactive" : "status-tag--active"}`}>{r.status === "critical" ? "Crítico" : "Estable"}</span></td><td><div style={{ display: "flex", gap: 6 }}><button type="button" className="btn btn--ghost btn--sm" onClick={() => handleEditInv(r)}><Pencil size={12} /></button><button type="button" className="btn btn--danger btn--sm" disabled={deletingInvKey === key} onClick={() => void handleDeleteInv(r)}><Trash2 size={12} /></button></div></td></tr>); })}</tbody></table></div></div>
                )}
              </section>
            )}

            {campTab === "exploraciones" && (
              <section className="section-card">
                <div className="section-header"><div className="section-header__left"><h3 className="section-header__title">Exploraciones</h3><p className="section-header__sub">{exploracionesCamp.length} misiones</p></div><div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={() => setShowExploracionForm(true)}><Plus size={13} /> Nueva</button></div></div>
                {exploracionesCamp.length === 0 ? <div className="section-empty"><p className="section-empty__desc">Sin exploraciones.</p></div> : (
                  <div className="section-body"><div className="content-list">{exploracionesCamp.map((exp) => (
                    <article key={exp.id_exploracion} className="content-card">
                      <div className="content-card__header"><div><h4 className="content-card__title">{exp.nombre}</h4>{exp.descripcion && <p className="content-card__meta">{exp.descripcion}</p>}</div><span className={`status-tag ${exp.estado === "PLANIFICADA" ? "status-tag--pending" : exp.estado === "EN_PROGRESO" ? "status-tag--info" : exp.estado === "COMPLETADA" ? "status-tag--active" : "status-tag--inactive"}`}>{exp.estado.replace("_", " ")}</span></div>
                      <div className="content-card__stats"><div className="content-card__stat"><span className="content-card__stat-label">Inicio</span><span className="content-card__stat-value">{formatDate(exp.fecha_inicio_plan)}</span></div><div className="content-card__stat"><span className="content-card__stat-label">Días</span><span className="content-card__stat-value">{exp.dias_estimados}</span></div><div className="content-card__stat"><span className="content-card__stat-label">Extra</span><span className="content-card__stat-value">{exp.dias_extra}</span></div><div className="content-card__stat"><span className="content-card__stat-label">Explor.</span><span className="content-card__stat-value">{exp.exploracion_persona?.length ?? 0}</span></div></div>
                      <div className="content-card__actions">
                        {exp.estado === "PLANIFICADA" && (<><button type="button" className="btn btn--secondary btn--sm" onClick={() => { setExploracionDetalle(exp); setVistaDetalleExp("personas"); }}><UserPlus size={12} /> Asignar</button><button type="button" className="btn btn--secondary btn--sm" onClick={() => { setExploracionDetalle(exp); setVistaDetalleExp("recursos"); }}><Box size={12} /> Recursos</button><button type="button" className="btn btn--success btn--sm" onClick={() => void handleExpEstado(exp, "EN_PROGRESO")}><Play size={12} /> Iniciar</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => void handleExpEstado(exp, "CANCELADA")}><XCircle size={12} /> Cancelar</button><button type="button" className="btn btn--danger btn--sm" onClick={() => handleExpEliminar(exp)}><Trash2 size={12} /></button></>)}
                        {exp.estado === "EN_PROGRESO" && (<><button type="button" className="btn btn--secondary btn--sm" onClick={() => { setExploracionDetalle(exp); setVistaDetalleExp("recursos"); }}><Package size={12} /> Registrar</button><button type="button" className="btn btn--success btn--sm" onClick={() => void handleExpEstado(exp, "COMPLETADA")}><CheckCircle size={12} /> Completar</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => void handleExpEstado(exp, "FALLIDA")}><AlertTriangle size={12} /> Fallida</button></>)}
                        {(exp.estado === "COMPLETADA" || exp.estado === "CANCELADA" || exp.estado === "FALLIDA") && (<><span className="status-tag status-tag--info" style={{ fontSize: 10 }}>Finalizada</span><button type="button" className="btn btn--danger btn--sm" onClick={() => handleExpEliminar(exp)}><Trash2 size={12} /></button></>)}
                      </div>
                    </article>
                  ))}</div></div>
                )}
              </section>
            )}

            {campTab === "evaluaciones" && (
              <section className="section-card">
                <div className="section-header"><div className="section-header__left"><h3 className="section-header__title">Evaluaciones</h3><p className="section-header__sub">{evaluacionesCamp.length} registros</p></div><div className="section-header__actions"><button type="button" className="btn btn--primary btn--sm" onClick={() => setShowEvalForm(true)}><PlusCircle size={13} /> Nueva</button></div></div>
                {showEvalForm && (<div style={{ padding: "16px 22px", borderBottom: "1px solid var(--section-border)", background: "rgba(0,0,0,0.12)" }}><div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}><div className="filter-group" style={{ flex: "1 1 250px" }}><span className="filter-group__label">Persona</span><select className="filter-group__input" value={evalPersonaId} onChange={(e) => setEvalPersonaId(Number(e.target.value))}><option value={0}>Seleccionar</option>{personasCamp.map((p) => <option key={p.id_persona} value={p.id_persona!}>{p.nombre} {p.apellidos}</option>)}</select></div><div className="filter-bar__actions"><button type="button" className="btn btn--primary btn--sm" disabled={evalCreating || !evalPersonaId} onClick={() => void handleCreateEval()}>{evalCreating ? "Creando..." : "Crear"}</button><button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowEvalForm(false)}>Cancelar</button></div></div></div>)}
                {evaluacionesCamp.length === 0 ? <div className="section-empty"><p className="section-empty__desc">Sin evaluaciones.</p></div> : (
                  <div className="section-body"><div className="content-list">{evaluacionesCamp.map((ev) => { const fs = evalFormDecision[ev.id_evaluacion] || { comentarios: "", loading: false }; return (<article key={ev.id_evaluacion} className="content-card"><div className="content-card__header"><div><h4 className="content-card__title">{ev.persona?.nombre} {ev.persona?.apellidos}</h4><p className="content-card__meta">{formatDate(ev.fecha_evaluacion)}</p></div><span className={`status-tag ${!ev.decision_final ? "status-tag--pending" : ev.decision_final === "ACEPTADO" ? "status-tag--active" : "status-tag--inactive"}`}>{ev.decision_final ?? "Pendiente"}</span></div><div className="eval-grid" style={{ marginBottom: 12 }}><div className="eval-item"><span className="eval-item__label">IA</span><div className="eval-item__value"><strong>{ev.recomendacion_ia}</strong></div></div><div className="eval-item"><span className="eval-item__label">Motivo</span><p className="eval-item__value">{ev.motivo_ia || "—"}</p></div></div>{!ev.decision_final && (<div className="decision-area" style={{ marginTop: 0 }}><label className="filter-group"><span className="filter-group__label">Comentarios</span><textarea className="filter-group__input" style={{ minHeight: 50, resize: "vertical" }} placeholder="Observaciones..." value={fs.comentarios} onChange={(e) => setEvalFormDecision((f) => ({ ...f, [ev.id_evaluacion]: { ...f[ev.id_evaluacion], comentarios: e.target.value } }))} /></label><div className="decision-area__actions"><button type="button" className="btn btn--success btn--sm" disabled={fs.loading} onClick={() => void handleEvalDecision(ev, "ACEPTADO")}><Check size={13} /> Aceptar</button><button type="button" className="btn btn--danger btn--sm" disabled={fs.loading} onClick={() => void handleEvalDecision(ev, "RECHAZADO")}><X size={13} /> Rechazar</button></div></div>)}</article>); })}</div></div>
                )}
              </section>
            )}

            {campTab === "envios" && (<section className="section-card"><div className="section-body"><EnviosPage campamento={selectedCamp} campamentos={campamentosActivos} personas={personas} inventario={inventario} onDataChanged={loadAll} /></div></section>)}
            {campTab === "solicitudes" && (<section className="section-card"><div className="section-body"><SolicitudesPage campamento={selectedCamp} campamentos={campamentosActivos} inventario={inventario} personas={personas} /></div></section>)}
          </>
        )}
      </div>

      {showPersonaForm && (<PageModal title={personaEditando ? "Editar persona" : "Nueva persona"} onClose={() => { setShowPersonaForm(false); setPersonaEditando(null); }} size="lg"><PersonaForm campamentos={campamentosActivos.map((c) => ({ id_campamento: c.id_campamento as number, nombre: c.nombre }))} personaEditando={personaEditando} onCancelEdit={() => { setShowPersonaForm(false); setPersonaEditando(null); }} onSuccess={() => { setShowPersonaForm(false); setPersonaEditando(null); void loadAll(); }} /></PageModal>)}
      {showExploracionForm && (<PageModal title="Nueva exploración" onClose={() => setShowExploracionForm(false)} size="lg"><ExploracionForm idCampamento={selectedCampId!} onCreada={handleExpCreated} onCancelar={() => setShowExploracionForm(false)} /></PageModal>)}
      {exploracionDetalle && vistaDetalleExp === "personas" && (<PageModal onClose={() => { setExploracionDetalle(null); setVistaDetalleExp(null); void loadAll(); }} size="lg"><AsignarPersonas exploracion={exploracionDetalle} onCerrar={() => { setExploracionDetalle(null); setVistaDetalleExp(null); void loadAll(); }} /></PageModal>)}
      {exploracionDetalle && vistaDetalleExp === "recursos" && (<PageModal onClose={() => { setExploracionDetalle(null); setVistaDetalleExp(null); void loadAll(); }} size="lg"><RecursosMision exploracion={exploracionDetalle} onCerrar={() => { setExploracionDetalle(null); setVistaDetalleExp(null); void loadAll(); }} /></PageModal>)}
      {showConfirmDeleteExp && expAEliminar && (<PageModal title="Eliminar exploración" onClose={() => { setShowConfirmDeleteExp(false); setExpAEliminar(null); }} size="sm"><p className="section-empty__desc" style={{ marginBottom: 20 }}>¿Eliminar <strong>{expAEliminar.nombre}</strong>?</p><div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button type="button" className="btn btn--secondary" onClick={() => { setShowConfirmDeleteExp(false); setExpAEliminar(null); }}>Cancelar</button><button type="button" className="btn btn--danger" onClick={() => void confirmExpDelete()}><Trash2 size={14} /> Eliminar</button></div></PageModal>)}
    </div>
  );
}

export default AccesoSistemaPage;