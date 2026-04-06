import { Request, Response } from "express";
import {
  listarExploraciones,
  obtenerExploracion,
  crearExploracion,
  actualizarEstado,
  asignarPersona,
  quitarPersona,
  agregarRecursoLlevado,
  registrarRecursoEncontrado,
} from "./exploraciones.service";
import {
  validarCrearExploracion,
  validarActualizarEstado,
  validarAsignarPersona,
  validarRecursoLlevado,
  validarRecursoEncontrado,
} from "./exploraciones.schemas";

export const listarExploracionesController = async (
  req: Request,
  res: Response
) => {
  try {
    const id_campamento = Number(req.query.campamento);

    if (!id_campamento || isNaN(id_campamento)) {
      return res
        .status(400)
        .json({ mensaje: "El parámetro campamento es requerido" });
    }

    const exploraciones = await listarExploraciones(id_campamento);
    return res.status(200).json(exploraciones);
  } catch (error: any) {
    return res.status(500).json({ mensaje: error.message });
  }
};

export const obtenerExploracionController = async (
  req: Request,
  res: Response
) => {
  try {
    const id_exploracion = Number(req.params.id);
    const exploracion = await obtenerExploracion(id_exploracion);
    return res.status(200).json(exploracion);
  } catch (error: any) {
    const status = error.message === "Exploración no encontrada" ? 404 : 500;
    return res.status(status).json({ mensaje: error.message });
  }
};

export const crearExploracionController = async (
  req: Request,
  res: Response
) => {
  try {
    const datos = validarCrearExploracion(req.body);
    const nueva = await crearExploracion(datos);
    return res.status(201).json(nueva);
  } catch (error: any) {
    return res.status(400).json({ mensaje: error.message });
  }
};

export const actualizarEstadoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id_exploracion = Number(req.params.id);
    const datos = validarActualizarEstado(req.body);
    const actualizada = await actualizarEstado(id_exploracion, datos);
    return res.status(200).json(actualizada);
  } catch (error: any) {
    const status = error.message === "Exploración no encontrada" ? 404 : 400;
    return res.status(status).json({ mensaje: error.message });
  }
};

export const asignarPersonaController = async (
  req: Request,
  res: Response
) => {
  try {
    const id_exploracion = Number(req.params.id);
    const datos = validarAsignarPersona(req.body);
    const asignacion = await asignarPersona(id_exploracion, datos);
    return res.status(201).json(asignacion);
  } catch (error: any) {
    const status = error.message === "Exploración no encontrada" ? 404 : 400;
    return res.status(status).json({ mensaje: error.message });
  }
};

export const quitarPersonaController = async (req: Request, res: Response) => {
  try {
    const id_exploracion = Number(req.params.id);
    const id_persona = Number(req.params.id_persona);
    await quitarPersona(id_exploracion, id_persona);
    return res
      .status(200)
      .json({ mensaje: "Persona removida de la exploración" });
  } catch (error: any) {
    const status = error.message === "Exploración no encontrada" ? 404 : 400;
    return res.status(status).json({ mensaje: error.message });
  }
};

export const agregarRecursoLlevadoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id_exploracion = Number(req.params.id);
    const datos = validarRecursoLlevado(req.body);
    const recurso = await agregarRecursoLlevado(id_exploracion, datos);
    return res.status(201).json(recurso);
  } catch (error: any) {
    const status = error.message === "Exploración no encontrada" ? 404 : 400;
    return res.status(status).json({ mensaje: error.message });
  }
};

export const registrarRecursoEncontradoController = async (
  req: Request,
  res: Response
) => {
  try {
    const id_exploracion = Number(req.params.id);
    const datos = validarRecursoEncontrado(req.body);
    const recurso = await registrarRecursoEncontrado(id_exploracion, datos);
    return res.status(201).json(recurso);
  } catch (error: any) {
    const status = error.message === "Exploración no encontrada" ? 404 : 400;
    return res.status(status).json({ mensaje: error.message });
  }
};
