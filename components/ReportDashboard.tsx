import React, { useState } from 'react';
import { AnalysisResult, Issue } from '../types';
import IssueList from './IssueList';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, Github, ArrowLeft, Copy, X } from 'lucide-react';
import { generateFixPullRequest } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ReportDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ result, onReset }) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(result.issues[0] || null);
  const [isPRGenerating, setIsPRGenerating] = useState(false);
  const [prContent, setPrContent] = useState<{ title: string; body: string } | null>(null);

  // Stats calculation
  const criticalCount = result.issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = result.issues.filter(i => i.severity === 'HIGH').length;
  const mediumCount = result.issues.filter(i => i.severity === 'MEDIUM').length;
  
  const score = Math.max(0, 100 - (criticalCount * 15 + highCount * 10 + mediumCount * 5));
  
  const severityData = [
    { name: 'Critical', value: criticalCount, color: '#ef4444' },
    { name: 'High', value: highCount, color: '#f97316' },
    { name: 'Medium', value: mediumCount, color: '#eab308' },
    { name: 'Low', value: result.issues.filter(i => i.severity === 'LOW').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const handleCreatePR = async () => {
    setIsPRGenerating(true);
    try {
      const content = await generateFixPullRequest(result.issues, result.url);
      setPrContent(content);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PR content.");
    } finally {
      setIsPRGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onReset}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Accessibility Audit Report</h1>
            <p className="text-slate-400 text-sm">Target: <span className="text-brand-400 font-mono">{result.url}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button
            onClick={handleCreatePR}
            disabled={isPRGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold shadow-lg transition-all"
            >
            {isPRGenerating ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"/> Generatin PR...</span>
            ) : (
                <><Github className="w-5 h-5" /> Generate PR Content</>
            )}
            </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Overall Score</p>
            <div className={`text-4xl font-bold ${score > 80 ? 'text-brand-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score}
              <span className="text-lg text-slate-500 ml-1">/100</span>
            </div>
          </div>
          <div className="h-16 w-16 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: score }, { value: 100 - score }]}
                    innerRadius={20}
                    outerRadius={30}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill={score > 80 ? '#22c55e' : score > 50 ? '#eab308' : '#ef4444'} />
                    <Cell fill="#1e293b" />
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300">
               {score}%
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl md:col-span-2">
           <p className="text-slate-400 text-sm font-medium mb-2">Issues by Severity</p>
           <div className="h-16 flex items-end gap-2">
             {severityData.map((d) => (
               <div key={d.name} className="flex-1 flex flex-col items-center gap-1 group">
                 <div className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity mb-1">{d.value}</div>
                 <div 
                    className="w-full rounded-t-md transition-all duration-500 hover:brightness-110" 
                    style={{ height: `${(d.value / result.issues.length) * 100}%`, minHeight: '4px', backgroundColor: d.color }} 
                 />
                 <div className="text-[10px] text-slate-500 font-medium uppercase">{d.name}</div>
               </div>
             ))}
           </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-center">
             <p className="text-slate-400 text-sm font-medium mb-2">Fixability</p>
             <div className="flex items-center gap-2 mb-1">
               <CheckCircle className="w-5 h-5 text-brand-500" />
               <span className="text-2xl font-bold text-white">100%</span>
             </div>
             <p className="text-xs text-slate-500">Gemini can generate fixes for all identified issues automatically.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <IssueList 
        issues={result.issues} 
        onSelectIssue={setSelectedIssue} 
        selectedIssue={selectedIssue} 
      />

      {/* PR Content Modal */}
      {prContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   <Github className="w-5 h-5" /> Generated Pull Request
                 </h3>
                 <button onClick={() => setPrContent(null)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PR Title</label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        readOnly 
                        value={prContent.title} 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                      />
                      <button 
                        onClick={() => navigator.clipboard.writeText(prContent.title)}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700"
                        title="Copy Title"
                      >
                         <Copy className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PR Description</label>
                    <div className="relative mt-1">
                      <textarea 
                        readOnly 
                        value={prContent.body} 
                        className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-300 font-mono text-sm resize-none focus:outline-none"
                      />
                      <button 
                        onClick={() => navigator.clipboard.writeText(prContent.body)}
                        className="absolute top-2 right-2 p-2 bg-slate-800/80 text-slate-400 hover:text-white rounded-lg border border-slate-700"
                        title="Copy Description"
                      >
                         <Copy className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
                 <div className="bg-brand-900/20 border border-brand-500/20 rounded-lg p-4">
                    <p className="text-xs text-brand-300">
                      <strong>Deployment Tip:</strong> To automate this, you would integrate a GitHub App or OAuth flow. 
                      For this demo, simply copy the content above to your repository.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ReportDashboard;
