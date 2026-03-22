const BASE_URL = 'http://localhost:8000';
// const BASE_URL = 'https://prompt-forge-ai-v9be.onrender.com';


/**
 * Sends prompt to /analyze to get intent and clarification questions.
 * @param {string} prompt - User entered rough prompt.
 */
export const analyzePrompt = async (prompt, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'The selected AI model is unavailable. Please choose another model.');
  }

  return response.json();
};

export const optimizePrompt = async (prompt, requirements, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, requirements, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'The selected AI model is unavailable. Please choose another model.');
  }

  return response.json();
};

export const scorePrompt = async (prompt, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'The selected AI model is unavailable. Please choose another model.');
  }

  return response.json();
};

export const benchmarkPrompt = async (prompt, requirements, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/benchmark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, requirements, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Benchmark failed. Please try again.');
  }

  return response.json();
};

