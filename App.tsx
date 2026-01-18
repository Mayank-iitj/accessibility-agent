import React, { useState } from 'react';
import { AnalysisResult, AuditConfig, AnalysisStatus } from './types';
import InputSection from './components/InputSection';
import ReportDashboard from './components/ReportDashboard';
import ChatBot from './components/ChatBot';
import { analyzeAccessibility } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>('IDLE');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const startAudit = async (config: AuditConfig) => {
    setStatus('ANALYZING');
    try {
      // 1. Multimodal Analysis (Gemini)
      const issues = await analyzeAccessibility(config);
      
      setResult({
        url: config.url,
        timestamp: new Date().toISOString(),
        score: 0, // Calculated in dashboard
        issues: issues.map(i => ({...i, id: Math.random().toString(36).substr(2, 9)})) // Ensure IDs
      });
      setStatus('COMPLETE');
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please check your API key in the environment variables.');
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setStatus('IDLE');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-brand-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl">
              A
            </div>
            <span className="font-bold text-lg tracking-tight">A11y-Agent</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">Powered by Gemini 3</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {status === 'IDLE' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12 max-w-2xl">
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 tracking-tight">
                Make the Web Inclusive.
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                An agentic workflow that simulates disability personas to identify, explain, and automatically fix accessibility issues using multimodal AI.
              </p>
            </div>
            <InputSection onStartAudit={startAudit} isLoading={false} />
          </div>
        )}

        {status === 'ANALYZING' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-2xl">👁️</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Interfaces...</h2>
            <div className="space-y-2 text-center">
              <p className="text-slate-400 animate-pulse">Simulating Screen Reader Navigation...</p>
              <p className="text-slate-500 text-sm">Checking Contrast Ratios & Touch Targets...</p>
              <p className="text-slate-500 text-sm">Identifying Keyboard Traps...</p>
            </div>
          </div>
        )}

        {status === 'COMPLETE' && result && (
          <ReportDashboard result={result} onReset={handleReset} />
        )}
      </main>
      
      {/* Floating Chat Bot - Now context aware */}
      <ChatBot analysisResult={result} />
    </div>
  );
};

export default App;
