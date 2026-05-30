import assert from 'node:assert/strict';
import test from 'node:test';
import { ZodError } from 'zod';
import { parseGenerateIdeasOutput } from '../src/lib/ideaOutput';

const validProject = {
  style: 'practical',
  title: '個人化學習路徑追蹤器',
  one_liner: '幫助使用者規劃與追蹤學習進度的互動式網站。',
  summary: '使用者可以建立學習目標、拆解任務，並透過視覺化方式查看進度與下一步建議。',
  why_it_fits: '符合使用者對網頁開發與 API 串接的興趣。',
  potential_concerns: '若加入太多推薦功能，時間可能會被壓縮。',
  difficulty: 'medium',
  tech_stack: ['React', 'Node.js'],
  mvp: ['建立目標', '拆解任務', '顯示進度'],
  reasoning_tags: ['web-app', 'interactive'],
};

test('parseGenerateIdeasOutput accepts valid PROJECT_SPEC output', () => {
  const output = {
    projects: [
      validProject,
      { ...validProject, style: 'creative', title: '互動式靈感地圖', difficulty: 'easy' },
      { ...validProject, style: 'complex', title: 'AI 專案範圍教練', difficulty: 'hard' },
    ],
  };

  const parsed = parseGenerateIdeasOutput(JSON.stringify(output));

  assert.equal(parsed.projects.length, 3);
  assert.equal(parsed.projects[0].difficulty, 'medium');
});

test('parseGenerateIdeasOutput rejects non-JSON LLM responses', () => {
  assert.throws(
    () => parseGenerateIdeasOutput('這不是 JSON'),
    SyntaxError
  );
});

test('parseGenerateIdeasOutput rejects schema-invalid LLM responses', () => {
  const output = {
    projects: [
      validProject,
      { ...validProject, title: '缺少第三個專案' },
    ],
  };

  assert.throws(
    () => parseGenerateIdeasOutput(JSON.stringify(output)),
    ZodError
  );
});
