import { CheckCircle2, AlertTriangle, Layers, Zap, Terminal } from 'lucide-react';

interface ProjectType {
  style: string;
  title: string;
  one_liner: string;
  summary: string;
  why_it_fits: string;
  potential_concerns: string;
  difficulty: string;
  tech_stack: string[];
  mvp: string[];
  reasoning_tags: string[];
}

export default function ProjectCard({ project }: { project: ProjectType }) {
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
        <p className="text-slate-400 leading-relaxed">
          {project.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-6">
        {/* Why it fits */}
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center text-green-400 mb-3">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <h4 className="font-bold">為什麼適合你</h4>
          </div>
          <p className="text-sm text-slate-300">{project.why_it_fits}</p>
        </div>

        {/* Potential Concerns */}
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center text-yellow-400 mb-3">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <h4 className="font-bold">可能挑戰與限制</h4>
          </div>
          <p className="text-sm text-slate-300">{project.potential_concerns}</p>
        </div>
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
            {project.mvp.map((item, i) => (
              <li key={i} className="flex items-start text-sm text-slate-300">
                <span className="text-purple-400 font-bold mr-2">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}
