import { z } from 'zod';

export type GenerateRawOutput = (attempt: number) => Promise<string | null | undefined>;
export type ParseOutput<T> = (rawOutput: string) => T;

export type RetryOptions = {
  maxRetries: number;
};

function isRetryableOutputError(error: unknown) {
  return error instanceof SyntaxError || error instanceof z.ZodError;
}

export async function generateWithOutputRetry<T>(
  generateRawOutput: GenerateRawOutput,
  parseOutput: ParseOutput<T>,
  { maxRetries }: RetryOptions
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const rawOutput = await generateRawOutput(attempt);

      if (!rawOutput) {
        throw new SyntaxError("LLM 回傳內容為空");
      }

      return parseOutput(rawOutput);
    } catch (error) {
      if (!isRetryableOutputError(error) || attempt === maxRetries) {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError;
}
