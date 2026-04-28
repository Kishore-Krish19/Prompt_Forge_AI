import React from 'react';
import { ArrowRight, Check, Copy, RotateCcw } from 'lucide-react';

const PromptComparison = ({
  originalPrompt,
  optimizedPrompt,
  onCopy,
  copied,
  onStartOver,
}) => {
  return (
    <div className="rounded-lg border border-gray-700 bg-[#111827] p-4 space-y-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Original Prompt</p>
          <div className="rounded-lg border border-gray-700 bg-[#0f172a] p-3 text-sm text-gray-200 whitespace-pre-wrap">
            {originalPrompt}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300 flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5" />
            Optimized Prompt
          </p>
          <div className="rounded-lg border border-blue-500/20 bg-[#0f172a] p-3 text-sm text-gray-100 whitespace-pre-wrap min-h-[140px]">
            {optimizedPrompt || 'Generating optimized prompt...'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCopy}
          disabled={!optimizedPrompt}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-transparent px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
};

export default PromptComparison;
