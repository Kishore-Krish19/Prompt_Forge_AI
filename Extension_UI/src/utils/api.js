// Prefer an explicit VITE_API_BASE_URL during build/deployment.
// If not provided, fall back to the live Render/production host used by the web app.
// Update the fallback below if your production host differs.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://prompt-forge-ai-v9be.onrender.com';