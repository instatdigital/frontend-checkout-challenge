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

export async function parseErrorResponse(response: Response): Promise<never> {
  const status = response.status;
  let code = 'UNKNOWN_ERROR';
  let message = `HTTP ${status}`;
  let fields: ReadonlyArray<{ path: string; message: string }> | undefined;

  try {
    const body = await response.json();
    const error = body?.error;
    if (error) {
      code = error.code ?? code;
      message = error.message ?? message;
      fields = error.fields;
    }
  } catch {
    // body not JSON — use defaults
  }

  if (status === 409) throw new ConflictError(code, message);
  throw new ApiError(status, code, message, fields);
}
