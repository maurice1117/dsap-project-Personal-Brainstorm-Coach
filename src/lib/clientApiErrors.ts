export const GENERATE_IDEAS_TIMEOUT_MS = 75_000;

export type ApiErrorPayload = {
  error?: unknown;
  code?: unknown;
};

export function getApiStatusMessage(status: number, payload: ApiErrorPayload | null) {
  if (typeof payload?.error === 'string' && payload.error.trim() !== '') {
    return payload.error;
  }

  if (status >= 400 && status < 500) {
    return '送出的資料格式有誤，請檢查表單內容後再試。';
  }

  if (status >= 500) {
    return '系統發生錯誤，請重試。';
  }

  return '無法產生專案點子，請稍後再試。';
}

export function getNetworkErrorMessage(error: unknown, isOnline: boolean) {
  if (!isOnline) {
    return '請檢查網路連線，連線恢復後再試一次。';
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return '系統等候太久沒有回應，請稍後再試。';
  }

  return '網路連線不穩，請稍後再試。';
}
