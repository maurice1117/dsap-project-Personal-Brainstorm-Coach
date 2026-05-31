import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPrompt, type GenerateIdeasInput } from '../src/lib/promptBuilder';

const sampleInput: GenerateIdeasInput = {
  project_context: 'course_final',
  interests: ['AI 應用'],
  experience_level: 'intermediate',
  focus_skills: ['演算法與資料結構'],
  data_sources: ['PDF 文件'],
  success_criteria: ['可現場 Demo'],
  course_requirements: ['資料結構'],
  time_scope: {
    duration_weeks: 4,
    hours_per_week: 10,
  },
  goal: '做一個 RAG 課程資料問答系統',
};

test('buildPrompt requires Traditional Chinese user-facing output', () => {
  const { systemPrompt, userPrompt } = buildPrompt(sampleInput);

  assert.match(systemPrompt, /繁體中文/);
  assert.match(systemPrompt, /JSON 欄位名稱維持英文 schema/);
  assert.match(userPrompt, /所有使用者可見文字請使用繁體中文/);
});
