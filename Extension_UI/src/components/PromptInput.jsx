import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const modelOptions = [
  { value: 'groq', label: 'Groq (Llama 3)' },
  { value: 'huggingface', label: 'Hugging Face (Qwen)' },
  { value: 'gemini', label: 'Gemini (2.5 Flash)' },
];

const PromptInput = ({
  prompt,
  setPrompt,
  selectedModel,
  setSelectedModel,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) {
      return;
    }

    onSubmit(prompt.trim(), selectedModel);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] text-gray-200">
      <div className="p-4 border-b border-gray-800 bg-[#111827]">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          PromptForge AI
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            Model Selection
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your rough prompt here..."
            className="w-full h-40 bg-[#1f2937] border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Optimize Prompt
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PromptInput;
