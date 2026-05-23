import {
  ConfirmarSalidaDTO,
  ConfirmarLlegadaDTO,
  CreateEnvioDTO,
  UpdateEnvioDTO,
} from "./envios.dto";

const parseFecha = (valor: string): Date => {
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) throw new Error("Fecha inválida");
  return fecha;
};

const validateRangoFechas = (salida?: string, llegada?: string): void => {
  if (!salida || !llegada) return;

  const fechaSalida = parseFecha(salida);
  const fechaLlegada = parseFecha(llegada);

  if (fechaLlegada <= fechaSalida) {
    throw new Error(
      "fecha_llegada_programada debe ser posterior a fecha_salida_programada"
    );
  }
};

export const validateConfirmarSalida = (data: ConfirmarSalidaDTO): void => {
  if (data.fecha_salida_aprobada !== undefined) {
    parseFecha(data.fecha_salida_aprobada);
  }
};

const ensurePositiveInteger = (value: unknown, label: string) => {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`${label} debe ser un entero positivo`);
  }
};

const ensurePositiveNumber = (value: unknown, label: string) => {
  if (typeof value !== "number" || value <= 0) {
    throw new Error(`${label} debe ser un numero mayor a 0`);
  }
};

const validateDetalleEnvio = (
  recursos?: CreateEnvioDTO["recursos"],
  personas?: CreateEnvioDTO["personas"],
) => {
  if (recursos) {
    for (const recurso of recursos) {
      ensurePositiveInteger(recurso.id_recurso, "id_recurso");
      ensurePositiveNumber(recurso.cantidad_enviada, "cantidad_enviada");
    }
  }

  if (personas) {
    for (const persona of personas) {
      ensurePositiveInteger(persona.id_persona, "id_persona");
      if (
        persona.raciones_viaje !== undefined &&
        (typeof persona.raciones_viaje !== "number" ||
          persona.raciones_viaje < 0)
      ) {
        throw new Error("raciones_viaje debe ser un numero mayor o igual a 0");
      }
    }
  }
};

export const validateCrearEnvio = (data: CreateEnvioDTO): void => {
  ensurePositiveInteger(data.id_solicitud, "id_solicitud");
  ensurePositiveInteger(data.id_campamento_origen, "id_campamento_origen");
  ensurePositiveInteger(data.id_campamento_destino, "id_campamento_destino");

  if (data.id_campamento_origen === data.id_campamento_destino) {
    throw new Error("El campamento origen y destino deben ser diferentes");
  }

  parseFecha(data.fecha_salida_programada);
  parseFecha(data.fecha_llegada_programada);
  validateRangoFechas(
    data.fecha_salida_programada,
    data.fecha_llegada_programada
  );
  validateDetalleEnvio(data.recursos, data.personas);

  if (!data.recursos?.length && !data.personas?.length) {
    throw new Error("El envio debe incluir recursos o personas");
  }
};

export const validateActualizarEnvio = (data: UpdateEnvioDTO): void => {
  if (data.fecha_salida_programada !== undefined) {
    parseFecha(data.fecha_salida_programada);
  }

  if (data.fecha_llegada_programada !== undefined) {
    parseFecha(data.fecha_llegada_programada);
  }

  validateRangoFechas(
    data.fecha_salida_programada,
    data.fecha_llegada_programada
  );
  validateDetalleEnvio(data.recursos, data.personas);
};

export const validateConfirmarLlegada = (data: ConfirmarLlegadaDTO): void => {
  if (data.fecha_llegada_aprobada !== undefined) {
    parseFecha(data.fecha_llegada_aprobada);
  }

  if (data.recursos_recibidos) {
    for (const r of data.recursos_recibidos) {
      if (!Number.isInteger(r.id_envio_recurso) || r.id_envio_recurso <= 0) {
        throw new Error("id_envio_recurso debe ser un entero positivo");
      }
      if (typeof r.cantidad_recibida !== "number" || r.cantidad_recibida < 0) {
        throw new Error("cantidad_recibida debe ser un número mayor o igual a 0");
      }
    }
  }
};
