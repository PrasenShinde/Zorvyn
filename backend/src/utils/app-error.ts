export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
