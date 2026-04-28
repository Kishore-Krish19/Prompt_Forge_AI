import React from 'react';

const PromptScoreCard = ({ score = 0, analysis }) => {
  const metrics = [
    { label: 'Clarity', value: analysis?.clarity || 0 },
    { label: 'Specificity', value: analysis?.specificity || 0 },
    { label: 'Context', value: analysis?.context || 0 },
    { label: 'Constraints', value: analysis?.constraints || 0 },
    { label: 'Output Format', value: analysis?.output_format || 0 },
  ];

  return (
    <div className="rounded-lg border border-gray-700 bg-[#111827] p-4 space-y-4">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Prompt Score</p>
        <div className="mt-1 flex items-end justify-center gap-1">
          <span className="text-4xl font-extrabold text-white">{score}</span>
          <span className="pb-1 text-sm text-gray-400">/ 100</span>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptScoreCard;