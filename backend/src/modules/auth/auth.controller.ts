import { Request, Response } from "express";
import { login } from "./auth.service";

//Extraer del body enviado por el cliente, el usuario y contraseña 
export const loginController = async (req: Request, res: Response) => {
  try {
    const { usuario, password } = req.body;
//Validar que los datos se digiten correctamente en los campos requeridos
    if (!usuario || !password) {
      return res.status(400).json({
        mensaje: "Debe escribir el usuario y su contraseña",
      });
    }
//Devolver json con usuario y contraseña
    const resultado = await login(usuario, password);

    return res.status(200).json(resultado);

//Usuario incorrecto, contraseña incorrecta, usuario inactivo devuelve error.
  } catch (error: any) {
    return res.status(401).json({
      mensaje: error.message,
    });
  }
};