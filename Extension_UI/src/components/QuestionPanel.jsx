import React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';

const QuestionPanel = ({ questions = [], answers, onAnswerChange, onSubmit, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || questions.length === 0) {
      return;
    }

    onSubmit();
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] text-gray-200">
      <div className="p-4 border-b border-gray-800 bg-[#111827] flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Clarification Questions</h2>
          <p className="text-xs text-gray-400">Answer each question to continue.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto space-y-4">
        {questions.map((question, index) => {
          const questionText = typeof question === 'string' ? question : question?.question || String(question);
          return (
            <div key={`${questionText}-${index}`} className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300 leading-snug">
                {questionText}
              </label>
              <input
                type="text"
                value={answers[questionText] || ''}
                onChange={(e) => onAnswerChange(questionText, e.target.value)}
                placeholder="Type your response..."
                disabled={isLoading}
                className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>
          );
        })}

        {questions.length === 0 && (
          <div className="rounded-lg border border-gray-800 bg-[#111827] px-3 py-4 text-center text-sm text-gray-400">
            Generating clarification questions...
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || questions.length === 0}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <span>Generate Prompt</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default QuestionPanel;