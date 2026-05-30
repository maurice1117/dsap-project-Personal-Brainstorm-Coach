import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { getApiErrorBody } from '../src/lib/apiErrors';

test('getApiErrorBody classifies plain OpenAI timeout errors', () => {
  const error = new Error('Request timed out.');

  assert.deepEqual(getApiErrorBody(error), {
    error: 'LLM 回應逾時，請稍後再試。',
    code: 'LLM_TIMEOUT',
  });
});

test('getApiErrorBody classifies non-JSON LLM responses', () => {
  assert.deepEqual(getApiErrorBody(new SyntaxError('Unexpected token')), {
    error: 'LLM 回傳格式錯誤，請重新生成。',
    code: 'LLM_INVALID_JSON',
  });
});

test('getApiErrorBody includes validation details for invalid LLM output', () => {
  const parseResult = z.object({ projects: z.array(z.string()).length(3) }).safeParse({
    projects: ['only one'],
  });

  assert.equal(parseResult.success, false);
  if (!parseResult.success) {
    const body = getApiErrorBody(parseResult.error);
    assert.equal(body.code, 'LLM_INVALID_OUTPUT');
    assert.notEqual(body.details, undefined);
  }
});
