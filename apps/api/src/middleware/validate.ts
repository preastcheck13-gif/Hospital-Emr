import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodObject<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.flatten()
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
