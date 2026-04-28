import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import Login from './components/Login';
import PromptInput from './components/PromptInput';
import QuestionPanel from './components/QuestionPanel';
import PromptComparison from './components/PromptComparison';
import PromptScoreCard from './components/PromptScoreCard';
import ProfileMenu from './components/ProfileMenu';
import { analyzePrompt, getAuthToken, optimizePrompt, removeAuthToken, scorePrompt } from './services/api';

const PopupApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('input');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('groq');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [promptScore, setPromptScore] = useState(0);
  const [promptAnalysis, setPromptAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getAuthToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await removeAuthToken();
    setIsAuthenticated(false);
    resetFlow();
  };

  const resetFlow = () => {
    setCurrentStep('input');
    setPrompt('');
    setSelectedModel('groq');
    setQuestions([]);
    setAnswers({});
    setOptimizedPrompt('');
    setPromptScore(0);
    setPromptAnalysis(null);
    setCopied(false);
    setError('');
    setIsWorking(false);
  };

  const handleAnalyze = async (roughPrompt, model) => {
    setIsWorking(true);
    setError('');
    setPrompt(roughPrompt);
    setSelectedModel(model);

    try {
      const data = await analyzePrompt(roughPrompt, model);
      setQuestions(data.questions || []);
      setAnswers({});
      setCurrentStep('questions');
    } catch (err) {
      setError(err.message || 'Failed to analyze prompt');
    } finally {
      setIsWorking(false);
    }
  };

  const handleAnswerChange = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleGenerate = async () => {
    setIsWorking(true);
    setError('');
    setCopied(false);

    try {
      const [optimizeData, scoreData] = await Promise.all([
        optimizePrompt(prompt, answers, selectedModel),
        scorePrompt(prompt, selectedModel),
      ]);

      setOptimizedPrompt(optimizeData.optimized_prompt || '');
      setPromptScore(scoreData.score || 0);
      setPromptAnalysis(scoreData.analysis || null);
      setCurrentStep('results');
    } catch (err) {
      setError(err.message || 'Failed to generate optimized prompt');
    } finally {
      setIsWorking(false);
    }
  };

  const handleCopy = async () => {
    if (!optimizedPrompt) {
      return;
    }

    await navigator.clipboard.writeText(optimizedPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] w-full bg-[#0b0f19]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative min-h-[500px] w-full bg-[#0b0f19] flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Prompt Optimizer</h1>
          <p className="text-xs text-gray-400">Refine prompts in three steps.</p>
        </div>

        <ProfileMenu onLogout={handleLogout} />
      </div>

      <div className="flex-1">
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {currentStep === 'input' && (
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onSubmit={handleAnalyze}
            isLoading={isWorking}
          />
        )}

        {currentStep === 'questions' && (
          <div className="flex h-full flex-col bg-[#0b0f19]">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-lg font-semibold text-white">Question Panel</h2>
              <div className="mt-3 rounded-lg border border-gray-800 bg-[#111827] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Your Prompt</p>
                <p className="mt-1 line-clamp-3 text-sm text-gray-200">{prompt}</p>
              </div>
            </div>

            <QuestionPanel
              questions={questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleGenerate}
              isLoading={isWorking}
            />
          </div>
        )}

        {currentStep === 'results' && (
          <div className="flex h-full flex-col gap-3 bg-[#0b0f19] p-4 text-gray-200">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">Optimization Complete</h2>
              <p className="mt-1 text-xs text-gray-400">Your optimized prompt and quality score are ready.</p>
            </div>

            <PromptComparison
              originalPrompt={prompt}
              optimizedPrompt={optimizedPrompt}
              copied={copied}
              onCopy={handleCopy}
              onStartOver={resetFlow}
            />

            <PromptScoreCard score={promptScore} analysis={promptAnalysis} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupApp;
