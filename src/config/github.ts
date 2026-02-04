// GitHub Configuration for PAT-based authentication
// No OAuth required - users provide their own Personal Access Token

export const STORAGE_KEYS = {
  token: 'gh_token',
  user: 'gh_user',
  gistId: 'gist_id',
  localData: 'goal_tracker_data',
} as const;

// GitHub API endpoints
export const GITHUB_API = {
  user: 'https://api.github.com/user',
  gists: 'https://api.github.com/gists',
} as const;

// Gist file name for data storage
export const GIST_FILENAME = 'goal-tracker-data.json';
