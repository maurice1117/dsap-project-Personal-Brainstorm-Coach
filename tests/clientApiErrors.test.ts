import assert from 'node:assert/strict';
import test from 'node:test';
import { getApiStatusMessage, getNetworkErrorMessage } from '../src/lib/clientApiErrors';

test('getApiStatusMessage prefers backend-provided friendly errors', () => {
  assert.equal(
    getApiStatusMessage(500, { error: 'LLM 回應逾時，請稍後再試。', code: 'LLM_TIMEOUT' }),
    'LLM 回應逾時，請稍後再試。'
  );
});

test('getApiStatusMessage falls back for 400-level errors', () => {
  assert.equal(
    getApiStatusMessage(400, null),
    '送出的資料格式有誤，請檢查表單內容後再試。'
  );
});

test('getApiStatusMessage falls back for 500-level errors', () => {
  assert.equal(
    getApiStatusMessage(500, null),
    '系統發生錯誤，請重試。'
  );
});

test('getNetworkErrorMessage reports offline state before generic network errors', () => {
  assert.equal(
    getNetworkErrorMessage(new TypeError('Failed to fetch'), false),
    '請檢查網路連線，連線恢復後再試一次。'
  );
});

test('getNetworkErrorMessage reports aborted requests as timeout', () => {
  assert.equal(
    getNetworkErrorMessage(new DOMException('Aborted', 'AbortError'), true),
    '系統等候太久沒有回應，請稍後再試。'
  );
});
