const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// const BASE_URL = 'https://prompt-forge-ai-v9be.onrender.com'; //kishore
// const BASE_URL ='https://prompt-forge-ai-w2pn.onrender.com'; //priya

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Sends prompt to /analyze to get intent and clarification questions.
 * @param {string} prompt - User entered rough prompt.
 */
export const analyzePrompt = async (prompt, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'The selected AI model is unavailable. Please choose another model.');
  }

  const data = await response.json();
  // ADD THIS HERE: notify UI listeners to refresh usage immediately.
  window.dispatchEvent(new Event('usageUpdated'));
  return data;
};

export const optimizePrompt = async (prompt, requirements, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/optimize`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, requirements, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'The selected AI model is unavailable. Please choose another model.');
  }

  const data = await response.json();
  // ADD THIS HERE: notify UI listeners to refresh usage immediately.
  window.dispatchEvent(new Event('usageUpdated'));
  return data;
};

export const scorePrompt = async (prompt, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/score`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'The selected AI model is unavailable. Please choose another model.');
  }

  const data = await response.json();
  // ADD THIS HERE: notify UI listeners to refresh usage immediately.
  window.dispatchEvent(new Event('usageUpdated'));
  return data;
};

export const benchmarkPrompt = async (prompt, requirements, model = 'groq') => {
  const response = await fetch(`${BASE_URL}/benchmark`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, requirements, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Benchmark failed. Please try again.');
  }

  const data = await response.json();
  // ADD THIS HERE: notify UI listeners to refresh usage immediately.
  window.dispatchEvent(new Event('usageUpdated'));
  return data;
};

