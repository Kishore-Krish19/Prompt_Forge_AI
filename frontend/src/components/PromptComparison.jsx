import React from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';

export default function PromptComparison({ original, optimized }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* Original Prompt */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Original Prompt
          </span>
        </div>
        <div className="flex-1 text-slate-700 text-sm whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          {original || "No original prompt entered."}
        </div>
      </div>

      {/* Optimized Prompt */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col h-full border-purple-100 bg-gradient-to-br from-purple-50/20 to-white">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-100">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowRight size={14} className="text-purple-500" />
            Optimized Prompt
          </span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="flex-1 text-slate-800 font-medium text-sm whitespace-pre-wrap bg-white/80 p-4 rounded-xl border border-purple-100/50 shadow-sm leading-relaxed">
          {optimized || "Generating optimized prompt..."}
        </div>
      </div>
    </div>
  );
}
