import React from 'react';
import { Issue, Persona } from '../types';
import { AlertTriangle, Eye, Activity, Palette, CheckCircle, ChevronRight, Copy, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface IssueListProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  selectedIssue: Issue | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/50';
    case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/50';
    case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
    default: return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
  }
};

const getPersonaIcon = (persona: Persona) => {
  switch (persona) {
    case Persona.VISUAL: return <Eye className="w-4 h-4" />;
    case Persona.MOTOR: return <Activity className="w-4 h-4" />;
    case Persona.COLOR: return <Palette className="w-4 h-4" />;
  }
};

const IssueList: React.FC<IssueListProps> = ({ issues, onSelectIssue, selectedIssue }) => {
  if (issues.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-900 rounded-xl border border-slate-800">
        <CheckCircle className="w-16 h-16 text-brand-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white">No Issues Found!</h3>
        <p className="text-slate-400">Great job on accessibility.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* List Column */}
      <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-semibold text-white">Detected Issues ({issues.length})</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedIssue?.id === issue.id 
                  ? 'bg-slate-800 border-brand-500 shadow-md' 
                  : 'bg-transparent border-transparent hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
                <span className="text-slate-400" title={issue.persona}>{getPersonaIcon(issue.persona)}</span>
              </div>
              <h4 className="text-sm font-medium text-slate-200 line-clamp-2">{issue.title}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Column */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        {selectedIssue ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getSeverityColor(selectedIssue.severity)}`}>
                  {selectedIssue.severity}
                </span>
                <div className="flex items-center gap-1 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  {getPersonaIcon(selectedIssue.persona)}
                  <span>{selectedIssue.persona} Impact</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedIssue.title}</h2>
              <p className="text-slate-400 text-sm">{selectedIssue.description}</p>
            </div>

            {/* Content Tabs/Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Problem Code */}
              {selectedIssue.codeSnippet && (
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Problematic Code
                  </h3>
                  <div className="bg-slate-950 p-4 rounded-lg border border-red-900/30 overflow-x-auto">
                    <code className="text-xs font-mono text-red-200 whitespace-pre-wrap">
                      {selectedIssue.codeSnippet}
                    </code>
                  </div>
                </div>
              )}

              {/* Solution Code */}
              {selectedIssue.suggestedFix && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-brand-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Suggested Fix (Gemini Generated)
                    </h3>
                    <button 
                      onClick={() => navigator.clipboard.writeText(selectedIssue.suggestedFix || '')}
                      className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-brand-900/30 overflow-x-auto relative group">
                     <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     </div>
                    <code className="text-xs font-mono text-brand-200 whitespace-pre-wrap">
                      {selectedIssue.suggestedFix}
                    </code>
                  </div>
                </div>
              )}

              {/* Explanation */}
              {selectedIssue.explanation && (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                   <h3 className="text-sm font-semibold text-white mb-2">The "Why"</h3>
                   <div className="prose prose-invert prose-sm text-slate-300">
                     <ReactMarkdown>{selectedIssue.explanation}</ReactMarkdown>
                   </div>
                </div>
              )}
            </div>
            
            {/* Footer Action */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
               <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all text-sm font-medium">
                 <GitBranch className="w-4 h-4" />
                 Apply to Branch (Mock)
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>Select an issue from the list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueList;
