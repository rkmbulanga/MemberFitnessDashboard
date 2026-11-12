export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const NotFound = (message: string): AppError =>
  new AppError(404, 'NOT_FOUND', message);

export const BadRequest = (message: string): AppError =>
  new AppError(400, 'BAD_REQUEST', message);

export const Conflict = (message: string): AppError =>
  new AppError(409, 'CONFLICT', message);
