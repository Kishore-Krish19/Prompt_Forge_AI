import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

export default function SuggestionList({ suggestions }) {
  const defaultSuggestions = [
    "Specify the target audience to tailor output tone.",
    "Add constraints like maximum length or format restrictions.",
    "Include examples of desired outputs for style reference.",
    "Add more context in the instructions guidelines."
  ];

  const items = suggestions && suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <Lightbulb size={20} className="text-amber-500" />
        <h3 className="font-semibold text-slate-800">
          Improvement Suggestions
        </h3>
      </div>

      <ul className="space-y-3">
        {items.map((suggestion, index) => (
          <li key={index} className="flex gap-3 text-sm text-slate-600 bg-slate-50/80 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="mt-0.5 text-purple-500">
              <Info size={16} />
            </div>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
