import { prisma } from "../../config/prisma";
import {
  validateCreatePersona,
  validateUpdatePersona,
} from "./personas.schemas";
import type {
  CreatePersonaDTO,
  PersonaFiltersDTO,
  UpdatePersonaDTO,
} from "./personas.dto";

const personaInclude = {
  campamento: {
    select: {
      id_campamento: true,
      nombre: true,
    },
  },
  cargo: {
    select: {
      id_cargo: true,
      nombre: true,
    },
  },
  estado_persona: {
    select: {
      id_estado: true,
      nombre: true,
    },
  },
  asignacion_cargo: {
    include: {
      cargo: {
        select: {
          id_cargo: true,
          nombre: true,
        },
      },
      campamento: {
        select: {
          id_campamento: true,
          nombre: true,
        },
      },
    },
    orderBy: {
      fecha_inicio: "desc",
    },
  },
} as const;

const ensurePositiveId = (id: number, label = "ID") => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} invalido`);
  }
};

const normalizeText = (value: string | null | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeDate = (value: string | null | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value.trim() === "") {
    return null;
  }

  return new Date(value);
};

const ensureCampamentoExists = async (id_campamento: number) => {
  const campamento = await prisma.campamento.findUnique({
    where: { id_campamento },
    select: { id_campamento: true },
  });

  if (!campamento) {
    throw new Error("El campamento seleccionado no existe");
  }
};

const ensureCargoExists = async (id_cargo_actual?: number | null) => {
  if (!id_cargo_actual) {
    return;
  }

  const cargo = await prisma.cargo.findUnique({
    where: { id_cargo: id_cargo_actual },
    select: { id_cargo: true },
  });

  if (!cargo) {
    throw new Error("El cargo seleccionado no existe");
  }
};

const ensureEstadoExists = async (id_estado_actual?: number | null) => {
  if (!id_estado_actual) {
    return;
  }

  const estado = await prisma.estado_persona.findUnique({
    where: { id_estado: id_estado_actual },
    select: { id_estado: true },
  });

  if (!estado) {
    throw new Error("El estado seleccionado no existe");
  }
};

const ensurePersonaExists = async (id_persona: number) => {
  const persona = await prisma.persona.findUnique({
    where: { id_persona },
    select: { id_persona: true },
  });

  if (!persona) {
    throw new Error("La persona no existe");
  }
};

const buildCreatePersonaData = (data: CreatePersonaDTO) => ({
  id_campamento: data.id_campamento,
  cedula: data.cedula.trim(),
  nombre: data.nombre.trim(),
  apellidos: data.apellidos.trim(),
  fecha_nacimiento: normalizeDate(data.fecha_nacimiento) ?? null,
  foto_url: normalizeText(data.foto_url) ?? null,
  imagen_carnet_url: normalizeText(data.imagen_carnet_url) ?? null,
  codigo_campamento: normalizeText(data.codigo_campamento) ?? null,
  id_cargo_actual: data.id_cargo_actual ?? null,
  id_estado_actual: data.id_estado_actual ?? null,
  activo: true,
});

const buildUpdatePersonaData = (data: UpdatePersonaDTO) => ({
  ...(data.id_campamento !== undefined
    ? { id_campamento: data.id_campamento }
    : {}),
  ...(data.cedula !== undefined ? { cedula: data.cedula.trim() } : {}),
  ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
  ...(data.apellidos !== undefined ? { apellidos: data.apellidos.trim() } : {}),
  ...(data.fecha_nacimiento !== undefined
    ? { fecha_nacimiento: normalizeDate(data.fecha_nacimiento) }
    : {}),
  ...(data.foto_url !== undefined
    ? { foto_url: normalizeText(data.foto_url) }
    : {}),
  ...(data.imagen_carnet_url !== undefined
    ? { imagen_carnet_url: normalizeText(data.imagen_carnet_url) }
    : {}),
  ...(data.codigo_campamento !== undefined
    ? { codigo_campamento: normalizeText(data.codigo_campamento) }
    : {}),
  ...(data.id_cargo_actual !== undefined
    ? { id_cargo_actual: data.id_cargo_actual }
    : {}),
  ...(data.id_estado_actual !== undefined
    ? { id_estado_actual: data.id_estado_actual }
    : {}),
  ...(data.activo !== undefined ? { activo: data.activo } : {}),
});

const buildPersonaWhere = (filters: PersonaFiltersDTO = {}) => {
  const where: Record<string, unknown> = {
    activo: filters.activo ?? true,
  };

  if (filters.id_campamento) {
    where.id_campamento = filters.id_campamento;
  }

  if (filters.id_cargo) {
    where.id_cargo_actual = filters.id_cargo;
  }

  if (filters.id_estado) {
    where.id_estado_actual = filters.id_estado;
  }

  const buscar = filters.buscar?.trim();

  if (buscar) {
    where.OR = [
      { cedula: { contains: buscar } },
      { nombre: { contains: buscar } },
      { apellidos: { contains: buscar } },
      { codigo_campamento: { contains: buscar } },
      { campamento: { nombre: { contains: buscar } } },
      { cargo: { nombre: { contains: buscar } } },
      { estado_persona: { nombre: { contains: buscar } } },
    ];
  }

  return where;
};

type CargoAssignmentClient = Pick<
  typeof prisma,
  "asignacion_cargo"
>;

const ensureCedulaDisponible = async (cedula: string, id_persona?: number) => {
  const persona = await prisma.persona.findFirst({
    where: {
      cedula: cedula.trim(),
      activo: true,
      ...(id_persona ? { NOT: { id_persona } } : {}),
    },
    select: { id_persona: true },
  });

  if (persona) {
    throw new Error("Ya existe una persona activa con esa cedula");
  }
};

const closeCurrentCargoAssignment = async (
  tx: CargoAssignmentClient,
  id_persona: number,
  fecha_fin: Date,
) => {
  await tx.asignacion_cargo.updateMany({
    where: {
      id_persona,
      fecha_fin: null,
    },
    data: { fecha_fin },
  });
};

const createCargoAssignment = async (
  tx: CargoAssignmentClient,
  id_persona: number,
  id_campamento: number,
  id_cargo: number,
  fecha_inicio: Date,
) => {
  await tx.asignacion_cargo.create({
    data: {
      id_persona,
      id_campamento,
      id_cargo,
      fecha_inicio,
      temporal: false,
    },
  });
};

export const getPersonas = async (filters: PersonaFiltersDTO = {}) => {
  return await prisma.persona.findMany({
    where: buildPersonaWhere(filters),
    include: personaInclude,
    orderBy: [{ nombre: "asc" }, { apellidos: "asc" }],
  });
};

export const getPersonaById = async (id: number) => {
  ensurePositiveId(id);

  const persona = await prisma.persona.findUnique({
    where: { id_persona: id },
    include: personaInclude,
  });

  if (!persona) {
    throw new Error("La persona no existe");
  }

  return persona;
};

export const createPersona = async (data: CreatePersonaDTO) => {
  validateCreatePersona(data);

  await ensureCedulaDisponible(data.cedula);
  await ensureCampamentoExists(data.id_campamento);
  await ensureCargoExists(data.id_cargo_actual);
  await ensureEstadoExists(data.id_estado_actual);

  return await prisma.$transaction(async (tx) => {
    const persona = await tx.persona.create({
      data: buildCreatePersonaData(data),
      include: personaInclude,
    });

    if (data.id_cargo_actual) {
      await createCargoAssignment(
        tx,
        persona.id_persona,
        data.id_campamento,
        data.id_cargo_actual,
        new Date(),
      );
    }

    return await tx.persona.findUniqueOrThrow({
      where: { id_persona: persona.id_persona },
      include: personaInclude,
    });
  });
};

export const updatePersona = async (id: number, data: UpdatePersonaDTO) => {
  ensurePositiveId(id);
  validateUpdatePersona(data);

  const currentPersona = await prisma.persona.findUnique({
    where: { id_persona: id },
    select: {
      id_persona: true,
      id_campamento: true,
      id_cargo_actual: true,
    },
  });

  if (!currentPersona) {
    throw new Error("La persona no existe");
  }

  if (data.id_campamento !== undefined) {
    await ensureCampamentoExists(data.id_campamento);
  }

  if (data.cedula !== undefined) {
    await ensureCedulaDisponible(data.cedula, id);
  }

  await ensureCargoExists(data.id_cargo_actual);
  await ensureEstadoExists(data.id_estado_actual);

  const nextCargoId = data.id_cargo_actual;
  const nextCampamentoId = data.id_campamento ?? currentPersona.id_campamento;
  const cargoChanged =
    nextCargoId !== undefined && nextCargoId !== currentPersona.id_cargo_actual;

  return await prisma.$transaction(async (tx) => {
    const persona = await tx.persona.update({
      where: { id_persona: id },
      data: buildUpdatePersonaData(data),
      include: personaInclude,
    });

    if (cargoChanged) {
      const now = new Date();
      await closeCurrentCargoAssignment(tx, id, now);

      if (nextCargoId) {
        await createCargoAssignment(
          tx,
          id,
          nextCampamentoId,
          nextCargoId,
          now,
        );
      }
    }

    return persona;
  });
};

export const deletePersona = async (id: number) => {
  ensurePositiveId(id);
  await ensurePersonaExists(id);

  return await prisma.persona.update({
    where: { id_persona: id },
    data: { activo: false },
    include: personaInclude,
  });
};
export const getCargos = async () => {
  return prisma.cargo.findMany({
    orderBy: { nombre: "asc" },
  });
};

export const getEstados = async () => {
  return prisma.estado_persona.findMany({
    orderBy: { nombre: "asc" },
  });
};
