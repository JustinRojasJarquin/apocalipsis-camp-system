import { useEffect, useMemo, useState } from "react";
import { KeyRound, UserCheck, UserX } from "lucide-react";
import Navbar from "../../../shared/components/Navbar";
import { PageModal } from "../../../shared/components/PageModal";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { getPersonas } from "../../personas/personas.api";
import type { Persona } from "../../personas/types";
import { changeUserRole, createRol, getRoles } from "../../roles/roles.api";
import type { Rol } from "../../roles/roles.api";
import {
  changeUsuarioEstado,
  createUsuario,
  getUsuarios,
  resetUsuarioPassword,
} from "../usuarios.api";
import type { UsuarioSistema } from "../usuarios.api";

const emptyUserForm = {
  usuario: "",
  password: "",
  id_rol: "",
  id_persona: "",
};

const emptyRolForm = {
  nombre: "",
  codigo: "",
};

const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const getRolDescripcion = (codigo?: string) => {
  switch (codigo) {
    case "ADMIN":
    case "ADMINISTRADOR":
      return "Acceso completo";
    case "VIAJES":
    case "ENCARGADO_VIAJES":
      return "Exploraciones y envios";
    case "GESTOR_RECURSOS":
    case "TRABAJADOR":
      return "Inventario y recursos";
    default:
      return "Permisos personalizados";
  }
};

const getEstadoUsuario = (usuario: UsuarioSistema) => {
  if (!usuario.activo) return "Inactivo";
  if (!usuario.persona) return "Sin persona";
  if (usuario.persona.estado_persona?.disponible === false) {
    return "Persona no disponible";
  }
  return "Activo";
};

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [rolForm, setRolForm] = useState(emptyRolForm);
  const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false);
  const [mostrarFormularioRol, setMostrarFormularioRol] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRol, setSavingRol] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    buscar: "",
    rol: "",
    estado: "",
    campamento: "",
  });

  const debouncedBuscar = useDebouncedValue(filters.buscar);

  const campamentos = useMemo(
    () =>
      Array.from(
        new Map(
          usuarios
            .map((usuario) => usuario.persona?.campamento)
            .filter(Boolean)
            .map((campamento) => [campamento!.id_campamento, campamento!]),
        ).values(),
      ).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [usuarios],
  );

  const usuariosFiltrados = useMemo(() => {
    const buscar = debouncedBuscar.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const persona = usuario.persona;
      const nombreCompleto = persona
        ? `${persona.nombre} ${persona.apellidos}`.toLowerCase()
        : "";
      const estado = getEstadoUsuario(usuario);

      return (
        (!buscar ||
          usuario.usuario.toLowerCase().includes(buscar) ||
          nombreCompleto.includes(buscar)) &&
        (!filters.rol || usuario.rol?.codigo === filters.rol) &&
        (!filters.estado || estado === filters.estado) &&
        (!filters.campamento ||
          String(usuario.persona?.campamento?.id_campamento) ===
            filters.campamento)
      );
    });
  }, [usuarios, debouncedBuscar, filters.rol, filters.estado, filters.campamento]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [usuariosData, rolesData, personasData] = await Promise.all([
        getUsuarios(),
        getRoles(),
        getPersonas(),
      ]);

      setUsuarios(usuariosData);
      setRoles(rolesData);
      setPersonas(personasData.filter((persona) => persona.activo !== false));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar usuarios y roles.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateUsuario = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userForm.usuario.trim().endsWith("@gmail.com")) {
      setError("El usuario debe ser un correo Gmail.");
      return;
    }

    if (!passwordPattern.test(userForm.password)) {
      setError(
        "La contrasena debe tener minimo 8 caracteres, una mayuscula y un numero.",
      );
      return;
    }

    if (!userForm.id_rol || !userForm.id_persona) {
      setError("Debe seleccionar una persona y un rol.");
      return;
    }

    setSavingUser(true);
    setError(null);

    try {
      await createUsuario({
        usuario: userForm.usuario.trim(),
        password: userForm.password,
        id_rol: Number(userForm.id_rol),
        id_persona: Number(userForm.id_persona),
      });

      setUserForm(emptyUserForm);
      setMostrarFormularioUsuario(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear usuario.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateRol = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!rolForm.nombre.trim() || !rolForm.codigo.trim()) {
      setError("Debe ingresar nombre y codigo del rol.");
      return;
    }

    setSavingRol(true);
    setError(null);

    try {
      await createRol({
        nombre: rolForm.nombre.trim(),
        codigo: rolForm.codigo.trim().toUpperCase(),
      });

      setRolForm(emptyRolForm);
      setMostrarFormularioRol(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear rol.");
    } finally {
      setSavingRol(false);
    }
  };

  const handleChangeRole = async (idUsuario: number, idRol: number) => {
    const usuario = usuarios.find((item) => item.id_usuario === idUsuario);
    const rol = roles.find((item) => item.id_rol === idRol);

    if (
      usuario &&
      rol &&
      !window.confirm(
        `Deseas cambiar el rol de "${usuario.usuario}" a "${rol.nombre}"?`,
      )
    ) {
      return;
    }

    setError(null);

    try {
      await changeUserRole(idUsuario, idRol);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar rol.");
    }
  };

  const handleToggleEstado = async (usuario: UsuarioSistema) => {
    const accion = usuario.activo ? "desactivar" : "activar";

    if (!window.confirm(`Deseas ${accion} el usuario "${usuario.usuario}"?`)) {
      return;
    }

    setError(null);

    try {
      await changeUsuarioEstado(usuario.id_usuario, !usuario.activo);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cambiar estado.",
      );
    }
  };

  const handleResetPassword = async (usuario: UsuarioSistema) => {
    const password = window.prompt(
      `Nueva contrasena para "${usuario.usuario}". Debe tener minimo 8 caracteres, una mayuscula y un numero.`,
    );

    if (password === null) return;

    if (!passwordPattern.test(password)) {
      setError(
        "La contrasena debe tener minimo 8 caracteres, una mayuscula y un numero.",
      );
      return;
    }

    if (
      !window.confirm(`Deseas restablecer la contrasena de "${usuario.usuario}"?`)
    ) {
      return;
    }

    setError(null);

    try {
      await resetUsuarioPassword(usuario.id_usuario, password);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restablecer la contrasena.",
      );
    }
  };

  return (
    <div style={{ display: "flex", background: "#09110f", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Administracion</span>
              <h1>Usuarios y roles</h1>
              <p className="page-description">
                Crea cuentas de acceso, asigna roles y controla permisos del
                sistema.
              </p>
            </div>

            <div className="page-header-actions">
              <div className="campamentos-stat">
                <span className="stat-label">Usuarios</span>
                <strong className="stat-value">{usuarios.length}</strong>
              </div>

              <button
                type="button"
                className="button button-secondary"
                onClick={() => setMostrarFormularioRol(true)}
              >
                + Nuevo rol
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => setMostrarFormularioUsuario(true)}
              >
                + Nuevo usuario
              </button>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-filter-card">
            <div className="campamentos-filter-row">
              <label className="filter-field">
                <span>Buscar</span>
                <input
                  value={filters.buscar}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      buscar: event.target.value,
                    }))
                  }
                  placeholder="Usuario o persona"
                />
              </label>

              <label className="filter-field">
                <span>Rol</span>
                <select
                  value={filters.rol}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      rol: event.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.codigo}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-field">
                <span>Estado</span>
                <select
                  value={filters.estado}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      estado: event.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Persona no disponible">
                    Persona no disponible
                  </option>
                  <option value="Sin persona">Sin persona</option>
                </select>
              </label>

              <label className="filter-field">
                <span>Campamento</span>
                <select
                  value={filters.campamento}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      campamento: event.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  {campamentos.map((campamento) => (
                    <option
                      key={campamento.id_campamento}
                      value={campamento.id_campamento}
                    >
                      {campamento.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="campamentos-list-card">
            <div className="card-header">
              <div>
                <h3>Usuarios registrados</h3>
                <p className="small-text">
                  Administra el rol y estado de cada cuenta.
                </p>
              </div>
            </div>

              <div className="filter-results-meta">
                <span>
                  Mostrando <strong>{usuariosFiltrados.length}</strong> de{" "}
                  <strong>{usuarios.length}</strong> usuarios
                </span>
              </div>

              {loading ? (
                <div className="empty-state">Cargando usuarios...</div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="empty-state">
                  No hay usuarios que coincidan con los filtros.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Persona</th>
                        <th>Campamento</th>
                        <th>Cargo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {usuariosFiltrados.map((usuario) => {
                        const estado = getEstadoUsuario(usuario);

                        return (
                          <tr key={usuario.id_usuario}>
                            <td>
                              <strong>{usuario.usuario}</strong>
                              <span className="small-text">
                                {getRolDescripcion(usuario.rol?.codigo)}
                              </span>
                            </td>

                            <td>
                              {usuario.persona
                                ? `${usuario.persona.nombre} ${usuario.persona.apellidos}`
                                : "Sin persona"}
                            </td>

                            <td>
                              {usuario.persona?.campamento?.nombre ??
                                "Sin campamento"}
                            </td>

                            <td>
                              {usuario.persona?.cargo?.nombre ?? "Sin cargo"}
                            </td>

                            <td>
                              <select
                                value={usuario.id_rol}
                                onChange={(event) =>
                                  void handleChangeRole(
                                    usuario.id_usuario,
                                    Number(event.target.value),
                                  )
                                }
                              >
                                {roles.map((rol) => (
                                  <option key={rol.id_rol} value={rol.id_rol}>
                                    {rol.nombre} -{" "}
                                    {getRolDescripcion(rol.codigo)}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td>
                              <span
                                className={
                                  estado === "Activo"
                                    ? "status-badge status-active"
                                    : "status-badge status-inactive"
                                }
                              >
                                {estado}
                              </span>
                            </td>

                            <td className="table-actions-cell">
                              <CrudActions layout="table">
                                <CrudActionGroup>
                                  <CrudAction
                                    label={
                                      usuario.activo ? "Desactivar" : "Activar"
                                    }
                                    icon={usuario.activo ? UserX : UserCheck}
                                    variant={usuario.activo ? "danger" : "success"}
                                    onClick={() => void handleToggleEstado(usuario)}
                                  />
                                  <CrudAction
                                    label="Restablecer"
                                    icon={KeyRound}
                                    onClick={() => void handleResetPassword(usuario)}
                                  />
                                </CrudActionGroup>
                              </CrudActions>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </section>

          {mostrarFormularioUsuario && (
            <PageModal
              title="Nuevo usuario"
              onClose={() => {
                setMostrarFormularioUsuario(false);
                setUserForm(emptyUserForm);
              }}
              size="md"
            >
              <form className="modal-form" onSubmit={handleCreateUsuario}>
                <p className="section-description">
                  Asocia una persona existente con un rol del sistema.
                </p>

                <div className="modal-form__section">
                  <h3 className="modal-form__section-title">Cuenta</h3>

                  <label className="form-field">
                    <span>Persona *</span>
                    <select
                      value={userForm.id_persona}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          id_persona: event.target.value,
                        }))
                      }
                    >
                      <option value="">Seleccione persona</option>
                      {personas.map((persona) => (
                        <option key={persona.id_persona} value={persona.id_persona}>
                          {persona.nombre} {persona.apellidos}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Correo Gmail *</span>
                    <input
                      value={userForm.usuario}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          usuario: event.target.value,
                        }))
                      }
                      placeholder="usuario@gmail.com"
                    />
                  </label>

                  <label className="form-field">
                    <span>Contrasena *</span>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Minimo 8, mayuscula y numero"
                    />
                  </label>
                </div>

                <div className="modal-form__section">
                  <h3 className="modal-form__section-title">Permisos</h3>

                  <label className="form-field">
                    <span>Rol *</span>
                    <select
                      value={userForm.id_rol}
                      onChange={(event) =>
                        setUserForm((current) => ({
                          ...current,
                          id_rol: event.target.value,
                        }))
                      }
                    >
                      <option value="">Seleccione rol</option>
                      {roles.map((rol) => (
                        <option key={rol.id_rol} value={rol.id_rol}>
                          {rol.nombre} - {getRolDescripcion(rol.codigo)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="modal-form__actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setMostrarFormularioUsuario(false);
                      setUserForm(emptyUserForm);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={savingUser}
                  >
                    {savingUser ? "Creando..." : "Crear usuario"}
                  </button>
                </div>
              </form>
            </PageModal>
          )}

          {mostrarFormularioRol && (
            <PageModal
              title="Nuevo rol"
              onClose={() => {
                setMostrarFormularioRol(false);
                setRolForm(emptyRolForm);
              }}
              size="sm"
            >
              <form className="modal-form" onSubmit={handleCreateRol}>
                <p className="section-description">
                  Define un nuevo rol para permisos del sistema.
                </p>

                <div className="modal-form__section">
                  <h3 className="modal-form__section-title">Datos del rol</h3>

                  <label className="form-field">
                    <span>Nombre *</span>
                    <input
                      value={rolForm.nombre}
                      onChange={(event) =>
                        setRolForm((current) => ({
                          ...current,
                          nombre: event.target.value,
                        }))
                      }
                      placeholder="Gestor de recursos"
                      autoFocus
                    />
                  </label>

                  <label className="form-field">
                    <span>Codigo *</span>
                    <input
                      value={rolForm.codigo}
                      onChange={(event) =>
                        setRolForm((current) => ({
                          ...current,
                          codigo: event.target.value,
                        }))
                      }
                      placeholder="GESTOR_RECURSOS"
                    />
                  </label>
                </div>

                <div className="modal-form__actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      setMostrarFormularioRol(false);
                      setRolForm(emptyRolForm);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="button button-secondary"
                    disabled={savingRol}
                  >
                    {savingRol ? "Creando..." : "Crear rol"}
                  </button>
                </div>
              </form>
            </PageModal>
          )}
        </main>
      </div>
    </div>
  );
}

export default UsuariosPage;
