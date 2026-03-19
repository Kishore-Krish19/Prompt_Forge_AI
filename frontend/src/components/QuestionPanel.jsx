import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function QuestionPanel({ questions = [], onGenerate, onBenchmark, isLoading }) {
  const [answers, setAnswers] = React.useState({});

  const handleChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(answers);
  };

  const handleBenchmarkSubmit = (e) => {
    e.preventDefault();
    if (onBenchmark) {
      onBenchmark(answers);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
          <HelpCircle size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            AI needs a few details
          </h3>
          <p className="text-xs text-slate-500">
            Help us tailor the prompt to your exact needs.
          </p>
        </div>
      </div>

      <form className="space-y-4">
        {questions.map((q, index) => (
          <div key={index} className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              {q}
            </label>
            <input
              type="text"
              value={answers[q] || ''}
              onChange={(e) => handleChange(q, e.target.value)}
              placeholder="Type your response..."
              disabled={isLoading}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition-all disabled:opacity-60"
            />
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">Generating questions...</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isLoading || questions.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Generate Prompt</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>

          <button 
            type="button" 
            onClick={handleBenchmarkSubmit}
            disabled={isLoading || questions.length === 0}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] border border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Run Benchmark</span>
          </button>
        </div>
      </form>
    </div>
  );
}