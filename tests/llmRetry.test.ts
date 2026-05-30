import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { generateWithOutputRetry } from '../src/lib/llmRetry';

test('generateWithOutputRetry retries invalid JSON output and returns parsed result', async () => {
  let calls = 0;

  const result = await generateWithOutputRetry(
    async () => {
      calls += 1;
      return calls === 1 ? 'not json' : '{"ok":true}';
    },
    (rawOutput) => JSON.parse(rawOutput) as { ok: boolean },
    { maxRetries: 2 }
  );

  assert.deepEqual(result, { ok: true });
  assert.equal(calls, 2);
});

test('generateWithOutputRetry retries schema-invalid output', async () => {
  let calls = 0;
  const schema = z.object({ projects: z.array(z.string()).length(3) });

  const result = await generateWithOutputRetry(
    async () => {
      calls += 1;
      return calls === 1
        ? '{"projects":["only one"]}'
        : '{"projects":["one","two","three"]}';
    },
    (rawOutput) => schema.parse(JSON.parse(rawOutput)),
    { maxRetries: 2 }
  );

  assert.deepEqual(result, { projects: ['one', 'two', 'three'] });
  assert.equal(calls, 2);
});

test('generateWithOutputRetry does not retry non-output errors', async () => {
  let calls = 0;
  const timeoutError = new Error('Request timed out.');

  await assert.rejects(
    () => generateWithOutputRetry(
      async () => {
        calls += 1;
        throw timeoutError;
      },
      (rawOutput) => JSON.parse(rawOutput),
      { maxRetries: 2 }
    ),
    timeoutError
  );

  assert.equal(calls, 1);
});

test('generateWithOutputRetry stops after max retries', async () => {
  let calls = 0;

  await assert.rejects(
    () => generateWithOutputRetry(
      async () => {
        calls += 1;
        return 'still not json';
      },
      (rawOutput) => JSON.parse(rawOutput),
      { maxRetries: 2 }
    ),
    SyntaxError
  );

  assert.equal(calls, 3);
});
