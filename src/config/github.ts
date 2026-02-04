// GitHub OAuth Configuration
// For GitHub Pages deployment, we use GitHub OAuth App

// TODO: Replace with your GitHub OAuth App credentials
// Create one at: https://github.com/settings/developers
export const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID',
  // For GitHub Pages, we use a serverless function or Cloudflare Worker for token exchange
  // This avoids exposing client secret in frontend
  tokenProxyUrl: import.meta.env.VITE_TOKEN_PROXY_URL || '',
  gistId: import.meta.env.VITE_GIST_ID || '', // Will be created on first save
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}callback`
    : '',
};

// Scopes needed: gist (to save data), user:email (for login)
export const GITHUB_SCOPES = ['gist', 'read:user'];

export const STORAGE_KEYS = {
  token: 'gh_token',
  user: 'gh_user',
  gistId: 'gist_id',
  localData: 'habit_tracker_local',
};
