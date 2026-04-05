import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    /** Set by `validateQuery` — use this instead of mutating `req.query`. */
    validatedQuery?: unknown;
  }
}

export {};
