import { useEffect, useState } from "react";
import Navbar from "../../../shared/components/Navbar";
import { getPersonas } from "../../personas/personas.api";
import type { Persona } from "../../personas/types";
import { changeUserRole, createRol, getRoles } from "../../roles/roles.api";
import type { Rol } from "../../roles/roles.api";
import {
  changeUsuarioEstado,
  createUsuario,
  getUsuarios,
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

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [rolForm, setRolForm] = useState(emptyRolForm);

  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingRol, setSavingRol] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!userForm.usuario.endsWith("@gmail.com")) {
      setError("El usuario debe ser un correo Gmail.");
      return;
    }

    if (userForm.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
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
      setError("Debe ingresar nombre y código del rol.");
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear rol.");
    } finally {
      setSavingRol(false);
    }
  };

  const handleChangeRole = async (idUsuario: number, idRol: number) => {
    setError(null);

    try {
      await changeUserRole(idUsuario, idRol);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar rol.");
    }
  };

  const handleToggleEstado = async (usuario: UsuarioSistema) => {
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

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <Navbar />

        <main className="campamentos-page">
          <section className="campamentos-header">
            <div>
              <span className="page-badge">Administración</span>
              <h1>Usuarios y roles</h1>
              <p className="page-description">
                Crea cuentas de acceso, asigna roles y controla permisos del
                sistema.
              </p>
            </div>

            <div className="campamentos-stat">
              <span className="stat-label">Usuarios</span>
              <strong className="stat-value">{usuarios.length}</strong>
            </div>
          </section>

          {error && <div className="error-box">{error}</div>}

          <section className="campamentos-grid">
            <div className="campamentos-list-card">
              <div className="card-header">
                <div>
                  <h3>Usuarios registrados</h3>
                  <p className="small-text">
                    Administra el rol y estado de cada cuenta.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">Cargando usuarios...</div>
              ) : usuarios.length === 0 ? (
                <div className="empty-state">
                  No hay usuarios registrados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Correo</th>
                        <th>Persona</th>
                        <th>Campamento</th>
                        <th>Cargo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id_usuario}>
                          <td>{usuario.usuario}</td>

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
                                  {rol.nombre}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <span
                              className={
                                usuario.activo
                                  ? "status-badge status-active"
                                  : "status-badge status-inactive"
                              }
                            >
                              {usuario.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={
                                usuario.activo
                                  ? "button button-danger"
                                  : "button button-primary"
                              }
                              onClick={() => void handleToggleEstado(usuario)}
                            >
                              {usuario.activo ? "Desactivar" : "Activar"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="campamentos-form-card">
              <form onSubmit={handleCreateUsuario}>
                <div className="card-header">
                  <div>
                    <h3>Crear usuario</h3>
                    <p className="small-text">
                      Asocia una persona existente con un rol del sistema.
                    </p>
                  </div>
                </div>

                <label className="form-field">
                  <span>Persona</span>
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
                  <span>Correo Gmail</span>
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
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(event) =>
                      setUserForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Mínimo 6 caracteres"
                  />
                </label>

                <label className="form-field">
                  <span>Rol</span>
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
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={savingUser}
                >
                  {savingUser ? "Creando..." : "Crear usuario"}
                </button>
              </form>

              <hr style={{ margin: "28px 0", borderColor: "#334155" }} />

              <form onSubmit={handleCreateRol}>
                <div className="card-header">
                  <div>
                    <h3>Crear rol</h3>
                    <p className="small-text">
                      Define un nuevo rol para permisos del sistema.
                    </p>
                  </div>
                </div>

                <label className="form-field">
                  <span>Nombre</span>
                  <input
                    value={rolForm.nombre}
                    onChange={(event) =>
                      setRolForm((current) => ({
                        ...current,
                        nombre: event.target.value,
                      }))
                    }
                    placeholder="Gestor de recursos"
                  />
                </label>

                <label className="form-field">
                  <span>Código</span>
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

                <button
                  type="submit"
                  className="button button-secondary"
                  disabled={savingRol}
                >
                  {savingRol ? "Creando..." : "Crear rol"}
                </button>
              </form>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

export default UsuariosPage;