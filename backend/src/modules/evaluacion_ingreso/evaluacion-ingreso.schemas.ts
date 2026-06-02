import {
  evaluacion_ingreso_decision_final,
} from "../../generated/prisma/enums";
import type {
  CreateEvaluacionIngresoDTO,
  UpdateEvaluacionDecisionDTO,
} from "./evaluacion-ingreso.dto";

const ensurePositiveId = (value: number, label: string) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} inválido`);
  }
};

const ensureString = (value: unknown, label: string, required = false) => {
  if (value === undefined || value === null) {
    if (required) {
      throw new Error(`${label} es obligatorio`);
    }
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`${label} debe ser texto`);
  }
};

export const validateCreateEvaluacionIngreso = (
  data: CreateEvaluacionIngresoDTO,
) => {
  ensurePositiveId(data.id_persona, "ID de persona");
  ensurePositiveId(data.id_campamento, "ID de campamento");
};

export const validateUpdateEvaluacionDecision = (
  data: UpdateEvaluacionDecisionDTO,
) => {
  if (!data || typeof data !== "object") {
    throw new Error("Datos de decisión inválidos");
  }

  ensureString(data.decision_final, "Decisión final", true);
  const normalized = data.decision_final?.toString().trim().toUpperCase();

  if (!Object.values(evaluacion_ingreso_decision_final).includes(normalized as any)) {
    throw new Error(
      `Decisión final inválida. Debe ser ${Object.values(
        evaluacion_ingreso_decision_final,
      ).join(" o ")}`,
    );
  }

  if (data.comentarios !== undefined && data.comentarios !== null) {
    ensureString(data.comentarios, "Comentarios");
  }

  if (data.id_usuario_decide !== undefined && data.id_usuario_decide !== null) {
    ensurePositiveId(data.id_usuario_decide, "ID de usuario");
  }
};
