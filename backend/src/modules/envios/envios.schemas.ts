import { ConfirmarSalidaDTO, ConfirmarLlegadaDTO } from "./envios.dto";

const parseFecha = (valor: string): Date => {
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) throw new Error("Fecha inválida");
  return fecha;
};

export const validateConfirmarSalida = (data: ConfirmarSalidaDTO): void => {
  if (data.fecha_salida_aprobada !== undefined) {
    parseFecha(data.fecha_salida_aprobada);
  }
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
