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
  why_this_is_not_generic: '題目結合課程資料與互動式進度建議，不只是一般任務清單。',
  potential_concerns: '若加入太多推薦功能，時間可能會被壓縮。',
  difficulty: 'medium',
  tech_stack: ['React', 'Node.js'],
  mvp: ['建立目標', '拆解任務', '顯示進度'],
  core_algorithm_or_data_structure: '使用圖結構表示學習單元依賴關係，並用拓撲排序推薦下一步。',
  first_3_steps: ['定義資料模型', '完成目標建立流程', '做出進度視覺化'],
  week_plan: ['第 1 週：完成資料模型與 UI 草圖', '第 2 週：完成核心互動', '第 3 週：加入推薦邏輯', '第 4 週：整理 demo 與報告'],
  scope_down_plan: ['先取消帳號系統', '推薦邏輯改為規則式', '只支援一種視覺化'],
  demo_highlight: '現場建立一個學習目標，展示系統如何依照依賴關係推薦下一個任務。',
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
