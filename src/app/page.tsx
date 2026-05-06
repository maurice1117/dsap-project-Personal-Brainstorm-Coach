'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Code, Target, Clock, Zap } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import Questionnaire, { FormData } from '@/components/Questionnaire';

// Mock Data for Phase 1
const mockProjects = [
  {
    style: "practical",
    title: "個人化學習路徑追蹤器",
    one_liner: "幫助使用者規劃與追蹤學習進度的互動式網站。",
    summary: "使用者可以建立學習目標、拆解任務，並透過視覺化方式查看進度與下一步建議。",
    why_it_fits: "符合你對網頁開發與 AI 工具的興趣，也能練到 React 與 API 串接。",
    potential_concerns: "若加入太多 AI 推薦或後端功能，4 週內可能會太趕。",
    difficulty: "medium",
    tech_stack: ["React", "Node.js", "Express"],
    mvp: ["建立學習目標與任務列表", "顯示進度追蹤介面", "提供簡單的推薦或提醒功能"],
    reasoning_tags: ["web-app", "interactive", "practical", "demoable"]
  },
  {
    style: "creative",
    title: "AI 專案靈感塔羅牌",
    one_liner: "用抽牌的趣味方式，隨機給予開發者各種瞎趴的 Side Project 靈感。",
    summary: "結合酷炫的 CSS 動畫翻牌效果，每一張牌代表一個技術棧或情境，結合起來生成專案。",
    why_it_fits: "想做一些有創意、好玩且可以在線上 demo 給朋友看的酷東西。",
    potential_concerns: "技術深度較淺，主要是前端動畫的挑戰。",
    difficulty: "easy",
    tech_stack: ["Next.js", "Framer Motion", "Tailwind CSS"],
    mvp: ["塔羅牌翻牌 UI", "3 張隨機技術卡片組合", "基本的分享功能"],
    reasoning_tags: ["creative", "visual", "fun"]
  }
];

export default function Home() {
  const [step, setStep] = useState<'landing' | 'form' | 'loading' | 'results'>('landing');

  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-24 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Step 1: Landing */}
        {step === 'landing' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="inline-flex items-center justify-center p-3 glass-panel rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-secondary mr-2" />
              <span className="text-sm font-medium text-slate-200 tracking-wider uppercase">Interactive Project Ideation Coach</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 pb-2">
              找不到專題靈感？
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              透過簡短的幾個問題，讓我為你量身打造兼具技術亮點與實作可行性的專案提案，幫你度過最痛苦的發想期。
            </p>

            <button 
              onClick={() => setStep('form')}
              className="glass-button mt-8 px-8 py-4 rounded-full text-lg font-bold text-white inline-flex items-center group"
            >
              開始發想
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Step 2: Questionnaire Form (Phase 2 State Management) */}
        {step === 'form' && (
          <Questionnaire 
            onCancel={() => setStep('landing')}
            onComplete={(data: FormData) => {
              // TODO: Phase 3 (Call Backend API with `data`)
              console.log("Ready to send to LLM:", data);
              setStep('loading');
            }} 
          />
        )}

        {/* Step 3: Loading State */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500 py-20">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-4 rounded-full border-b-2 border-accent animate-spin" style={{ animationDuration: '2s' }}></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-purple-300 animate-pulse" />
            </div>
            <p className="text-xl font-medium text-slate-300 animate-pulse">正在為你打造專屬的專案靈感...</p>
            {/* Auto advance to results for demo purposes */}
            <button onClick={() => setStep('results')} className="text-xs text-slate-600 hover:text-slate-400 mt-8">(點此跳過動畫)</button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'results' && (
          <div className="w-full animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                為你量身打造的點子
              </h2>
              <p className="text-slate-300">基於你的興趣與目標，我們推薦以下幾個方向：</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 w-full">
              {mockProjects.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setStep('form')}
                className="glass-button px-8 py-3 rounded-full font-bold text-white inline-flex items-center"
              >
                重新發想
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
