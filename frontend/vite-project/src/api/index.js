import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  signup: (userData) => api.post('/users/signup', userData),
  getMe: () => api.get('/users/me'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// User API
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  deleteAccount: () => api.delete('/users/account'),
  followUser: (username) => api.post(`/users/${username}/follow`),
  unfollowUser: (username) => api.delete(`/users/${username}/follow`),
  getFollowers: (username) => api.get(`/users/${username}/followers`),
  getFollowing: (username) => api.get(`/users/${username}/following`),
  getActivity: (username) => api.get(`/users/${username}/activity`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
};

// Repository API
export const repoAPI = {
  list: (username) => api.get(`/repos/${username}`),
  create: (data) => api.post('/repos', data),
  get: (owner, name) => api.get(`/repos/${owner}/${name}`),
  update: (owner, name, data) => api.put(`/repos/${owner}/${name}`, data),
  delete: (owner, name) => api.delete(`/repos/${owner}/${name}`),
  star: (owner, name) => api.post(`/repos/${owner}/${name}/star`),
  unstar: (owner, name) => api.delete(`/repos/${owner}/${name}/star`),
  fork: (owner, name) => api.post(`/repos/${owner}/${name}/fork`),
  getStargazers: (owner, name) => api.get(`/repos/${owner}/${name}/stargazers`),
  getForks: (owner, name) => api.get(`/repos/${owner}/${name}/forks`),
  getContributors: (owner, name) => api.get(`/repos/${owner}/${name}/contributors`),
  search: (query) => api.get(`/repos/search?q=${query}`),
  trending: () => api.get('/repos/trending'),
  init: (data) => api.post('/init', data),
  add: (data) => api.post('/add', data),
  commit: (data) => api.post('/commit', data),
  push: (data) => api.post('/push', data),
  pull: (data) => api.post('/pull', data),
  revert: (data) => api.post('/revert', data),
  getFiles: (owner, name, path = '') => api.get(`/repos/${owner}/${name}/files?path=${path}`),
  getFileContent: (owner, name, path) => api.get(`/repos/${owner}/${name}/content?path=${path}`),
  getCommits: (owner, name) => api.get(`/repos/${owner}/${name}/commits`),
  getCommit: (owner, name, sha) => api.get(`/repos/${owner}/${name}/commits/${sha}`),
};

// Issue API
export const issueAPI = {
  list: (owner, repo) => api.get(`/issues/${owner}/${repo}`),
  create: (owner, repo, data) => api.post(`/issues/${owner}/${repo}`, data),
  get: (owner, repo, number) => api.get(`/issues/${owner}/${repo}/${number}`),
  update: (owner, repo, number, data) => api.put(`/issues/${owner}/${repo}/${number}`, data),
  close: (owner, repo, number) => api.put(`/issues/${owner}/${repo}/${number}/close`),
  reopen: (owner, repo, number) => api.put(`/issues/${owner}/${repo}/${number}/reopen`),
  addComment: (owner, repo, number, comment) => api.post(`/issues/${owner}/${repo}/${number}/comments`, { comment }),
  getComments: (owner, repo, number) => api.get(`/issues/${owner}/${repo}/${number}/comments`),
  addLabel: (owner, repo, number, label) => api.post(`/issues/${owner}/${repo}/${number}/labels`, { label }),
  removeLabel: (owner, repo, number, label) => api.delete(`/issues/${owner}/${repo}/${number}/labels/${label}`),
};

// Pipelines API (CI/CD)
export const pipelinesAPI = {
  getPipelines: (owner, repo) => api.get(`/pipelines?owner=${owner}&repo=${repo}`),
  triggerPipeline: (data) => api.post('/pipelines/trigger', data),
};

// Pull Requests API
export const prAPI = {
  getPullRequests: (owner, repo) => api.get(`/pulls?owner=${owner}&repo=${repo}`),
  createPullRequest: (data) => api.post('/pulls', data),
  mergePullRequest: (id) => api.post(`/pulls/${id}/merge`),
};

// Security API
export const securityAPI = {
  getAlerts: (owner, repo) => api.get(`/security?owner=${owner}&repo=${repo}`),
  runScan: (data) => api.post('/security/scan', data),
};

// Releases API
export const releasesAPI = {
  getReleases: (owner, repo) => api.get(`/releases?owner=${owner}&repo=${repo}`),
  createRelease: (data) => api.post('/releases', data),
};

export default api;
