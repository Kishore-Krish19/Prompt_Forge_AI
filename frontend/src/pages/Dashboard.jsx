import React, { useState, useEffect } from 'react';
import { Award, Clock, Compass, Layers, Zap } from 'lucide-react';
import { memoryStorage } from '../utils/memoryStore';

// === GLOBAL ACTIVITY TRACKER ===
const initTracker = () => {
  if (typeof window === 'undefined') return;
  if (window.__dashboard_tracker_initialized) return;
  window.__dashboard_tracker_initialized = true;

  const originalSetItem = memoryStorage.setItem;

  memoryStorage.setItem = (key, value) => {
    originalSetItem(key, value);
    if (key === 'pf__promptScore') {
      setTimeout(() => trackGeneration(), 50);
    }
    if (key === 'pf__benchmarkResults') {
      setTimeout(() => trackBenchmark(), 50);
    }
  };

  setTimeout(() => {
    if (memoryStorage.getItem('pf__promptScore')) trackGeneration();
    if (memoryStorage.getItem('pf__benchmarkResults')) trackBenchmark();
  }, 200);
};

const sanitizeScore = (raw) => {
  let s = Number(raw) || 0;
  if (s > 10) s = Math.round(s / 10);
  return Math.min(10, Math.max(0, Math.round(s)));
};

function trackGeneration() {
  const original = memoryStorage.getItem('pf__originalPrompt');
  const provider = memoryStorage.getItem('pf__providerUsed') || memoryStorage.getItem('pf__selectedModel') || 'Groq';
  const score = sanitizeScore(memoryStorage.getItem('pf__promptScore'));

  if (!original) return;

  const history = JSON.parse(localStorage.getItem('dashboard_gen_history') || '[]');

  const isDup = history.some(h => h.prompt === original && h.model === provider && h.score === score);
  if (isDup) return;

  history.unshift({
    id: Date.now() + Math.random(),
    prompt: original,
    model: provider,
    score: score,
    timestamp: Date.now()
  });
  localStorage.setItem('dashboard_gen_history', JSON.stringify(history));
  window.dispatchEvent(new Event('dashboard_data_updated'));
}

function trackBenchmark() {
  const original = memoryStorage.getItem('pf__originalPrompt');
  const resultsStr = memoryStorage.getItem('pf__benchmarkResults');
  if (!original || !resultsStr) return;

  try {
    const results = JSON.parse(resultsStr);
    if (!results || !results.variants || results.variants.length === 0) return;

    const history = JSON.parse(localStorage.getItem('dashboard_bench_history') || '[]');

    const isDup = history.some(h => h.prompt === original && JSON.stringify(h.results.variants) === JSON.stringify(results.variants));
    if (isDup) return;

    history.unshift({
      id: Date.now() + Math.random(),
      prompt: original,
      results: results,
      timestamp: Date.now()
    });
    localStorage.setItem('dashboard_bench_history', JSON.stringify(history));
    window.dispatchEvent(new Event('dashboard_data_updated'));
  } catch (e) { }
}

initTracker();

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Fix ties dynamically and enforce 0-10 limits
const ensureUniqueScores = (variants) => {
  let items = variants.map(v => ({
    ...v,
    score: sanitizeScore(v.score)
  }));

  let used = new Set();
  items.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const lenA = a.prompt ? a.prompt.length : 0;
    const lenB = b.prompt ? b.prompt.length : 0;
    return lenB - lenA; // dynamic tie break based on text length
  });

  items.forEach(v => {
    let s = v.score;
    while (used.has(s) && s > 0) {
      s -= 1;
    }
    v.score = s;
    used.add(s);
  });
  return items;
};

const normalizeName = (raw) => {
  const p = (raw || '').toLowerCase();
  if (p.includes('hugging')) return 'Hugging Face';
  if (p.includes('gemini')) return 'Gemini';
  return 'Groq';
};

const getModelColors = (modelName) => {
  switch (modelName) {
    case 'Groq': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Hugging Face': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
    case 'Gemini': return 'bg-sky-50 text-sky-700 border-sky-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getScoreColors = (score) => {
  if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (score >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-rose-100 text-rose-800 border-rose-200';
};

export default function Dashboard() {
  const [data, setData] = useState(null);

  const loadData = () => {
    let benchHistory = JSON.parse(localStorage.getItem('dashboard_bench_history') || '[]');
    let genHistoryRaw = localStorage.getItem('dashboard_gen_history') || '[]';

    const genMatch = genHistoryRaw.match(/"id":/g);
    const totalPrompts = genMatch ? genMatch.length : 0;
    const totalBenchmarks = benchHistory.length;

    let totalScore = 0;
    let totalVariantCount = 0;

    benchHistory.forEach(bench => {
      if (!bench.results || !bench.results.variants) return;
      bench.results.variants.forEach(variant => {
        totalScore += sanitizeScore(variant.score);
        totalVariantCount++;
      });
    });

    const avgScore = totalVariantCount > 0 ? Math.round(totalScore / totalVariantCount) : 0;

    let latestBench = null;
    let bestModelName = '-';
    let bestModelScore = 0;

    if (benchHistory.length > 0) {
      latestBench = benchHistory[0];
      const winIdx = latestBench.results.best_prompt_index || 0;
      const winnerVar = latestBench.results.variants[winIdx];
      if (winnerVar) {
        bestModelName = normalizeName(winnerVar.provider);
        bestModelScore = sanitizeScore(winnerVar.score);
      }
    }

    let allRecent = [];
    benchHistory.forEach(b => {
      if (b.results && b.results.variants) {
        const winIdx = b.results.best_prompt_index || 0;
        const winnerVar = b.results.variants[winIdx];
        if (winnerVar) {
          allRecent.push({
            prompt: b.prompt,
            model: normalizeName(winnerVar.provider),
            score: sanitizeScore(winnerVar.score),
            timestamp: b.timestamp,
            originalStr: b.prompt
          });
        }
      }
    });

    allRecent.sort((a, b) => b.timestamp - a.timestamp);

    const uniqueRecent = [];
    const seenCombos = new Set();

    for (const item of allRecent) {
      const key = `${item.originalStr.trim().toLowerCase()}`;
      if (!seenCombos.has(key)) {
        seenCombos.add(key);
        uniqueRecent.push(item);
      }
    }

    const finalRecent = uniqueRecent.slice(0, 3);

    setData({
      totalPrompts,
      totalBenchmarks,
      bestModelName,
      bestModelScore,
      avgScore,
      latestBench,
      recent: finalRecent
    });
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('dashboard_data_updated', handleUpdate);

    const interval = setInterval(() => loadData(), 60000);

    return () => {
      window.removeEventListener('dashboard_data_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  if (!data) return null;

  if (data.totalPrompts === 0 && data.totalBenchmarks === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center px-4 max-w-7xl mx-auto">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 w-full max-w-2xl">
          <Layers className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Dashboard Awaits</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-sm mx-auto">
            Get started by generating prompts or running benchmarks to track real performance data here. No fake data!
          </p>
        </div>
      </div>
    );
  }

  const { totalPrompts, totalBenchmarks, bestModelName, bestModelScore, avgScore, latestBench, recent } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Dashboard layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time metrics driven entirely by your actual app usage.</p>
        </div>
      </div>

      {/* Section 5: System Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Zap size={20} />}
          title="Total Prompts Created"
          value={totalPrompts}
          subValue="Based on actual generations"
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<Layers size={20} />}
          title="Total Benchmarks Run"
          value={totalBenchmarks}
          subValue="Based on valid run history"
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={<Award size={20} />}
          title="Best Performing Model"
          value={bestModelName === '-' ? 'N/A' : bestModelName}
          subValue={bestModelName === '-' ? 'Waiting for benchmarks' : `Latest Winner: ${bestModelScore}/10`}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={<Compass size={20} />}
          title="Average Score"
          value={`${avgScore}/10`}
          subValue="Aggregated completely across runs"
          iconBg="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 3: Benchmark Results */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 lg:col-span-1 border-t-4 border-t-purple-500">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Latest Benchmark Run</h3>
          {latestBench ? (
            <div className="space-y-4">
              {latestBench.results.variants.map((variant, index) => {
                const isBest = index === latestBench.results.best_prompt_index;
                const normalizedProvider = normalizeName(variant.provider);
                const finalScore = sanitizeScore(variant.score);
                const currentScoreClasses = getScoreColors(finalScore);

                return (
                  <div key={index} className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isBest ? 'bg-green-50 shadow-md ring-1 ring-green-200 border-green-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank {index + 1}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{normalizedProvider}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      {isBest && <span className="text-[10px] bg-emerald-500 text-white shadow-sm px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Winner</span>}
                      <div className={`dashboard-badge px-2 py-1 rounded-md border flex items-center justify-center min-w-[3rem] ${currentScoreClasses}`}>
                        <span className="text-xl font-black">{finalScore}</span>
                        <span className="opacity-70 font-bold text-xs ml-0.5">/10</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-8 text-center text-slate-400 text-sm h-[200px]">
              No benchmarks run yet.
            </div>
          )}
        </div>

        {/* Section 4: Recent Activity Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 lg:col-span-2 overflow-hidden border-t-4 border-t-indigo-500">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            Recent Activity
          </h3>
          {recent.length > 0 ? (
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3 font-semibold">Prompt</th>
                    <th className="p-3 font-semibold text-center">Model</th>
                    <th className="p-3 font-semibold text-center w-24">Score</th>
                    <th className="p-3 font-semibold text-right hidden sm:table-cell w-28">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recent.map((item, idx) => (
                    <TableRow key={idx} {...item} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, title, value, subValue, iconBg }) => (
  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-extrabold text-slate-800 mt-1">{value}</p>
        <p className="text-[11px] text-slate-500 mt-1 font-medium">{subValue}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-xl`}>{icon}</div>
    </div>
  </div>
);

const TableRow = ({ prompt, model, score, timestamp }) => {
  const modelColors = getModelColors(model);
  const scoreColors = getScoreColors(score);

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="p-3 truncate max-w-[150px] sm:max-w-[300px] font-medium text-slate-800" title={prompt}>{prompt}</td>
      <td className="p-3 text-center">
        <span className={`dashboard-badge text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${modelColors}`}>
          {model}
        </span>
      </td>
      <td className="p-3 text-center font-bold text-slate-800 h-10 flex justify-center items-center mt-0.5">
        <div className={`dashboard-badge px-2 py-0.5 rounded-md border flex items-center justify-center min-w-[3rem] ${scoreColors}`}>
          {score}<span className="opacity-70 font-medium text-xs ml-0.5">/10</span>
        </div>
      </td>
      <td className="p-3 text-right text-xs text-slate-400 whitespace-nowrap hidden sm:table-cell">
        {timeAgo(timestamp)}
      </td>
    </tr>
  );
};
