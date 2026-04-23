import { Request, Response } from "express";
import { login } from "./auth.service";


export const loginController = async (req: Request, res: Response) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        mensaje: "Debe enviar usuario y password",
      });
    }

    const resultado = await login(usuario, password);

    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(401).json({
      mensaje: error.message,
    });
  }
};