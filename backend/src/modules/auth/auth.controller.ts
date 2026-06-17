import { Request, Response } from "express";
import { login } from "./auth.service";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const loginAttempts = new Map<
  string,
  { count: number; firstAttemptAt: number }
>();

const getAttemptKey = (req: Request, usuario: string) =>
  `${req.ip}:${usuario.trim().toLowerCase()}`;

const isBlocked = (key: string) => {
  const attempt = loginAttempts.get(key);

  if (!attempt) return false;

  if (Date.now() - attempt.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }

  return attempt.count >= MAX_LOGIN_ATTEMPTS;
};

const registerFailedAttempt = (key: string) => {
  const attempt = loginAttempts.get(key);
  const now = Date.now();

  if (!attempt || now - attempt.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  loginAttempts.set(key, {
    count: attempt.count + 1,
    firstAttemptAt: attempt.firstAttemptAt,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const { usuario, password } = req.body;

  if (typeof usuario !== "string" || typeof password !== "string") {
    return res.status(400).json({
      mensaje: "Debe enviar usuario y password",
    });
  }

  if (!usuario.trim() || !password.trim()) {
    return res.status(400).json({
      mensaje: "Usuario y contraseña no pueden estar vacíos",
    });
  }

  const attemptKey = getAttemptKey(req, usuario);

  if (isBlocked(attemptKey)) {
    return res.status(429).json({
      mensaje: "Demasiados intentos. Intenta de nuevo en unos minutos.",
    });
  }

  try {
    const resultado = await login(usuario, password);
    loginAttempts.delete(attemptKey);

    return res.status(200).json(resultado);
  } catch (error) {
    registerFailedAttempt(attemptKey);

    return res.status(401).json({
      mensaje:
        error instanceof Error ? error.message : "No se pudo iniciar sesión",
    });
  }
};
