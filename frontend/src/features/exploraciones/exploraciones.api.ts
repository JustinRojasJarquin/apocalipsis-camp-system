import type {
  Exploracion,
  CrearExploracionForm,
  AsignarPersonaForm,
  RecursoLlevadoForm,
  RecursoEncontradoForm,
} from "./types";

const API_URL = "http://localhost:4000/api/exploraciones";

function getToken(): string {
  return localStorage.getItem("token") || "";
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function manejarRespuesta<T>(res: globalThis.Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.mensaje || "Error en la solicitud");
  }
  return data as T;
}

// ─── Exploración ──────────────────────────────────────────────────────────────

export const listarExploraciones = async (
  id_campamento: number
): Promise<Exploracion[]> => {
  const res = await fetch(`${API_URL}?campamento=${id_campamento}`, {
    headers: headers(),
  });
  return manejarRespuesta<Exploracion[]>(res);
};

export const obtenerExploracion = async (
  id: number
): Promise<Exploracion> => {
  const res = await fetch(`${API_URL}/${id}`, { headers: headers() });
  return manejarRespuesta<Exploracion>(res);
};

export const crearExploracion = async (
  datos: CrearExploracionForm
): Promise<Exploracion> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<Exploracion>(res);
};

export const actualizarEstado = async (
  id: number,
  estado: string,
  dias_extra_usados?: number
): Promise<Exploracion> => {
  const res = await fetch(`${API_URL}/${id}/estado`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ estado, dias_extra_usados }),
  });
  return manejarRespuesta<Exploracion>(res);
};

export const eliminarExploracion = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return manejarRespuesta<void>(res);
};

// ─── Personas en misión ───────────────────────────────────────────────────────

export const asignarPersona = async (
  id_exploracion: number,
  datos: AsignarPersonaForm
): Promise<void> => {
  const res = await fetch(`${API_URL}/${id_exploracion}/personas`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<void>(res);
};

export const quitarPersona = async (
  id_exploracion: number,
  id_persona: number
): Promise<void> => {
  const res = await fetch(
    `${API_URL}/${id_exploracion}/personas/${id_persona}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );
  return manejarRespuesta<void>(res);
};

// ─── Recursos ─────────────────────────────────────────────────────────────────

export const agregarRecursoLlevado = async (
  id_exploracion: number,
  datos: RecursoLlevadoForm
): Promise<void> => {
  const res = await fetch(`${API_URL}/${id_exploracion}/recursos-llevados`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<void>(res);
};

export const registrarRecursoEncontrado = async (
  id_exploracion: number,
  datos: RecursoEncontradoForm
): Promise<void> => {
  const res = await fetch(
    `${API_URL}/${id_exploracion}/recursos-encontrados`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(datos),
    }
  );
  return manejarRespuesta<void>(res);
};
