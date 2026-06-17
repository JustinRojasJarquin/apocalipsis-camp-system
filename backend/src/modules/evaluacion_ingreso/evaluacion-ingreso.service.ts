import { prisma } from "../../config/prisma";
import {
  recomendacionEvaluacionIngresoPorIA,
} from "../estado_persona/openrouter.service";
import {
  validateCreateEvaluacionIngreso,
  validateUpdateEvaluacionDecision,
} from "./evaluacion-ingreso.schemas";
import type {
  CreateEvaluacionIngresoDTO,
  EvaluacionIngresoResponseDTO,
  UpdateEvaluacionDecisionDTO,
} from "./evaluacion-ingreso.dto";
import {
  evaluacion_ingreso_decision_final,
  evaluacion_ingreso_recomendacion_ia,
} from "../../generated/prisma/enums";

const ensurePositiveId = (id: number, label = "ID") => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} inválido`);
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

const parseRecomendacionEvaluacionIA = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Respuesta vacía de la IA");
  }

  let jsonText = trimmed;
  if (!jsonText.startsWith("{")) {
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No se encontró JSON en la respuesta de la IA");
    }
    jsonText = match[0];
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("La respuesta de la IA no es JSON válido");
  }

  const recommendationRaw =
    parsed.recomendacion_ia ??
    parsed.recomendacionIA ??
    parsed.recommendation ??
    parsed.recommendationIA;
  const reasonRaw = parsed.motivo ?? parsed.reason ?? "";

  if (typeof recommendationRaw !== "string") {
    throw new Error("La recomendación de la IA no está disponible");
  }

  const recommendation = recommendationRaw.trim().toUpperCase();
  if (
    !Object.values(evaluacion_ingreso_recomendacion_ia).includes(
      recommendation as any,
    )
  ) {
    throw new Error(
      `Recomendación inválida de IA: ${recommendation}.`,
    );
  }

  return {
    recomendacion_ia: recommendation as typeof evaluacion_ingreso_recomendacion_ia[keyof typeof evaluacion_ingreso_recomendacion_ia],
    motivo_ia: typeof reasonRaw === "string" ? reasonRaw.trim() : "",
  };
};

const defaultInclude = {
  persona: {
    select: {
      id_persona: true,
      nombre: true,
      apellidos: true,
    },
  },
  campamento: {
    select: {
      id_campamento: true,
      nombre: true,
    },
  },
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

const ensureCampamentoExists = async (id_campamento: number) => {
  const campamento = await prisma.campamento.findUnique({
    where: { id_campamento },
    select: { id_campamento: true },
  });

  if (!campamento) {
    throw new Error("El campamento no existe");
  }
};

export const getEvaluaciones = async (): Promise<EvaluacionIngresoResponseDTO[]> => {
  return await prisma.evaluacion_ingreso.findMany({
    include: defaultInclude,
    orderBy: { fecha_evaluacion: "desc" },
  });
};

export const getEvaluacionById = async (
  id_evaluacion: number,
): Promise<EvaluacionIngresoResponseDTO> => {
  ensurePositiveId(id_evaluacion, "ID de evaluación");

  const evaluacion = await prisma.evaluacion_ingreso.findUnique({
    where: { id_evaluacion },
    include: defaultInclude,
  });

  if (!evaluacion) {
    throw new Error("La evaluación no existe");
  }

  return evaluacion;
};

export const createEvaluacionIngreso = async (
  data: CreateEvaluacionIngresoDTO,
): Promise<EvaluacionIngresoResponseDTO> => {
  validateCreateEvaluacionIngreso(data);
  await ensurePersonaExists(data.id_persona);
  await ensureCampamentoExists(data.id_campamento);

  const persona = await prisma.persona.findUnique({
    where: { id_persona: data.id_persona },
    select: {
      nombre: true,
      apellidos: true,
    },
  });

  const campamento = await prisma.campamento.findUnique({
    where: { id_campamento: data.id_campamento },
    select: { nombre: true },
  });

  const personaDescripcion = persona
    ? `${persona.nombre} ${persona.apellidos}`
    : `Persona #${data.id_persona}`;
  const campamentoDescripcion = campamento?.nombre ?? `Campamento #${data.id_campamento}`;

  let recomendacion = "ACEPTAR" as typeof evaluacion_ingreso_recomendacion_ia[keyof typeof evaluacion_ingreso_recomendacion_ia];
  let motivo_ia = "Sin razón disponible";

  try {
    const raw = await recomendacionEvaluacionIngresoPorIA({
      persona: personaDescripcion,
      campamento: campamentoDescripcion,
    });
    const parsed = parseRecomendacionEvaluacionIA(raw);
    recomendacion = parsed.recomendacion_ia;
    motivo_ia = parsed.motivo_ia || motivo_ia;
  } catch (error) {
    motivo_ia = error instanceof Error ? error.message : motivo_ia;
  }

  return await prisma.evaluacion_ingreso.create({
    data: {
      id_persona: data.id_persona,
      id_campamento: data.id_campamento,
      fecha_evaluacion: new Date(),
      recomendacion_ia: recomendacion,
      motivo_ia,
    },
    include: defaultInclude,
  });
};

export const finalizeEvaluacionIngreso = async (
  id_evaluacion: number,
  data: UpdateEvaluacionDecisionDTO,
): Promise<EvaluacionIngresoResponseDTO> => {
  ensurePositiveId(id_evaluacion, "ID de evaluación");
  validateUpdateEvaluacionDecision(data);

  const evaluacion = await prisma.evaluacion_ingreso.findUnique({
    where: { id_evaluacion },
  });

  if (!evaluacion) {
    throw new Error("La evaluación no existe");
  }

  return await prisma.evaluacion_ingreso.update({
    where: { id_evaluacion },
    data: {
      decision_final: data.decision_final,
      comentarios: normalizeText(data.comentarios) ?? null,
      id_usuario_decide: data.id_usuario_decide ?? undefined,
      fecha_decision: new Date(),
    },
    include: defaultInclude,
  });
};
