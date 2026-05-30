import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createMarkdownExport,
  deleteIdeaRecord,
  getSavedIdeaRecords,
  getSavedIdeaStorageKey,
  saveIdeaRecord,
  type SavedIdeaRecord,
} from '../src/lib/savedIdeas';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

const sampleProject = {
  style: 'practical',
  title: '學習任務推薦器',
  one_liner: '根據學生狀態推薦下一個練習任務。',
  summary: '用簡單資料結構記錄學習狀態，並推薦最適合的下一步。',
  why_it_fits: '符合課程專題與可展示需求。',
  why_this_is_not_generic: '推薦邏輯會展示排序與權重設計。',
  potential_concerns: '需要控制資料規模。',
  difficulty: 'medium',
  tech_stack: ['Next.js', 'TypeScript'],
  mvp: ['建立任務資料', '紀錄完成狀態', '產生推薦'],
  core_algorithm_or_data_structure: '使用 priority queue 與 weighted scoring。',
  first_3_steps: ['定義資料格式', '建立 UI', '實作推薦函式'],
  week_plan: ['第一週完成資料模型', '第二週完成互動流程', '第三週整理 Demo'],
  scope_down_plan: ['先移除登入', '先用固定資料'],
  demo_highlight: '即時展示推薦排序變化。',
  reasoning_tags: ['DSA', 'Demo'],
};

const sampleRecord: SavedIdeaRecord = {
  id: 'record-1',
  createdAt: '2026-05-31T00:00:00.000Z',
  formData: {
    project_context: 'course_final',
    interests: ['教育科技'],
    experience_level: 'intermediate',
    focus_skills: ['資料結構'],
    avoid_topics: ['登入'],
    target_users: 'classmates',
    data_sources: ['固定資料'],
    success_criteria: ['可現場 Demo'],
    preferred_output: 'web_app',
    course_requirements: ['展示資料結構'],
    time_scope: {
      duration_weeks: 3,
      hours_per_week: 8,
    },
    goal: '完成課程專題',
  },
  projects: [sampleProject],
};

const sampleRefinement = {
  action_label: '產生報告大綱',
  refined_summary: '聚焦在學習推薦流程與資料結構選擇。',
  recommended_changes: ['縮小任務類型', '補上排序說明'],
  next_steps: ['整理資料', '完成 Demo'],
  report_outline: ['動機', '資料結構', 'Demo 流程'],
  tradeoffs: ['功能較少但展示更清楚'],
};

test('getSavedIdeaRecords returns empty array for empty storage', () => {
  assert.deepEqual(getSavedIdeaRecords(new MemoryStorage()), []);
});

test('saveIdeaRecord stores records and deleteIdeaRecord removes one record', () => {
  const storage = new MemoryStorage();

  assert.equal(saveIdeaRecord(sampleRecord, storage), true);
  assert.equal(getSavedIdeaRecords(storage).length, 1);
  assert.equal(getSavedIdeaRecords(storage)[0].id, 'record-1');

  assert.equal(deleteIdeaRecord('record-1', storage), true);
  assert.deepEqual(getSavedIdeaRecords(storage), []);
});

test('getSavedIdeaRecords ignores invalid stored data safely', () => {
  const storage = new MemoryStorage();

  storage.setItem(getSavedIdeaStorageKey(), 'not-json');
  assert.deepEqual(getSavedIdeaRecords(storage), []);

  storage.setItem(getSavedIdeaStorageKey(), JSON.stringify({ records: [sampleRecord] }));
  assert.deepEqual(getSavedIdeaRecords(storage), []);
});

test('createMarkdownExport includes core project sections', () => {
  const markdown = createMarkdownExport(sampleProject);

  assert.match(markdown, /# 學習任務推薦器/);
  assert.match(markdown, /## 推薦技術棧/);
  assert.match(markdown, /Next\.js/);
  assert.match(markdown, /## MVP 規劃/);
  assert.match(markdown, /## 前三個實作步驟/);
  assert.match(markdown, /## 分週開發計畫/);
  assert.match(markdown, /## Demo 展示亮點/);
});

test('createMarkdownExport includes refinement sections when provided', () => {
  const markdown = createMarkdownExport(sampleProject, sampleRefinement);

  assert.match(markdown, /## 深入發想：產生報告大綱/);
  assert.match(markdown, /### 報告大綱/);
  assert.match(markdown, /### 下一步/);
});
