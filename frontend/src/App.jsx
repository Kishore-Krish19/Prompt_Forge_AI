import React from 'react';
import Navbar from './components/Navbar';
import PromptInput from './components/PromptInput';
import QuestionPanel from './components/QuestionPanel';
import PromptComparison from './components/PromptComparison';
import PromptScoreCard from './components/PromptScoreCard';
import SuggestionList from './components/SuggestionList';
import Dashboard from './pages/Dashboard';

// API Utilities
import { analyzePrompt, optimizePrompt, scorePrompt, benchmarkPrompt } from './utils/api';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('optimizer');
  const [step, setStep] = React.useState(1); // 1: Input, 2: Questions, 3: Results, 4: Benchmark Results
  const [originalPrompt, setOriginalPrompt] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // API Responses State
  const [questions, setQuestions] = React.useState([]);
  const [optimizedPrompt, setOptimizedPrompt] = React.useState('');
  const [promptScore, setPromptScore] = React.useState(0);
  const [promptAnalysis, setPromptAnalysis] = React.useState(null);
  const [suggestions, setSuggestions] = React.useState([]);
  const [error, setError] = React.useState('');
  const [selectedModel, setSelectedModel] = React.useState('groq');
  const [providerUsed, setProviderUsed] = React.useState('');
  const [benchmarkResults, setBenchmarkResults] = React.useState(null);

  const handleAnalyze = async (prompt) => {
    setIsLoading(true);
    setError('');
    setOriginalPrompt(prompt);
    
    try {
      const data = await analyzePrompt(prompt, selectedModel);
      setQuestions(data.questions || []);
      setProviderUsed(data.provider_used || selectedModel);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (answers) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Run optimize and score in parallel
      const [optimizeData, scoreData] = await Promise.all([
        optimizePrompt(originalPrompt, answers, selectedModel),
        scorePrompt(originalPrompt, selectedModel)
      ]);
      
      setOptimizedPrompt(optimizeData.optimized_prompt);
      setPromptScore(scoreData.score);
      setPromptAnalysis(scoreData.analysis);
      setSuggestions(scoreData.suggestions || []);
      setProviderUsed(optimizeData.provider_used || selectedModel);
      
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBenchmark = async (answers) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await benchmarkPrompt(originalPrompt, answers, selectedModel);
      setBenchmarkResults(data);
      setProviderUsed(data.provider_used || selectedModel);
      setStep(4);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Benchmark failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-16">
        {activeTab === 'dashboard' ? (
          <Dashboard />
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
         
          {/* Global Error message layout triggers */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm animate-fade-in shadow-sm">
              {error}
            </div>
          )}

          {/* Model Selector Dropdown */}
          {step === 1 && (
            <div className="flex justify-end items-center space-x-2 max-w-2xl mx-auto px-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Provider:</span>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <option value="groq">Groq (Llama 3)</option>
                <option value="huggingface">Hugging Face (Qwen)</option>
                <option value="gemini">Gemini (2.5 Flash)</option>
              </select>
            </div>
          )}

          {/* Step 1: Input */}
          {step === 1 && (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 max-w-2xl mx-auto scale-[1.01] transition-transform duration-300">
              <PromptInput onSubmit={handleAnalyze} isLoading={isLoading} />
            </div>
          )}

          {/* Step 2: Questions Panel */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 bg-slate-50/80 max-w-xl mx-auto border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Prompt:</span>
                <p className="text-slate-700 text-sm mt-1 font-medium truncate">"{originalPrompt}"</p>
              </div>
              <QuestionPanel 
                questions={questions} 
                onGenerate={handleGenerate} 
                onBenchmark={handleBenchmark}
                isLoading={isLoading} 
              />
            </div>
          )}

          {/* Step 3: Results Dashboard */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900">Optimization Complete!</h2>
                <p className="mt-1 text-slate-500">Here is your improved, AI-ready structure prompt.</p>
                
                {/* Fallback Badge */}
                <div className="mt-3 flex justify-center">
                  {selectedModel !== providerUsed ? (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                      {selectedModel.toUpperCase()} unavailable. Response generated using {providerUsed.toUpperCase()}
                    </span>
                  ) : (
                    <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-medium">
                      Generated using {providerUsed.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Comparison Card */}
              <PromptComparison 
                original={originalPrompt} 
                optimized={optimizedPrompt} 
              />

              {/* Metrics & Recommendations grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <PromptScoreCard score={promptScore} analysis={promptAnalysis} />
                </div>
                <div className="md:col-span-2">
                  <SuggestionList suggestions={suggestions} />
                </div>
              </div>

              {/* Restart Actions */}
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Start New Optimization
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Benchmark Results */}
          {step === 4 && benchmarkResults && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900">Benchmark Complete!</h2>
                <p className="mt-1 text-slate-500">We tested multiple variants and scored the responses.</p>
              </div>

              {/* Best Prompt Card */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <span className="bg-green-100 text-green-700 p-1.5 rounded-lg text-xs">Best</span>
                  Optimized Prompt Variant
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {benchmarkResults.best_prompt}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(benchmarkResults.best_prompt)}
                  className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  Copy Best Prompt
                </button>
              </div>

              {/* Grid Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(benchmarkResults.benchmark_results).map(([key, score], i) => {
                   const isBest = i === benchmarkResults.best_prompt_index;
                   return (
                      <div key={key} className={`p-4 rounded-xl border ${isBest ? 'border-green-200 bg-green-50/30' : 'border-slate-100 bg-white'} shadow-sm text-center`}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Variant {i+1}</p>
                        <p className="text-3xl font-extrabold text-slate-800 mt-1">{score}<span className="text-sm text-slate-400">/10</span></p>
                        {isBest && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mt-2 inline-block font-medium">Winner</span>}
                      </div>
                   );
                })}
              </div>

              <div className="flex justify-center mt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center gap-2"
                >
                  ← Back to Questions
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
