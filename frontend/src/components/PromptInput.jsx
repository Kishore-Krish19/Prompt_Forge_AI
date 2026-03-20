import React from 'react';
import { Sparkles } from 'lucide-react';
import { memoryStorage } from '../utils/memoryStore';

export default function PromptInput({ onSubmit, isLoading }) {
  const [prompt, setPrompt] = React.useState(() => memoryStorage.getItem('pf__prompt') || '');

  React.useEffect(() => {
    memoryStorage.setItem('pf__prompt', prompt);
  }, [prompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Prompt Optimizer
        </h2>
        <p className="mt-2 text-slate-500">
          Paste your rough prompt and let AI improve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 pb-2 border-slate-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all duration-200">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Example: Input a simple prompt like 'create a website for my portfolio'..."
            className="w-full h-32 p-3 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
          />
          <div className="flex justify-end p-2 border-t border-slate-100 items-center">
            <span className="text-xs text-slate-400 mr-4">
              {prompt.length} characters
            </span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!prompt.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          <span>{isLoading ? 'Analyzing...' : 'Analyze Prompt'}</span>
        </button>
      </form>
    </div>
  );
}
