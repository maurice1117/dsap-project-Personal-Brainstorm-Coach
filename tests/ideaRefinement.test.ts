import assert from 'node:assert/strict';
import test from 'node:test';
import { ZodError } from 'zod';
import { parseRefineIdeaOutput, REFINE_ACTION_LABELS } from '../src/lib/ideaRefinement';

const validRefinement = {
  action_label: '深入這個點子',
  refined_summary: '將專案收斂成一個能在課堂展示的互動式學習地圖。',
  recommended_changes: ['移除登入系統', '改用本地 JSON 當資料來源'],
  next_steps: ['定義資料格式', '完成互動原型', '加入推薦邏輯'],
  report_outline: ['動機與痛點', '資料結構設計', 'Demo 流程'],
  tradeoffs: ['功能範圍縮小，但 demo 更穩定'],
};

test('REFINE_ACTION_LABELS exposes all user-facing actions', () => {
  assert.equal(REFINE_ACTION_LABELS.deep_dive, '深入這個點子');
  assert.equal(REFINE_ACTION_LABELS.report_outline, '產生報告大綱');
});

test('parseRefineIdeaOutput accepts valid refinement output', () => {
  const parsed = parseRefineIdeaOutput(JSON.stringify(validRefinement));

  assert.equal(parsed.next_steps.length, 3);
  assert.equal(parsed.action_label, '深入這個點子');
});

test('parseRefineIdeaOutput rejects schema-invalid refinement output', () => {
  assert.throws(
    () => parseRefineIdeaOutput(JSON.stringify({ ...validRefinement, next_steps: ['太少'] })),
    ZodError
  );
});
