export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields?: ReadonlyArray<{ path: string; message: string }>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: ReadonlyArray<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export class ConflictError extends ApiError {
  constructor(code: string, message: string) {
    super(409, code, message);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super(cause instanceof Error ? cause.message : 'Сетевая ошибка');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}
