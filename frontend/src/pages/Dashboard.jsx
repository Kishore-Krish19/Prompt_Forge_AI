import React from 'react';
import { ArrowUpRight, Award, BarChart3, Clock, Compass, Layers, Zap } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch mock/real aggregates from endpoints
    fetch('http://localhost:8000/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500">
        Failed to load dashboard metrics. Ensure backend is running.
      </div>
    );
  }

  const { prompt_improvement, model_performance, benchmark_results } = data;
  const improvement = prompt_improvement.optimized - prompt_improvement.original;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Dashboard layout triggers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Visualize prompt performance and model benchmarks scoring nodes accurately.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Sync Enabled
        </div>
      </div>

      {/* Section 5: System Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Zap size={20} />} 
          title="Total Optimized" 
          value="154" 
          subValue="+12% this week" 
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={<Layers size={20} />} 
          title="Benchmarks Run" 
          value="42" 
          subValue="+5 today" 
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard 
          icon={<Award size={20} />} 
          title="Best Model" 
          value="OpenAI (GPT-4)" 
          subValue="Avg score 9.2" 
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={<Compass size={20} />} 
          title="Avg Prompt Score" 
          value="84" 
          subValue="+4 pts increase" 
          iconBg="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 1: Prompt Improvement */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Prompt Improvement</h3>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Original Score</p>
              <p className="text-2xl font-extrabold text-slate-600">{prompt_improvement.original}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase">Optimized Score</p>
              <p className="text-2xl font-extrabold text-indigo-600">{prompt_improvement.optimized}</p>
            </div>
          </div>
          {/* Progress bar structure */}
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex mb-4">
            <div className="bg-slate-300 h-full" style={{ width: `${prompt_improvement.original}%` }}></div>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full animate-grow-width" style={{ width: `${prompt_improvement.optimized - prompt_improvement.original}%` }}></div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center mt-2">
            <p className="text-sm font-medium text-green-800">Improvement Gain</p>
            <p className="text-3xl font-black text-green-600">+{improvement}%</p>
          </div>
        </div>

        {/* Section 2: Model Performance Comparison Bar Chart using pure CSS grid */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-slate-500" />
            Model Performance Comparison
          </h3>
          <div className="flex items-end justify-around h-48 border-b border-slate-100 pb-2 mb-4">
            {Object.entries(model_performance).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center gap-2 w-full max-w-[80px]">
                <div className="w-full bg-gradient-to-t from-indigo-500/80 to-indigo-600 rounded-t-xl animate-grow-height relative group" style={{ height: `${val * 10}%` }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {val}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 3: Benchmark Results */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Benchmark Engine results</h3>
          <div className="space-y-4">
            {Object.entries(benchmark_results).map(([key, val], index) => {
              const isBest = val === Math.max(...Object.values(benchmark_results));
              return (
                <div key={key} className={`p-4 rounded-xl border ${isBest ? 'border-green-200 bg-green-50/40' : 'border-slate-100 bg-white'} flex items-center justify-between`}>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">Variant {index + 1}</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{key.toUpperCase()} generated</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-700">{val}<span className="text-xs text-slate-400">/10</span></p>
                    {isBest && <span className="text-2xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Best</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Prompt History Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 lg:col-span-2 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            Prompt History
          </h3>
          <div className="border border-slate-100 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 font-semibold">Prompt</th>
                  <th className="p-3 font-semibold text-center">Model</th>
                  <th className="p-3 font-semibold text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <TableRow prompt="Build portfolio website" model="Groq" score={9} />
                <TableRow prompt="Write AI tutorial blog" model="OpenAI" score={8} />
                <TableRow prompt="Startup pitch deck hooks" model="Gemini" score={9} />
                <TableRow prompt="SQL Optimisation scripts" model="Groq" score={10} />
              </tbody>
            </table>
          </div>
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
        <p className="text-xs text-green-600 mt-1 font-medium">{subValue}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-xl`}>{icon}</div>
    </div>
  </div>
);

const TableRow = ({ prompt, model, score }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="p-3 truncate max-w-[200px] font-medium text-slate-800">{prompt}</td>
    <td className="p-3 text-center">
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${model === 'Groq' ? 'bg-orange-50 text-orange-700' : model === 'OpenAI' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
        {model}
      </span>
    </td>
    <td className="p-3 text-center">
      <span className="font-bold text-slate-800">{score}</span>
      <span className="text-slate-400 text-xs">/10</span>
    </td>
  </tr>
);
 
