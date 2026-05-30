'use client';

import { useState } from 'react';
import { AlertTriangle, Sparkles, ArrowRight, RefreshCw, SlidersHorizontal } from 'lucide-react';
import ProjectCard, { ProjectType } from '@/components/ProjectCard';
import Questionnaire, { FormData } from '@/components/Questionnaire';
import {
  ApiErrorPayload,
  GENERATE_IDEAS_TIMEOUT_MS,
  getApiStatusMessage,
  getNetworkErrorMessage,
} from '@/lib/clientApiErrors';

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

function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="mb-6 flex flex-col gap-4 rounded-xl border border-red-400/50 bg-red-500/15 p-4 text-red-100 animate-in fade-in sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-full border border-red-300/50 px-4 py-2 text-sm font-semibold text-red-50 transition-colors hover:bg-red-400/20 sm:self-auto"
        >
          重試
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<'landing' | 'form' | 'loading' | 'results'>('landing');
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateIdeas = async (data: FormData) => {
    setLastFormData(data);
    setStep('loading');
    setError(null);

    if (!isBrowserOnline()) {
      setError(getNetworkErrorMessage(new Error('offline'), false));
      setStep('form');
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, GENERATE_IDEAS_TIMEOUT_MS);

    try {
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const payload = await readApiErrorPayload(response);
        throw new ApiResponseError(getApiStatusMessage(response.status, payload));
      }

      const result = await response.json();
      setProjects(Array.isArray(result.data?.projects) ? result.data.projects : []);
      setStep('results');
    } catch (err: unknown) {
      if (!isAbortError(err)) {
        console.error(err);
      }
      setError(
        err instanceof ApiResponseError
          ? err.message
          : getNetworkErrorMessage(err, isBrowserOnline())
      );
      setStep('form'); // 若發生錯誤，退回表單讓使用者重試
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

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
          <div className="w-full">
            {error && (
              <ErrorAlert
                message={error}
                onRetry={lastFormData ? () => generateIdeas(lastFormData) : undefined}
              />
            )}
            <Questionnaire 
              onCancel={() => setStep('landing')}
              onComplete={generateIdeas} 
            />
          </div>
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
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <ProjectCard key={index} project={project} formData={lastFormData} />
                ))
              ) : (
                <div className="text-center text-slate-400">無法生成專案，請重試。</div>
              )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => lastFormData && generateIdeas(lastFormData)}
                disabled={!lastFormData}
                className="glass-button px-8 py-3 rounded-full font-bold text-white inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="mr-2 w-5 h-5" />
                重新生成
              </button>
              <button 
                onClick={() => setStep('form')}
                className="px-8 py-3 rounded-full font-bold text-slate-200 border border-slate-600 bg-slate-800/60 hover:bg-slate-700 inline-flex items-center transition-colors"
              >
                <SlidersHorizontal className="mr-2 w-5 h-5" />
                修改條件
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
