import { z } from 'zod';
import {
  APIConnectionTimeoutError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from 'openai';

export type ErrorResponse = {
  error: string;
  code: string;
  details?: unknown;
};

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`.toLowerCase();
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = 'message' in error ? String(error.message) : '';
    const maybeName = 'name' in error ? String(error.name) : '';
    return `${maybeName} ${maybeMessage}`.toLowerCase();
  }

  return String(error).toLowerCase();
}

function isTimeoutError(error: unknown) {
  const errorText = getErrorText(error);
  return (
    error instanceof APIConnectionTimeoutError ||
    errorText.includes('request timed out') ||
    errorText.includes('timeout')
  );
}

export function getApiErrorBody(error: unknown): ErrorResponse {
  if (isTimeoutError(error)) {
    return {
      error: "LLM 回應逾時，請稍後再試。",
      code: "LLM_TIMEOUT",
    };
  }

  if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
    return {
      error: "LLM 服務驗證失敗，請確認 API Key 設定。",
      code: "LLM_AUTH_ERROR",
    };
  }

  if (error instanceof RateLimitError) {
    return {
      error: "LLM 服務暫時無法使用，可能是額度不足或請求過多。",
      code: "LLM_QUOTA_OR_RATE_LIMIT",
    };
  }

  if (error instanceof SyntaxError) {
    return {
      error: "LLM 回傳格式錯誤，請重新生成。",
      code: "LLM_INVALID_JSON",
    };
  }

  if (error instanceof z.ZodError) {
    return {
      error: "LLM 回傳資料不符合預期格式，請重新生成。",
      code: "LLM_INVALID_OUTPUT",
      details: error.flatten().fieldErrors,
    };
  }

  return {
    error: "伺服器發生未知錯誤，請稍後再試。",
    code: "INTERNAL_SERVER_ERROR",
  };
}
