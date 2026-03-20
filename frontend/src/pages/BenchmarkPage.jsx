import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, Copy } from 'lucide-react';
import { benchmarkPrompt } from '../utils/api';
import { memoryStorage } from '../utils/memoryStore';

export default function BenchmarkPage({ 
  originalPrompt, 
  selectedModel, 
  benchmarkResults, 
  setBenchmarkResults,
  providerUsed,
  setProviderUsed
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const runBenchmarkIfNeeded = async () => {
      if (location.state?.runBenchmark && originalPrompt) {
        setIsBenchmarking(true);
        setError('');
        try {
          let actualAnswers = location.state?.answers;
          if (!actualAnswers || Object.keys(actualAnswers).length === 0) {
            try {
              const saved = memoryStorage.getItem('pf__answers');
              if (saved) actualAnswers = JSON.parse(saved);
            } catch (e) {}
          }

          const data = await benchmarkPrompt(originalPrompt, actualAnswers || {}, selectedModel);
          setBenchmarkResults(data);
          setProviderUsed(data.provider_used || selectedModel);
          // Clean up location state so a refresh doesn't trigger it again
          navigate('/benchmark', { replace: true });
        } catch (err) {
          console.error(err);
          setError(err.message || 'Benchmark failed.');
        } finally {
          setIsBenchmarking(false);
        }
      }
    };

    runBenchmarkIfNeeded();
  }, [location.state?.runBenchmark, originalPrompt, selectedModel, setBenchmarkResults, setProviderUsed, navigate]);

  if (isBenchmarking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in max-w-4xl mx-auto">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin mb-4" />
        <h2 className="text-3xl font-bold text-slate-800">Running Benchmark...</h2>
        <p className="text-slate-500 mt-2">Testing multiple variants. This might take a minute.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-xl text-center shadow-sm">
          <p className="font-semibold mb-4">{error}</p>
          <button 
            onClick={() => navigate('/results')} 
            className="text-sm font-medium bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!benchmarkResults) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500">No benchmark data available. Generate a prompt first.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-purple-600 hover:underline">Go Home</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/results')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to Results"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Benchmark</h1>
      </div>

      <div className="text-center mt-2 mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900">Benchmark Complete!</h2>
        <p className="mt-1 text-slate-500">We tested multiple variants and scored the responses.</p>
      </div>

      {originalPrompt && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Testing Context / Original Input:</span>
          <p className="text-slate-600 text-sm font-medium italic">"{originalPrompt}"</p>
        </div>
      )}

      {/* Best Prompt Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
          <span className="bg-green-100 text-green-700 p-1.5 rounded-lg text-xs">Best</span>
          Best Optimized Prompt
        </h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
          {benchmarkResults.best_prompt}
        </div>
        <button 
          onClick={() => handleCopy(benchmarkResults.best_prompt)}
          className={`mt-4 w-full font-medium px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all ${
            copied 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
          }`}
        >
          {copied ? (
            <><Check size={16} /> Copied!</>
          ) : (
            <><Copy size={16} /> Copy Best Prompt</>
          )}
        </button>
      </div>

      {/* Variant Cards */}
      <h3 className="text-xl font-bold text-slate-800 mt-10 mb-4 border-b pb-2">All Prompt Variants</h3>
      <div className="space-y-6">
        {(benchmarkResults.variants || []).map((variant, i) => {
           const isBest = i === benchmarkResults.best_prompt_index;
           const providerName = variant.provider === 'groq' ? 'Groq' : variant.provider === 'huggingface' ? 'Hugging Face' : variant.provider === 'gemini' ? 'Gemini' : variant.provider;
           
           return (
              <div key={i} className={`p-6 rounded-2xl border flex flex-col ${isBest ? 'border-green-300 bg-green-50/20 shadow-md ring-2 ring-green-50' : 'border-slate-200 bg-white shadow-sm'} transition-all`}>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100/80">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-xs tracking-wide uppercase">{providerName}</span>
                    {isBest && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Winner</span>}
                  </h4>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-slate-900">{Math.round(variant.score)}</span>
                    <span className="text-xs text-slate-500 font-medium ml-1">/ 10</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                  {variant.prompt}
                </div>
              </div>
           );
        })}
      </div>
    </div>
  );
}
