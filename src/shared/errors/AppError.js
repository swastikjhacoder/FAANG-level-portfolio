export class AppError extends Error {
  constructor(message, code = "INTERNAL_ERROR", status = 500, meta = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }
}
