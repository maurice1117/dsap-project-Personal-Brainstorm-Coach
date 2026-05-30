'use client';

import { CSSProperties, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Layers, Presentation, Route, Scissors, Sparkles, Terminal } from 'lucide-react';
import { getVisibleMvpItems, shouldShowMvpToggle } from '@/lib/projectDisplay';

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

export default function ProjectCard({ project }: { project: ProjectType }) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [fitExpanded, setFitExpanded] = useState(false);
  const [genericExpanded, setGenericExpanded] = useState(false);
  const [concernsExpanded, setConcernsExpanded] = useState(false);
  const [mvpExpanded, setMvpExpanded] = useState(false);

  const visibleMvpItems = getVisibleMvpItems(project.mvp, mvpExpanded);

  // Map difficulty to color
  const diffColor = 
    project.difficulty === 'easy' ? 'text-green-400 bg-green-400/10 border-green-400/20' : 
    project.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 
    'text-red-400 bg-red-400/10 border-red-400/20';

  const diffLabel = 
    project.difficulty === 'easy' ? '輕鬆挑戰' : 
    project.difficulty === 'medium' ? '中等難度' : '具挑戰性';

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

    </div>
  );
}
