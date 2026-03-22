import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import Navbar from './components/Navbar';
import PromptInput from './components/PromptInput';
import QuestionPanel from './components/QuestionPanel';
import PromptComparison from './components/PromptComparison';
import PromptScoreCard from './components/PromptScoreCard';
import SuggestionList from './components/SuggestionList';
import Dashboard from './pages/Dashboard';
import BenchmarkPage from './pages/BenchmarkPage';

// API Utilities
import { analyzePrompt, optimizePrompt, scorePrompt } from './utils/api';
import { memoryStorage } from './utils/memoryStore';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('optimizer');
  const navigate = useNavigate();
  const location = useLocation();

  const safeParse = (key, fallback) => {
    try {
      const val = memoryStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const [originalPrompt, setOriginalPrompt] = React.useState(() => memoryStorage.getItem('pf__originalPrompt') || '');
  const [isLoading, setIsLoading] = React.useState(false);

  // API Responses State
  const [questions, setQuestions] = React.useState(() => safeParse('pf__questions', []));
  const [optimizedPrompt, setOptimizedPrompt] = React.useState(() => memoryStorage.getItem('pf__optimizedPrompt') || '');
  const [promptScore, setPromptScore] = React.useState(() => Number(memoryStorage.getItem('pf__promptScore')) || 0);
  const [promptAnalysis, setPromptAnalysis] = React.useState(() => safeParse('pf__promptAnalysis', null));
  const [suggestions, setSuggestions] = React.useState(() => safeParse('pf__suggestions', []));
  const [error, setError] = React.useState('');
  const [selectedModel, setSelectedModel] = React.useState(() => memoryStorage.getItem('pf__selectedModel') || 'groq');
  const [providerUsed, setProviderUsed] = React.useState(() => memoryStorage.getItem('pf__providerUsed') || '');
  const [benchmarkResults, setBenchmarkResults] = React.useState(() => safeParse('pf__benchmarkResults', null));

  React.useEffect(() => {
    memoryStorage.setItem('pf__originalPrompt', originalPrompt);
    memoryStorage.setItem('pf__questions', JSON.stringify(questions));
    memoryStorage.setItem('pf__optimizedPrompt', optimizedPrompt);
    memoryStorage.setItem('pf__promptScore', promptScore);
    memoryStorage.setItem('pf__promptAnalysis', JSON.stringify(promptAnalysis));
    memoryStorage.setItem('pf__suggestions', JSON.stringify(suggestions));
    memoryStorage.setItem('pf__selectedModel', selectedModel);
    memoryStorage.setItem('pf__providerUsed', providerUsed);
    memoryStorage.setItem('pf__benchmarkResults', JSON.stringify(benchmarkResults));
  }, [originalPrompt, questions, optimizedPrompt, promptScore, promptAnalysis, suggestions, selectedModel, providerUsed, benchmarkResults]);

  const handleAnalyze = async (prompt) => {
    setIsLoading(true);
    setError('');
    setOriginalPrompt(prompt);
    
    try {
      const data = await analyzePrompt(prompt, selectedModel);
      setQuestions(data.questions || []);
      setProviderUsed(data.provider_used || selectedModel);
      navigate('/questions');
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
      
      navigate('/results', { state: { answers } });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBenchmark = (answersFromState) => {
    navigate('/benchmark', { state: { answers: answersFromState, runBenchmark: true } });
  };

  const handleResetOptimization = () => {
    setOriginalPrompt('');
    setQuestions([]);
    setOptimizedPrompt('');
    setPromptScore(0);
    setPromptAnalysis(null);
    setSuggestions([]);
    setError('');
    memoryStorage.removeItem('pf__originalPrompt');
    memoryStorage.removeItem('pf__prompt');
    memoryStorage.removeItem('pf__questions');
    memoryStorage.removeItem('pf__optimizedPrompt');
    memoryStorage.removeItem('pf__promptScore');
    memoryStorage.removeItem('pf__promptAnalysis');
    memoryStorage.removeItem('pf__suggestions');
    navigate('/', { replace: true });
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

          <Routes>
            <Route path="/" element={
              <>
                {/* Model Selector Dropdown */}
                <div className="flex justify-end items-center space-x-2 max-w-2xl mx-auto px-2 mb-4">
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
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 max-w-2xl mx-auto hover:scale-[1.01] transition-transform duration-300">
                  <PromptInput onSubmit={handleAnalyze} isLoading={isLoading} />
                </div>
              </>
            } />

            <Route path="/questions" element={
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2 max-w-xl mx-auto">
                  <button 
                    onClick={() => navigate('/')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Back to Main Page"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h1 className="text-2xl font-bold text-slate-800">Question Panel</h1>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 bg-slate-50/80 max-w-xl mx-auto border-slate-200">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Prompt:</span>
                  <p className="text-slate-700 text-sm mt-1 font-medium truncate">"{originalPrompt}"</p>
                </div>
                <QuestionPanel 
                  questions={questions} 
                  onGenerate={handleGenerate} 
                  isLoading={isLoading} 
                />
              </div>
            } />

            <Route path="/results" element={
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <button 
                    onClick={() => navigate('/questions')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Back to Question Panel"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h1 className="text-2xl font-bold text-slate-800">Generated Prompt</h1>
                </div>
                
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
                  onOriginalChange={setOriginalPrompt}
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

                {/* Restart & Benchmark Actions */}
                <div className="flex justify-center gap-4 pt-4">
                  <button 
                    onClick={handleResetOptimization}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-sm font-medium transition-colors shadow-sm"
                  >
                    Start New Optimization
                  </button>
                  <button 
                    onClick={() => handleBenchmark(location.state?.answers)}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Play size={16} /> Run Benchmark
                  </button>
                </div>
              </div>
            } />

            <Route path="/benchmark" element={
              <BenchmarkPage 
                originalPrompt={originalPrompt}
                selectedModel={selectedModel}
                benchmarkResults={benchmarkResults}
                setBenchmarkResults={setBenchmarkResults}
                providerUsed={providerUsed}
                setProviderUsed={setProviderUsed}
              />
            } />
          </Routes>
        </div>
        )}
      </main>
    </div>
  );
}
