export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorPayload(error: unknown, requestId: string) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        success: false,
        error: { code: error.code, message: error.message, details: error.details },
        meta: { requestId },
      },
    };
  }
  return {
    status: 500,
    body: {
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error.' },
      meta: { requestId },
    },
  };
}
