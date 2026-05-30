import type { FormData } from '@/components/Questionnaire';
import type { ProjectType } from '@/components/ProjectCard';
import type { RefineIdeaOutput } from '@/lib/ideaRefinement';

const STORAGE_KEY = 'personal-brainstorm-coach:saved-ideas';

export interface SavedIdeaRecord {
  id: string;
  createdAt: string;
  formData: FormData;
  projects: ProjectType[];
  refinements?: Record<string, RefineIdeaOutput>;
}

function getBrowserStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage ?? null;
}

function isSavedIdeaRecord(value: unknown): value is SavedIdeaRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<SavedIdeaRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.formData === 'object' &&
    Array.isArray(record.projects)
  );
}

export function getSavedIdeaRecords(storage?: Storage): SavedIdeaRecord[] {
  const browserStorage = getBrowserStorage(storage);
  if (!browserStorage) {
    return [];
  }

  try {
    const rawRecords = browserStorage.getItem(STORAGE_KEY);
    if (!rawRecords) {
      return [];
    }

    const parsed: unknown = JSON.parse(rawRecords);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedIdeaRecord);
  } catch {
    return [];
  }
}

export function saveIdeaRecord(record: SavedIdeaRecord, storage?: Storage): boolean {
  const browserStorage = getBrowserStorage(storage);
  if (!browserStorage) {
    return false;
  }

  try {
    const currentRecords = getSavedIdeaRecords(browserStorage);
    const nextRecords = [
      record,
      ...currentRecords.filter((currentRecord) => currentRecord.id !== record.id),
    ];
    browserStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
    return true;
  } catch {
    return false;
  }
}

export function deleteIdeaRecord(id: string, storage?: Storage): boolean {
  const browserStorage = getBrowserStorage(storage);
  if (!browserStorage) {
    return false;
  }

  try {
    const nextRecords = getSavedIdeaRecords(browserStorage).filter((record) => record.id !== id);
    browserStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
    return true;
  } catch {
    return false;
  }
}

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

function formatNumberedList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

export function createMarkdownExport(
  project: ProjectType,
  refinement?: RefineIdeaOutput | null
): string {
  const sections = [
    `# ${project.title}`,
    project.one_liner,
    `## 專案摘要\n${project.summary}`,
    `## 為什麼適合\n${project.why_it_fits}`,
    `## 不普通的原因\n${project.why_this_is_not_generic}`,
    `## 可能挑戰\n${project.potential_concerns}`,
    `## 難度\n${project.difficulty}`,
    `## 推薦技術棧\n${formatList(project.tech_stack)}`,
    `## MVP 規劃\n${formatList(project.mvp)}`,
    `## 核心資料結構 / 演算法\n${project.core_algorithm_or_data_structure}`,
    `## 前三個實作步驟\n${formatNumberedList(project.first_3_steps)}`,
    `## 分週開發計畫\n${formatList(project.week_plan)}`,
    `## 時間不夠時先砍這些\n${formatList(project.scope_down_plan)}`,
    `## Demo 展示亮點\n${project.demo_highlight}`,
  ];

  if (refinement) {
    sections.push(
      `## 深入發想：${refinement.action_label}`,
      refinement.refined_summary,
      `### 建議調整\n${formatList(refinement.recommended_changes)}`,
      `### 下一步\n${formatList(refinement.next_steps)}`,
      `### 報告大綱\n${formatList(refinement.report_outline)}`,
      `### 取捨提醒\n${formatList(refinement.tradeoffs)}`
    );
  }

  return `${sections.join('\n\n')}\n`;
}

export function getSavedIdeaStorageKey() {
  return STORAGE_KEY;
}
