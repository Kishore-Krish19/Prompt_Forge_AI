import React from 'react';

export default function PromptScoreCard({ score = 0, analysis }) {
  const metrics = [
    { label: 'Clarity', value: analysis?.clarity || 0 },
    { label: 'Specificity', value: analysis?.specificity || 0 },
    { label: 'Context', value: analysis?.context || 0 },
    { label: 'Constraints', value: analysis?.constraints || 0 },
    { label: 'Output Format', value: analysis?.output_format || 0 }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 animate-fade-in h-full flex flex-col">
      <div className="text-center mb-6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Prompt Quality Score
        </span>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {score}
          </span>
          <span className="text-slate-400 text-lg font-medium">/ 100</span>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-600">{m.label}</span>
              <span className="text-slate-500 text-xs">{m.value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(m.value)}`} 
                style={{ width: `${m.value}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
