import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { memoryStorage } from '../utils/memoryStore';

export default function PromptInput({ onSubmit, isLoading }) {
  const initialPrompt = memoryStorage.getItem('pf__prompt') || '';
  const [prompt, setPrompt] = React.useState(initialPrompt);

  const committedPromptRef = React.useRef(initialPrompt);
  const textareaRef = React.useRef(null);

  const unsupportedMessage = 'Voice input is not supported in this browser.';

  React.useEffect(() => {
    memoryStorage.setItem('pf__prompt', prompt);
  }, [prompt]);

  const mergeTranscript = React.useCallback((currentPrompt, transcript) => {
    const cleanedTranscript = transcript.trim();

    if (!cleanedTranscript) return currentPrompt;

    if (!currentPrompt.trim()) return cleanedTranscript;

    const needsSpace = !/\s$/.test(currentPrompt);
    return `${currentPrompt}${needsSpace ? ' ' : ''}${cleanedTranscript}`;
  }, []);

  const handleFinalTranscript = React.useCallback(
    (transcript) => {
      const nextPrompt = mergeTranscript(committedPromptRef.current, transcript);
      committedPromptRef.current = nextPrompt;
      setPrompt(nextPrompt);
    },
    [mergeTranscript]
  );

  const {
    isSupported,
    isListening,
    isTranslating,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError,
    discardInterim,
  } = useSpeechRecognition({
    onTranscript: handleFinalTranscript,
    getContextTail: () => committedPromptRef.current,
  });

  React.useEffect(() => {
    const nextPrompt = interimTranscript
      ? mergeTranscript(committedPromptRef.current, interimTranscript)
      : committedPromptRef.current;

    setPrompt((current) => (current === nextPrompt ? current : nextPrompt));
  }, [interimTranscript, mergeTranscript]);

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
    const nextPrompt = e.target.value;

    if (error) clearError();
    if (interimTranscript) discardInterim();

    committedPromptRef.current = nextPrompt;
    setPrompt(nextPrompt);
  };

  const handleMicrophoneClick = () => {
    if (isLoading || isTranslating) return;

    if (error) clearError();

    if (isListening) {
      stopListening();
      return;
    }

    textareaRef.current?.blur();
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
            disabled={isLoading}
            placeholder="Example: Input a simple prompt like 'create a website for my portfolio'..."
            className="w-full h-32 p-3 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
          />

          <div className="flex justify-end p-2 border-t border-slate-100 items-center gap-3">
            
            {isListening && (
              <span className="text-xs font-medium text-red-500 animate-pulse">
                Listening...
              </span>
            )}

            {isTranslating && (
              <span className="text-xs font-medium text-indigo-500 animate-pulse">
                Translating...
              </span>
            )}

            <span className="text-xs text-slate-400 mr-4">
              {prompt.length} characters
            </span>

            <button
              type="button"
              onClick={handleMicrophoneClick}
              disabled={isLoading || !isSupported || isTranslating}
              className={`flex items-center justify-center rounded-lg border p-2 transition-colors ${
                isListening
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : isTranslating
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-600 animate-pulse'
                  : error
                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Mic size={16} />
            </button>
          </div>

          {voiceFeedback && (
            <p className={`px-2 pb-2 text-xs ${error ? 'text-amber-600' : 'text-slate-400'}`}>
              {voiceFeedback}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
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
