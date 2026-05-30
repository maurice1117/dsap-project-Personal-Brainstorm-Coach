'use client';

import { useState } from 'react';
import { AlertTriangle, Target, Code, Clock, BookOpen, Layers, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

export interface FormData {
  project_context: string;
  interests: string[];
  experience_level: string;
  focus_skills: string[];
  avoid_topics: string[];
  target_users: string;
  data_sources: string[];
  success_criteria: string[];
  preferred_output: string;
  course_requirements: string[];
  time_scope: {
    duration_weeks: number;
    hours_per_week: number;
  };
  goal: string;
}

interface Props {
  onComplete: (data: FormData) => void;
  onCancel: () => void;
}

export default function Questionnaire({ onComplete, onCancel }: Props) {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    project_context: 'course_final',
    interests: [],
    experience_level: 'intermediate',
    focus_skills: [],
    avoid_topics: [],
    target_users: 'classmates',
    data_sources: ['手動輸入'],
    success_criteria: ['可現場 Demo'],
    preferred_output: 'web_app',
    course_requirements: [],
    time_scope: {
      duration_weeks: 4,
      hours_per_week: 10
    },
    goal: ''
  });

  const updateData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: 'interests' | 'focus_skills' | 'avoid_topics' | 'data_sources' | 'success_criteria' | 'course_requirements',
    item: string
  ) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const isStep1Valid = formData.goal.trim() !== '';
  const isStep2Valid = formData.interests.length > 0 && formData.focus_skills.length > 0;
  const isStep3Valid = formData.data_sources.length > 0 && formData.success_criteria.length > 0;
  const isStep4Valid = formData.time_scope.duration_weeks > 0 && formData.time_scope.hours_per_week > 0;

  const handleNext = () => {
    if (formStep === 1 && isStep1Valid) setFormStep(2);
    else if (formStep === 2 && isStep2Valid) setFormStep(3);
    else if (formStep === 3 && isStep3Valid) setFormStep(4);
  };

  const handleSubmit = () => {
    if (isStep4Valid) {
      console.log('Final Form Data:', formData);
      onComplete(formData);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-8 md:p-12 animate-in slide-in-from-bottom-8 fade-in duration-500">
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full -z-10"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-secondary rounded-full -z-10 transition-all duration-500"
          style={{ width: `${((formStep - 1) / 3) * 100}%` }}
        ></div>
        
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${s <= formStep ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="min-h-[350px]">
        {/* Step 1: Context & Goal */}
        {formStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              專案背景與目標
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                這是什麼性質的專案？
              </label>
              <select 
                value={formData.project_context}
                onChange={(e) => updateData('project_context', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="course_final">課程期末專題</option>
                <option value="portfolio">求職作品集 (Portfolio)</option>
                <option value="hackathon">黑客松競賽</option>
                <option value="hobby">個人興趣練習</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Target className="w-5 h-5 mr-2 text-purple-400" />
                你的具體目標是什麼？(必填)
              </label>
              <textarea 
                value={formData.goal}
                onChange={(e) => updateData('goal', e.target.value)}
                placeholder="例如：希望能做一個有互動感、可以放在履歷上 Demo 的網站，不要太難但要有技術亮點..." 
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
              />
            </div>
          </div>
        )}

        {/* Step 2: Interests & Skills */}
        {formStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              興趣與技能方向
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Layers className="w-5 h-5 mr-2 text-blue-400" />
                目前的程式經驗程度？
              </label>
              <select 
                value={formData.experience_level}
                onChange={(e) => updateData('experience_level', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="beginner">初學者 (剛學會基礎語法)</option>
                <option value="intermediate">中階 (做過一些小專案)</option>
                <option value="advanced">進階 (能獨立完成全端架構)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Code className="w-5 h-5 mr-2 text-pink-400" />
                想做的領域 / 興趣？ (可複選)
              </label>
              <div className="flex flex-wrap gap-3">
                {['網頁開發', 'AI 應用', '資料分析', '遊戲開發', '工具程式', '自動化腳本'].map((tag) => {
                  const isSelected = formData.interests.includes(tag);
                  return (
                    <button 
                      key={tag} 
                      onClick={() => toggleArrayItem('interests', tag)}
                      className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-primary/30 border-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                想練習的技能？ (可複選)
              </label>
              <div className="flex flex-wrap gap-3">
                {['前端 UI/UX', 'API 串接', '資料庫設計', '演算法與資料結構', 'LLM Prompting'].map((tag) => {
                  const isSelected = formData.focus_skills.includes(tag);
                  return (
                    <button 
                      key={tag} 
                      onClick={() => toggleArrayItem('focus_skills', tag)}
                      className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-secondary/30 border-secondary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Constraints */}
        {formStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              收斂條件
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center text-lg font-medium text-slate-200">
                  <Target className="w-5 h-5 mr-2 text-purple-400" />
                  主要想服務誰？
                </label>
                <select
                  value={formData.target_users}
                  onChange={(e) => updateData('target_users', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="self">自己使用</option>
                  <option value="classmates">同學或課程成員</option>
                  <option value="teacher">老師或助教</option>
                  <option value="club">社團或小型團隊</option>
                  <option value="public_users">一般使用者</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center text-lg font-medium text-slate-200">
                  <Layers className="w-5 h-5 mr-2 text-blue-400" />
                  偏好的成果形式？
                </label>
                <select
                  value={formData.preferred_output}
                  onChange={(e) => updateData('preferred_output', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="web_app">網站應用</option>
                  <option value="interactive_visualization">互動視覺化</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="utility_tool">小工具</option>
                  <option value="game_like_experience">遊戲化體驗</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                不想做的類型或技術？ (可複選)
              </label>
              <div className="flex flex-wrap gap-3">
                {['純 CRUD', '登入會員系統', '重度機器學習', '複雜部署', '付費 API', '大量爬蟲'].map((tag) => {
                  const isSelected = formData.avoid_topics.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleArrayItem('avoid_topics', tag)}
                      className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-yellow-500/20 border-yellow-400 text-white shadow-[0_0_10px_rgba(250,204,21,0.25)]' : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                可用資料來源？ (可複選)
              </label>
              <div className="flex flex-wrap gap-3">
                {['手動輸入', '公開 API', 'CSV / JSON 檔', '課程資料', '使用者自行建立資料'].map((tag) => {
                  const isSelected = formData.data_sources.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleArrayItem('data_sources', tag)}
                      className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-primary/30 border-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Zap className="w-5 h-5 mr-2 text-pink-400" />
                這次最重要的成功標準？ (可複選)
              </label>
              <div className="flex flex-wrap gap-3">
                {['拿高分', '可放作品集', '可現場 Demo', '練特定技術', '題目有創意'].map((tag) => {
                  const isSelected = formData.success_criteria.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleArrayItem('success_criteria', tag)}
                      className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-secondary/30 border-secondary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Code className="w-5 h-5 mr-2 text-green-400" />
                課程要求或必須展示的概念？ (可複選)
              </label>
              <div className="flex flex-wrap gap-3">
                {['資料結構', '演算法', '資料庫', 'API 串接', '前端互動', '系統設計'].map((tag) => {
                  const isSelected = formData.course_requirements.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleArrayItem('course_requirements', tag)}
                      className={`px-4 py-2 rounded-full border transition-colors ${isSelected ? 'bg-green-500/20 border-green-400 text-white shadow-[0_0_10px_rgba(74,222,128,0.25)]' : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Time Scope */}
        {formStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              時間與限制
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center text-lg font-medium text-slate-200">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                這個專案預計花多久時間？
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-400 mb-1 block">總週數</span>
                  <input 
                    type="number" min="1" max="24"
                    value={formData.time_scope.duration_weeks}
                    onChange={(e) => updateData('time_scope', { ...formData.time_scope, duration_weeks: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <span className="text-sm text-slate-400 mb-1 block">每週投入時數</span>
                  <input 
                    type="number" min="1" max="40"
                    value={formData.time_scope.hours_per_week}
                    onChange={(e) => updateData('time_scope', { ...formData.time_scope, hours_per_week: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-2">系統會根據這些時間推算合理範圍內的 MVP 功能。</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-12 flex justify-between items-center pt-6 border-t border-slate-800">
        <button 
          onClick={() => formStep === 1 ? onCancel() : setFormStep(formStep - 1)}
          className="px-6 py-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors inline-flex items-center"
        >
          {formStep === 1 ? '返回首頁' : <><ArrowLeft className="w-4 h-4 mr-2" /> 上一步</>}
        </button>
        
        {formStep < 4 ? (
          <button 
            onClick={handleNext}
            disabled={formStep === 1 ? !isStep1Valid : formStep === 2 ? !isStep2Valid : !isStep3Valid}
            className="glass-button px-8 py-3 rounded-full font-bold text-white inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={!isStep4Valid}
            className="glass-button px-8 py-3 rounded-full font-bold text-white inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            產生點子
            <Zap className="ml-2 w-5 h-5 text-yellow-300" />
          </button>
        )}
      </div>
    </div>
  );
}
