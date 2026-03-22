import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { memoryStorage } from '../utils/memoryStore';

const LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'kn-IN', label: 'Kannada' },
];

export default function PromptInput({ onSubmit, isLoading }) {
  const initialPrompt = memoryStorage.getItem('pf__prompt') || '';
  const [prompt, setPrompt] = React.useState(initialPrompt);
  const [selectedLang, setSelectedLang] = React.useState('en-IN');
  const [isPolishing, setIsPolishing] = React.useState(false);

  const basePromptRef = React.useRef(initialPrompt);
  const textareaRef = React.useRef(null);
  const unsupportedMessage = 'Voice input is not supported in this browser.';

  const {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    clearError,
  } = useSpeechRecognition({ lang: selectedLang });

  React.useEffect(() => {
    memoryStorage.setItem('pf__prompt', prompt);
  }, [prompt]);

  // Append new transcript to old user prompt gracefully, with exact string typing for XSS protection
  const mergeTranscript = React.useCallback((currentPrompt, transcript) => {
    if (typeof transcript !== 'string') return String(currentPrompt || '');
    const cleanedTranscript = transcript.trim();
    if (!cleanedTranscript) return String(currentPrompt || '');
    
    let base = String(currentPrompt || '');
    if (!base.trim()) return cleanedTranscript;

    const needsSpace = !/\s$/.test(base);
    return `${base}${needsSpace ? ' ' : ''}${cleanedTranscript}`;
  }, []);

  // Show live transcription (raw browser output) visually while recording
  React.useEffect(() => {
    if (isListening || isPolishing) {
      let nextPrompt = basePromptRef.current;
      const combined = [finalTranscript, interimTranscript].filter(Boolean).join(' ');
      if (combined) {
        nextPrompt = mergeTranscript(basePromptRef.current, combined);
      }
      setPrompt(nextPrompt);
    }
  }, [finalTranscript, interimTranscript, isListening, isPolishing, mergeTranscript]);

  const polishText = async (rawText) => {
    const textToClean = String(rawText || '').trim();
    if (!textToClean) return;
    
    setIsPolishing(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_SPEECH_API_KEY;
      if (!apiKey) throw new Error("Missing API Key fallback");

      const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: "You are an expert transcriber and editor. Review the following raw speech-to-text transcript. Identify the native language(s) used. Fix all spelling, grammar, and formatting errors. CRITICAL: Output the final polished text in the EXACT SAME native language and script as the original input. Do NOT translate it to English. If the input is in Tamil, output polished Tamil script. If Hindi, output Hindi script. If it is a mix, format it cleanly in the dominant native script. Return ONLY the final polished text with no conversational filler."
              }]
            },
            contents: [{
              parts: [{ text: textToClean }]
            }]
          }),
        }
      );

      if (!response.ok) throw new Error("AI request failed");

      const data = await response.json();
      const polished = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanPolished = String(polished).trim();

      if (cleanPolished) {
        const finalCombined = mergeTranscript(basePromptRef.current, cleanPolished);
        setPrompt(finalCombined);
        basePromptRef.current = finalCombined;
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      console.warn("Polishing failed, falling back to raw text:", err);
      // Fallback gracefully without dropping dictation
      const finalCombined = mergeTranscript(basePromptRef.current, textToClean);
      setPrompt(finalCombined);
      basePromptRef.current = finalCombined;
    } finally {
      setIsPolishing(false);
    }
  };

  const latestTranscriptsRef = React.useRef({ final: '', interim: '' });
  React.useEffect(() => {
    latestTranscriptsRef.current = { final: finalTranscript, interim: interimTranscript };
  }, [finalTranscript, interimTranscript]);

  // Detect when listening finishes to process the AI transcription polish
  const wasListeningRef = React.useRef(false);
  React.useEffect(() => {
    if (wasListeningRef.current && !isListening) {
      const { final, interim } = latestTranscriptsRef.current;
      const textToPolish = [final, interim].filter(Boolean).join(' ');
      if (textToPolish.trim()) {
        polishText(textToPolish);
      }
    }
    wasListeningRef.current = isListening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  React.useEffect(() => {
    if (isLoading) {
      stopListening();
    }
  }, [isLoading, stopListening]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  const handlePromptChange = (e) => {
    const nextPrompt = String(e.target.value || '');

    if (error) clearError();
    if (isListening) stopListening();

    basePromptRef.current = nextPrompt;
    setPrompt(nextPrompt);
  };

  const handleMicrophoneClick = () => {
    if (isLoading || isPolishing) return;

    if (error) clearError();

    if (isListening) {
      stopListening();
      return;
    }

    textareaRef.current?.blur(); // Preserve blur logic to block mobile keyboard popups
    basePromptRef.current = String(prompt || ''); 
    startListening();
  };

  const voiceFeedback = error || (!isSupported ? unsupportedMessage : '');

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Prompt Optimizer
        </h2>
        <p className="mt-2 text-slate-500">
          Paste your rough prompt and let AI improve it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 pb-2 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100">
          
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            disabled={isLoading || isPolishing}
            placeholder="Example: Input a simple prompt like 'create a website for my portfolio'..."
            className="w-full h-32 p-3 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
          />

          <div className="flex justify-between items-center p-2 border-t border-slate-100 mt-2">
            <div className="flex items-center">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                disabled={isLoading || isListening || isPolishing}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-md px-2 py-1 outline-none hover:border-slate-300 focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              {isListening && (
                <span className="text-xs font-medium text-red-500 animate-pulse">
                  Listening...
                </span>
              )}

              {isPolishing && (
                <span className="text-xs font-medium text-indigo-500 animate-pulse">
                  Polishing text...
                </span>
              )}

              <span className="text-xs text-slate-400 mr-4">
                {prompt.length} characters
              </span>

              <button
                type="button"
                onClick={handleMicrophoneClick}
                disabled={isLoading || !isSupported || isPolishing}
                className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${
                  isListening
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : isPolishing
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600 animate-pulse'
                    : error
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-purple-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Mic size={16} />
              </button>
            </div>
          </div>

          {voiceFeedback && (
            <p className={`px-2 pb-2 mt-2 text-xs ${error ? 'text-amber-600' : 'text-slate-400'}`}>
              {voiceFeedback}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading || isListening || isPolishing}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          <span>{isLoading ? 'Analyzing...' : 'Analyze Prompt'}</span>
        </button>
      </form>
    </div>
  );
}
