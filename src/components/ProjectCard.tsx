'use client';

import { CSSProperties, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Copy, Download, Layers, Loader2, Presentation, Route, Scissors, Sparkles, Terminal, Wand2 } from 'lucide-react';
import type { FormData } from '@/components/Questionnaire';
import {
  GENERATE_IDEAS_TIMEOUT_MS,
  getApiStatusMessage,
  getNetworkErrorMessage,
} from '@/lib/clientApiErrors';
import type { ApiErrorPayload } from '@/lib/clientApiErrors';
import type { RefineAction, RefineIdeaOutput } from '@/lib/ideaRefinement';
import { getVisibleMvpItems, shouldShowMvpToggle } from '@/lib/projectDisplay';
import { createMarkdownExport } from '@/lib/savedIdeas';

export interface ProjectType {
  style: string;
  title: string;
  one_liner: string;
  summary: string;
  why_it_fits: string;
  why_this_is_not_generic: string;
  potential_concerns: string;
  difficulty: string;
  tech_stack: string[];
  mvp: string[];
  core_algorithm_or_data_structure: string;
  first_3_steps: string[];
  week_plan: string[];
  scope_down_plan: string[];
  demo_highlight: string;
  reasoning_tags: string[];
}

const collapsedTextStyle: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const REFINE_ACTIONS: Array<{ action: RefineAction; label: string }> = [
  { action: 'deep_dive', label: '深入這個點子' },
  { action: 'make_easier', label: '降低難度' },
  { action: 'make_creative', label: '讓它更有創意' },
  { action: 'strengthen_ds_algo', label: '加強資料結構 / 演算法' },
  { action: 'development_plan', label: '產生開發計畫' },
  { action: 'report_outline', label: '產生報告大綱' },
];

async function readApiErrorPayload(response: Response): Promise<ApiErrorPayload | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isBrowserOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

function ToggleButton({
  expanded,
  onClick,
  openLabel = '展開',
  closeLabel = '收合',
}: {
  expanded: boolean;
  onClick: () => void;
  openLabel?: string;
  closeLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:text-blue-300 transition-colors"
    >
      {expanded ? closeLabel : openLabel}
      <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
  );
}

function RefinementPanel({ refinement }: { refinement: RefineIdeaOutput }) {
  return (
    <div className="mt-5 rounded-2xl border border-blue-300/20 bg-blue-400/10 p-5 animate-in fade-in">
      <div className="flex items-center text-blue-100 mb-3">
        <Wand2 className="w-5 h-5 mr-2 text-blue-300" />
        <h4 className="font-bold">{refinement.action_label}</h4>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">
        {refinement.refined_summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h5 className="mb-2 text-sm font-bold text-slate-100">建議調整</h5>
          <ul className="space-y-2">
            {refinement.recommended_changes.map((item, i) => (
              <li key={`${i}-${item}`} className="text-sm text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="mb-2 text-sm font-bold text-slate-100">下一步</h5>
          <ul className="space-y-2">
            {refinement.next_steps.map((item, i) => (
              <li key={`${i}-${item}`} className="text-sm text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="mb-2 text-sm font-bold text-slate-100">報告大綱</h5>
          <ul className="space-y-2">
            {refinement.report_outline.map((item, i) => (
              <li key={`${i}-${item}`} className="text-sm text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="mb-2 text-sm font-bold text-slate-100">取捨提醒</h5>
          <ul className="space-y-2">
            {refinement.tradeoffs.map((item, i) => (
              <li key={`${i}-${item}`} className="text-sm text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  formData,
  initialRefinement = null,
  onRefinementChange,
}: {
  project: ProjectType;
  formData: FormData | null;
  initialRefinement?: RefineIdeaOutput | null;
  onRefinementChange?: (refinement: RefineIdeaOutput) => void;
}) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [fitExpanded, setFitExpanded] = useState(false);
  const [genericExpanded, setGenericExpanded] = useState(false);
  const [concernsExpanded, setConcernsExpanded] = useState(false);
  const [mvpExpanded, setMvpExpanded] = useState(false);
  const [refinement, setRefinement] = useState<RefineIdeaOutput | null>(initialRefinement);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<RefineAction | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const visibleMvpItems = getVisibleMvpItems(project.mvp, mvpExpanded);

  // Map difficulty to color
  const diffColor = 
    project.difficulty === 'easy' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 
    project.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 
    'text-red-400 bg-red-400/10 border-red-400/20';

  const diffLabel = 
    project.difficulty === 'easy' ? '輕鬆挑戰' : 
    project.difficulty === 'medium' ? '中等難度' : '具挑戰性';

  const refineProject = async (action: RefineAction) => {
    if (!formData) {
      setRefineError('找不到原始問卷資料，請重新生成後再深入發想。');
      return;
    }

    setActiveAction(action);
    setRefineError(null);

    if (!isBrowserOnline()) {
      setRefineError(getNetworkErrorMessage(new Error('offline'), false));
      setActiveAction(null);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, GENERATE_IDEAS_TIMEOUT_MS);

    try {
      const response = await fetch('/api/refine-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_input: formData,
          project,
          action,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const payload = await readApiErrorPayload(response);
        throw new ApiResponseError(getApiStatusMessage(response.status, payload));
      }

      const result = await response.json();
      const nextRefinement = result.data ?? null;
      setRefinement(nextRefinement);
      if (nextRefinement) {
        onRefinementChange?.(nextRefinement);
      }
    } catch (err: unknown) {
      if (!isAbortError(err)) {
        console.error(err);
      }
      setRefineError(
        err instanceof ApiResponseError
          ? err.message
          : getNetworkErrorMessage(err, isBrowserOnline())
      );
    } finally {
      window.clearTimeout(timeoutId);
      setActiveAction(null);
    }
  };

  const getMarkdown = () => createMarkdownExport(project, refinement);

  const copyMarkdown = async () => {
    setExportStatus(null);

    if (!navigator.clipboard?.writeText) {
      setExportStatus('此瀏覽器不支援剪貼簿功能，請改用下載 Markdown。');
      return;
    }

    try {
      await navigator.clipboard.writeText(getMarkdown());
      setExportStatus('已複製 Markdown。');
    } catch {
      setExportStatus('複製失敗，請稍後再試或改用下載。');
    }
  };

  const downloadMarkdown = () => {
    setExportStatus(null);

    try {
      const safeTitle = project.title
        .replace(/[\\/:*?"<>|]/g, '')
        .trim()
        .slice(0, 40) || 'project-idea';
      const blob = new Blob([getMarkdown()], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${safeTitle}.md`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportStatus('已下載 Markdown。');
    } catch {
      setExportStatus('下載失敗，請稍後再試。');
    }
  };

  return (
    <div className="glass-panel w-full rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group hover:border-primary/40 transition-colors">
      
      {/* Top Banner / Tags */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {project.reasoning_tags.map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className={`px-3 py-1 text-xs font-bold rounded-full border ${diffColor}`}>
          {diffLabel}
        </div>
      </div>

      {/* Main Content */}
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
          {project.title}
        </h3>
        <p className="text-lg text-slate-300 font-medium border-l-4 border-secondary pl-4 py-1 mb-4">
          {project.one_liner}
        </p>
        <p
          className="text-slate-400 leading-relaxed"
          style={summaryExpanded ? undefined : collapsedTextStyle}
        >
          {project.summary}
        </p>
        <ToggleButton
          expanded={summaryExpanded}
          onClick={() => setSummaryExpanded((current) => !current)}
          openLabel="展開完整介紹"
          closeLabel="收合介紹"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-6">
        {/* Why it fits */}
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center text-green-400 mb-3">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <h4 className="font-bold">為什麼適合你</h4>
          </div>
          <p
            className="text-sm text-slate-300 leading-relaxed"
            style={fitExpanded ? undefined : collapsedTextStyle}
          >
            {project.why_it_fits}
          </p>
          <ToggleButton
            expanded={fitExpanded}
            onClick={() => setFitExpanded((current) => !current)}
            openLabel="展開原因"
            closeLabel="收合原因"
          />
        </div>

        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center text-purple-300 mb-3">
            <Sparkles className="w-5 h-5 mr-2" />
            <h4 className="font-bold">不是普通題目的原因</h4>
          </div>
          <p
            className="text-sm text-slate-300 leading-relaxed"
            style={genericExpanded ? undefined : collapsedTextStyle}
          >
            {project.why_this_is_not_generic}
          </p>
          <ToggleButton
            expanded={genericExpanded}
            onClick={() => setGenericExpanded((current) => !current)}
            openLabel="展開差異化"
            closeLabel="收合差異化"
          />
        </div>

        {/* Potential Concerns */}
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center text-yellow-400 mb-3">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <h4 className="font-bold">可能挑戰與限制</h4>
          </div>
          <p
            className="text-sm text-slate-300 leading-relaxed"
            style={concernsExpanded ? undefined : collapsedTextStyle}
          >
            {project.potential_concerns}
          </p>
          <ToggleButton
            expanded={concernsExpanded}
            onClick={() => setConcernsExpanded((current) => !current)}
            openLabel="展開挑戰"
            closeLabel="收合挑戰"
          />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-5">
        <div className="flex items-center text-indigo-200 mb-3">
          <Route className="w-5 h-5 mr-2 text-indigo-300" />
          <h4 className="font-bold">核心資料結構 / 演算法</h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {project.core_algorithm_or_data_structure}
        </p>
      </div>

      {/* Tech Stack & MVP */}
      <div className="pt-6 border-t border-slate-700/50 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1">
          <div className="flex items-center text-slate-200 mb-3">
            <Terminal className="w-5 h-5 mr-2 text-blue-400" />
            <h4 className="font-bold">推薦技術棧</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map(tech => (
              <span key={tech} className="px-3 py-1.5 text-sm bg-slate-800 text-slate-200 rounded-lg border border-slate-700">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center text-slate-200 mb-3">
            <Layers className="w-5 h-5 mr-2 text-purple-400" />
            <h4 className="font-bold">MVP 最小可行版本規劃</h4>
          </div>
          <ul className="space-y-2">
            {visibleMvpItems.map((item, i) => (
              <li key={i} className="flex items-start text-sm text-slate-300">
                <span className="text-purple-400 font-bold mr-2">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
          {shouldShowMvpToggle(project.mvp) && (
            <ToggleButton
              expanded={mvpExpanded}
              onClick={() => setMvpExpanded((current) => !current)}
              openLabel={`展開全部 ${project.mvp.length} 項 MVP`}
              closeLabel="收合 MVP"
            />
          )}
        </div>

      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center text-slate-200 mb-3">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
            <h4 className="font-bold">前三個實作步驟</h4>
          </div>
          <ol className="space-y-2">
            {project.first_3_steps.map((step, i) => (
              <li key={`${i}-${step}`} className="flex items-start text-sm text-slate-300">
                <span className="text-green-400 font-bold mr-2">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="flex items-center text-slate-200 mb-3">
            <Layers className="w-5 h-5 mr-2 text-blue-400" />
            <h4 className="font-bold">分週開發計畫</h4>
          </div>
          <ul className="space-y-2">
            {project.week_plan.map((item, i) => (
              <li key={`${i}-${item}`} className="text-sm text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center text-slate-200 mb-3">
            <Scissors className="w-5 h-5 mr-2 text-yellow-400" />
            <h4 className="font-bold">時間不夠時先砍這些</h4>
          </div>
          <ul className="space-y-2">
            {project.scope_down_plan.map((item, i) => (
              <li key={`${i}-${item}`} className="text-sm text-slate-300 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-pink-400/20 bg-pink-400/10 p-5">
          <div className="flex items-center text-pink-200 mb-3">
            <Presentation className="w-5 h-5 mr-2 text-pink-300" />
            <h4 className="font-bold">Demo 展示亮點</h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {project.demo_highlight}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center text-slate-200">
            <Download className="mr-2 h-5 w-5 text-green-300" />
            <h4 className="font-bold">保存這個點子</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyMarkdown}
              className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Copy className="mr-2 h-4 w-4" />
              複製 Markdown
            </button>
            <button
              type="button"
              onClick={downloadMarkdown}
              className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Download className="mr-2 h-4 w-4" />
              下載 .md
            </button>
          </div>
          {exportStatus && (
            <p className="mt-3 text-sm text-slate-300" role="status">
              {exportStatus}
            </p>
          )}
        </div>

        <div className="flex items-center text-slate-200 mb-4">
          <Wand2 className="w-5 h-5 mr-2 text-blue-300" />
          <h4 className="font-bold">針對這個點子深入發想</h4>
        </div>
        <div className="flex flex-wrap gap-3">
          {REFINE_ACTIONS.map(({ action, label }) => {
            const isLoading = activeAction === action;
            return (
              <button
                key={action}
                type="button"
                onClick={() => refineProject(action)}
                disabled={activeAction !== null}
                className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {label}
              </button>
            );
          })}
        </div>

        {refineError && (
          <div role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-500/15 p-4 text-sm text-red-100">
            {refineError}
          </div>
        )}

        {refinement && <RefinementPanel refinement={refinement} />}
      </div>

    </div>
  );
}
