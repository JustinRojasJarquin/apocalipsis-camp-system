import { Request, Response, NextFunction } from "express";

type Validator<T> = (data: T) => string | null;

export const validateBody = <T>(validator: Validator<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const error = validator(req.body);

    if (error) {
      return res.status(400).json({
        mensaje: error,
      });
    }

    next();
  };
};