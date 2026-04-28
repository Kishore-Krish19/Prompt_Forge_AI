const BASE_URL = 'http://localhost:8000'; // Default, might need adjusting based on environment

export const getAuthToken = async () => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['token'], (result) => {
        resolve(result.token);
      });
    } else {
      // Fallback for local dev without extension environment
      resolve(localStorage.getItem('token'));
    }
  });
};

export const setAuthToken = async (token) => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ token }, () => {
        resolve();
      });
    } else {
      localStorage.setItem('token', token);
      resolve();
    }
  });
};

export const removeAuthToken = async () => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(['token'], () => {
        resolve();
      });
    } else {
      localStorage.removeItem('token');
      resolve();
    }
  });
};

const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  await setAuthToken(data.access_token);
  return data;
};

export const analyzePrompt = async (prompt, model = 'groq') => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to analyze prompt');
  }

  return response.json();
};

export const optimizePrompt = async (prompt, requirements, model = 'groq') => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/optimize`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, requirements, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to optimize prompt');
  }

  return response.json();
};

export const scorePrompt = async (prompt, model = 'groq') => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/score`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to score prompt');
  }

  return response.json();
};
