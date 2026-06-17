import { type CSSProperties, useEffect, useRef, useState, useCallback } from "react";
import {
  Building2,
  Users,
  Package,
  Compass,
  LogOut,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Skull,
  Monitor,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { getCampamentos } from "../features/campamentos/campamentos.api";
import { getPersonas } from "../features/personas/personas.api";
import { getResources } from "../features/inventario/inventario.api";
import { listarExploraciones } from "../features/exploraciones/exploraciones.api";
import { getEvaluaciones } from "../features/evaluaciones/evaluaciones.api";
import { getUsuarios } from "../features/usuarios/usuarios.api";
import { getRecursos } from "../features/recursos/recursos.api";
import { storage } from "../shared/utils/storage";


type DashboardStats = {
  campamentos: number;
  personas: number;
  inventario: number;
  exploraciones: number;
  evaluaciones: number;
  usuarios: number;
  recursos: number;
};

const COLORS = {
  CAMPAMENTO: "#9fef00",
  PERSONA: "#ff4d5e",
  INVENTARIO: "#f6c453",
  EXPLORACION: "#38bdf8",
  EVALUACION: "#a78bfa",
  USUARIO: "#f472b6",
  RECURSO: "#34d399",
};

function DashboardPage() {
  const { usuario } = useAuth();
  const rolCodigo = usuario?.rol?.codigo ?? "";
  const cargoNombre = usuario?.persona?.cargo?.nombre;
  const campamentoNombre = usuario?.persona?.campamento?.nombre;
  const nombrePersona = usuario?.persona?.nombre;

  const [stats, setStats] = useState<DashboardStats>({
    campamentos: 0, personas: 0, inventario: 0, exploraciones: 0,
    evaluaciones: 0, usuarios: 0, recursos: 0,
  });
  const [showCredits, setShowCredits] = useState(false);
  const [creditsPhase, setCreditsPhase] = useState(0);
  const creditsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = () => { storage.clearAuth(); window.location.href = "/"; };

  const openCredits = useCallback(() => {
    setShowCredits(true);
    setCreditsPhase(0);
    const t6 = setTimeout(() => setCreditsPhase(6), 4600);
    creditsTimerRef.current = t6;
  }, []);

  const closeCredits = useCallback(() => {
    setShowCredits(false);
    setCreditsPhase(0);
    if (creditsTimerRef.current) clearTimeout(creditsTimerRef.current);
  }, []);

  useEffect(() => {
    (async () => {
      const id = usuario?.persona?.campamento?.id_campamento ?? Number(localStorage.getItem("campamento_id"));
      const [c, p, i, e, ev, u, r] = await Promise.allSettled([
        getCampamentos(), getPersonas(),
        id ? getResources(id) : Promise.resolve([]),
        id ? listarExploraciones(id) : Promise.resolve([]),
        getEvaluaciones(), getUsuarios(), getRecursos(),
      ]);
      const camp = c.status === "fulfilled" ? c.value.filter((x: { activo?: boolean }) => x.activo !== false).length : 0;
      setStats({
        campamentos: camp,
        personas: p.status === "fulfilled" ? p.value.length : 0,
        inventario: i.status === "fulfilled" ? i.value.length : 0,
        exploraciones: e.status === "fulfilled" ? e.value.length : 0,
        evaluaciones: ev.status === "fulfilled" ? ev.value.length : 0,
        usuarios: u.status === "fulfilled" ? u.value.length : 0,
        recursos: r.status === "fulfilled" ? r.value.length : 0,
      });
    })();
  }, [usuario]);


  const maxVal = Math.max(1, stats.campamentos, stats.personas, stats.inventario, stats.exploraciones, stats.evaluaciones, stats.usuarios, stats.recursos);

  return (
    <div className="dashboard-page dashboard-page--biohazard">
      <div className="dashboard-scanline" aria-hidden="true" />
      <div className="dashboard-flicker" aria-hidden="true" />
      <div className="scroll-app">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <div className="admin-topbar-brand"><ShieldAlert size={18} /><span>Centro de Control</span></div>
            <div className="admin-topbar-badge">{rolCodigo ? `Rol: ${rolCodigo}` : "Panel"}</div>
          </div>
          <div className="admin-topbar-center">
            <span className="admin-topbar-greeting">Hola, <strong>{nombrePersona ?? usuario?.usuario ?? "usuario"}</strong>{campamentoNombre && <> &middot; {campamentoNombre}</>}{cargoNombre && <> &middot; {cargoNombre}</>}</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-status"><span className="admin-topbar-dot" />En linea</div>
            <button type="button" className="admin-topbar-logout" onClick={handleLogout}><LogOut size={14} />Salir</button>
          </div>
        </div>

        {/* SECTION 1: HERO - FULL SCREEN */}
        <ScrollRevealSection className="scroll-section-hero">
          <div className="scroll-hero-inner">
            <div className="landing-hero-icon"><Skull size={56} /></div>
            <h1 className="scroll-hero-title">Apocalipsis Camp System</h1>
            <p className="scroll-hero-sub">Monitoreo y control total de campamentos, personal, inventario, evaluaciones y exploraciones.</p>
            <div className="scroll-hero-stats">
              {[
                { label: "Campamentos", val: stats.campamentos, accent: COLORS.CAMPAMENTO },
                { label: "Personas", val: stats.personas, accent: COLORS.PERSONA },
                { label: "Inventario", val: stats.inventario, accent: COLORS.INVENTARIO },
                { label: "Exploraciones", val: stats.exploraciones, accent: COLORS.EXPLORACION },
              ].map((s) => (
                <div key={s.label} className="scroll-mini-stat" style={{ "--m-accent": s.accent } as CSSProperties}>
                  <strong>{s.val}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 30 }}>
              <Link
                to="/acceso-sistema"
                className="button button-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "18px",
                  padding: "18px 42px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #7abf13, #4f8f1e)",
                  color: "#071006",
                  fontWeight: 900,
                  border: "1px solid rgba(159, 239, 0, 0.35)",
                  boxShadow: "0 6px 24px rgba(42, 79, 15, 0.35)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 32px rgba(42, 79, 15, 0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(42, 79, 15, 0.35)";
                }}
              >
                <Monitor size={24} />
                Acceso al sistema
                <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </ScrollRevealSection>

        {/* SECTION 2: METRICAS */}
        <ScrollRevealSection>
          <div className="section-head"><BarChart3 size={22} /><div><h2>Panel de metricas</h2><span>Resumen cuantitativo del sistema</span></div></div>
          <div className="masonry-metrics">
            {[
              { label: "Campamentos", val: stats.campamentos, icon: <Building2 size={24} />, accent: COLORS.CAMPAMENTO, sub: "Zonas activas" },
              { label: "Personas", val: stats.personas, icon: <Users size={24} />, accent: COLORS.PERSONA, sub: "Registros vivos" },
              { label: "Inventario", val: stats.inventario, icon: <Package size={24} />, accent: COLORS.INVENTARIO, sub: "Recursos en stock" },
              { label: "Exploraciones", val: stats.exploraciones, icon: <Compass size={24} />, accent: COLORS.EXPLORACION, sub: "Misiones registradas" },
            ].map((m, i) => (
              <StaggerCard key={m.label} index={i}>
                <div className="scroll-metric" style={{ "--m-accent": m.accent } as CSSProperties}>
                  <div className="scroll-metric-head">
                    <div className="scroll-metric-icon">{m.icon}</div>
                    <strong className="scroll-metric-num">{m.val}</strong>
                  </div>
                  <div className="scroll-metric-body">
                    <span className="scroll-metric-label">{m.label}</span>
                    <span className="scroll-metric-sub">{m.sub}</span>
                  </div>
                  <div className="scroll-metric-track"><div className="scroll-metric-fill" style={{ width: `${Math.min(100, (m.val / Math.max(1, m.val)) * 80 + 10)}%` }} /></div>
                </div>
              </StaggerCard>
            ))}
          </div>
        </ScrollRevealSection>

        {/* SECTION 3: PROGRESO */}
        <ScrollRevealSection>
          <div className="section-head"><TrendingUp size={22} /><div><h2>Distribucion del sistema</h2><span>Proporcion de datos por modulo</span></div></div>
          <div className="scroll-progress-grid">
            {[
              { label: "Campamentos", val: stats.campamentos, accent: COLORS.CAMPAMENTO },
              { label: "Personas", val: stats.personas, accent: COLORS.PERSONA },
              { label: "Inventario", val: stats.inventario, accent: COLORS.INVENTARIO },
              { label: "Evaluaciones", val: stats.evaluaciones, accent: COLORS.EVALUACION },
              { label: "Exploraciones", val: stats.exploraciones, accent: COLORS.EXPLORACION },
              { label: "Usuarios", val: stats.usuarios, accent: COLORS.USUARIO },
              { label: "Recursos", val: stats.recursos, accent: COLORS.RECURSO },
            ].map((p, i) => (
              <ProgressBarItem key={p.label} label={p.label} value={p.val} max={maxVal} accent={p.accent} delay={i} />
            ))}
          </div>
        </ScrollRevealSection>

        {/* SECTION 4: CREDITOS */}
        <ScrollRevealSection>
          <div className="section-head"><Skull size={22} /><div><h2>Creditos</h2><span>Proyecto final EIF 209</span></div></div>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <button
              type="button"
              className="button button-primary"
              onClick={openCredits}
              style={{ fontSize: "16px", padding: "16px 36px", borderRadius: "12px" }}
            >
              <Skull size={20} style={{ marginRight: 8, verticalAlign: -3 }} />
              Creditos
            </button>
          </div>
        </ScrollRevealSection>
      </div>

      {/* CREDITS MODAL */}
      {showCredits && (
        <div className="credits-overlay" onClick={closeCredits}>
          <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
            <div className="credits-scanlines" />
            <div className="credits-vignette" />

            <div className={`credits-content ${creditsPhase >= 1 ? "credits-phase-1" : ""}`}>
              <div className="credits-university">
                <div className="credits-university-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h2 className="credits-university-name">Universidad Nacional</h2>
                <p className="credits-university-sub">Sede Regional Brunca &mdash; Campus Coto</p>
                <p className="credits-university-career">Bachillerato en Ingenieria de Sistemas de Informacion</p>
              </div>

              <div className={`credits-divider ${creditsPhase >= 2 ? "credits-divider--visible" : ""}`} />

              <div className={`credits-project ${creditsPhase >= 2 ? "credits-project--visible" : ""}`}>
                <h1 className="credits-project-name">Apocalipsis Camp System</h1>
                <p className="credits-project-subtitle">Proyecto Final &mdash; EIF 209 Programacion IV</p>
              </div>

              <div className={`credits-divider ${creditsPhase >= 3 ? "credits-divider--visible" : ""}`} />

              <div className={`credits-team ${creditsPhase >= 3 ? "credits-team--visible" : ""}`}>
                <h3 className="credits-team-title">Integrantes</h3>
                <div className="credits-team-grid">
                  {["Justin Rojas", "Cristopher Urena", "Ashly Delgado", "Carolain Quesada", "Angelica Salazar"].map((name, i) => (
                    <div key={name} className={`credits-member ${creditsPhase >= 4 ? "credits-member--visible" : ""}`} style={{ transitionDelay: `${i * 0.15}s` }}>
                      <div className="credits-member-avatar">{name.charAt(0)}</div>
                      <span className="credits-member-name">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`credits-divider ${creditsPhase >= 5 ? "credits-divider--visible" : ""}`} />

              <div className={`credits-professor ${creditsPhase >= 5 ? "credits-professor--visible" : ""}`}>
                <h3 className="credits-professor-title">Profesor</h3>
                <p className="credits-professor-name">Juan Gamboa Abarca</p>
              </div>

              <div className={`credits-footer ${creditsPhase >= 6 ? "credits-footer--visible" : ""}`}>
                <p className="credits-cycle">I Ciclo, 2026</p>
                <p className="credits-date">13 de junio de 2026</p>
              </div>
            </div>

            <button type="button" className="credits-close" onClick={closeCredits}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function ScrollRevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShow(true); }
      else { setShow(false); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`scroll-reveal ${show ? "scroll-reveal--in" : ""} ${className}`}>{children}</div>;
}


function StaggerCard({ children, index }: { children: React.ReactNode; index: number }) {
  return <div className="stagger-item" style={{ transitionDelay: `${index * 0.08}s` } as CSSProperties}>{children}</div>;
}


function ProgressBarItem({ label, value, max, accent, delay }: { label: string; value: number; max: number; accent: string; delay: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="scroll-progress-row" style={{ "--p-accent": accent, transitionDelay: `${delay * 0.06}s` } as CSSProperties}>
      <div className="scroll-progress-label"><span>{label}</span><strong>{value}</strong></div>
      <div className="scroll-progress-track"><div className="scroll-progress-fill" style={{ width: `${pct}%` }} /></div>
      <span className="scroll-progress-pct">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default DashboardPage;