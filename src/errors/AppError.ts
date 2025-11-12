export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class GeminiServiceError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'GEMINI_SERVICE_ERROR');
    this.name = 'GeminiServiceError';
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}
