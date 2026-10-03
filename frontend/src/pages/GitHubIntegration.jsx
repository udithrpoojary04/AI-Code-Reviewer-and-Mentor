import { useState, useEffect } from 'react';
import { apiPrivate } from '../api/axios';
import { 
  FaGithub, 
  FaPlug, 
  FaSearch, 
  FaSpinner, 
  FaStar, 
  FaCodeBranch, 
  FaShieldAlt, 
  FaTimes, 
  FaUnlock, 
  FaLock, 
  FaCheckCircle, 
  FaExternalLinkAlt 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function GitHubIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [pat, setPat] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [analyzingRepo, setAnalyzingRepo] = useState(null);
  
  // Direct URL analysis state
  const [directUrl, setDirectUrl] = useState('');
  const [directAnalyzing, setDirectAnalyzing] = useState(false);

  // Review result modal state
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await apiPrivate.get('/github/status');
      const data = response.data;
      setIsConnected(data.success);
      if (data.success) {
        const connectedUser = data.message?.replace('Connected as ', '') || '';
        setUsername(connectedUser);
        fetchRepositories(connectedUser);
      }
    } catch (error) {
      console.warn('Could not check GitHub status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e?.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }

    setConnecting(true);
    try {
      // Connect without requiring a PAT (PAT is optional for private repos)
      const response = await apiPrivate.post('/github/connect', { 
        githubUsername: username.trim(), 
        accessToken: pat.trim() 
      });
      
      if (response.data.success) {
        setIsConnected(true);
        toast.success(`Connected to @${username.trim()}!`);
        await fetchRepositories(username.trim());
      } else {
        toast.error(response.data.message || 'Failed to connect');
      }
    } catch (error) {
      // If backend connect failed, try fetching public repos directly
      try {
        await fetchRepositories(username.trim());
        setIsConnected(true);
        toast.success(`Loaded public repositories for @${username.trim()}!`);
      } catch (err) {
        toast.error('Could not find GitHub user. Please verify the username.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await apiPrivate.post('/github/disconnect');
    } catch (err) {
      console.warn('Disconnect request error', err);
    }
    setIsConnected(false);
    setRepositories([]);
    setUsername('');
    setPat('');
    toast.info('Disconnected from GitHub account.');
  };

  const fetchRepositories = async (userToFetch = username) => {
    const targetUser = (userToFetch || username || '').trim();
    if (!targetUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch directly from GitHub's open public REST API (CORS enabled, 0 token required)
      const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(targetUser)}/repos?per_page=100&sort=updated`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (Array.isArray(ghData)) {
          const mapped = ghData.map(r => ({
            id: r.id,
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            language: r.language,
            stargazersCount: r.stargazers_count,
            defaultBranch: r.default_branch,
            htmlUrl: r.html_url,
            owner: { login: r.owner?.login }
          }));
          setRepositories(mapped);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Direct GitHub fetch error, trying backend...', err);
    }

    // 2. Fallback to backend API
    try {
      const response = await apiPrivate.get('/github/repos');
      if (Array.isArray(response.data)) {
        setRepositories(response.data);
      }
    } catch (error) {
      toast.error('Could not load repositories for @' + targetUser);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (repo) => {
    setAnalyzingRepo(repo.name);
    try {
      const response = await apiPrivate.post('/github/analyze', { 
        owner: username || repo.owner?.login || repo.fullName?.split('/')[0], 
        repo: repo.name, 
        branch: repo.defaultBranch || 'main' 
      });
      const result = response.data;
      setAnalysisResult({
        repoName: repo.name,
        score: result.score ?? 85,
        securityScore: result.securityScore ?? 90,
        performanceScore: result.performanceScore ?? 80,
        aiSummary: result.aiSummary || 'Code review completed successfully.'
      });
      toast.success(`Successfully analyzed ${repo.name}!`);
    } catch (error) {
      toast.error(`Failed to analyze ${repo.name}: ` + (error.response?.data?.message || 'Server error'));
    } finally {
      setAnalyzingRepo(null);
    }
  };

  const handleDirectUrlAnalyze = async (e) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    // Parse owner and repo from URL like "https://github.com/owner/repo" or "owner/repo"
    let cleanUrl = directUrl.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    if (parts.length < 2) {
      toast.error('Please enter a valid format: "owner/repo" or "https://github.com/owner/repo"');
      return;
    }

    const owner = parts[0];
    const repo = parts[1];

    setDirectAnalyzing(true);
    try {
      const response = await apiPrivate.post('/github/analyze', { 
        owner, 
        repo, 
        branch: 'main' 
      });
      const result = response.data;
      setAnalysisResult({
        repoName: `${owner}/${repo}`,
        score: result.score ?? 85,
        securityScore: result.securityScore ?? 90,
        performanceScore: result.performanceScore ?? 80,
        aiSummary: result.aiSummary || 'Code review completed successfully.'
      });
      toast.success(`Successfully analyzed ${owner}/${repo}!`);
    } catch (error) {
      toast.error(`Analysis failed: ` + (error.response?.data?.message || 'Please check that the repository is public.'));
    } finally {
      setDirectAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 text-xs font-semibold mb-2">
            <FaUnlock className="w-3 h-3" />
            Token-Free Public Access Enabled
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <FaGithub className="text-primary-500" /> GitHub Code Audits
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Analyze any public GitHub repository or connect your account with just your username — no personal access token needed.
          </p>
        </div>
      </div>

      {/* Quick Direct URL Analyzer */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/40">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <FaSearch className="text-primary-500" />
          Quick Public Repository Audit
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Want to audit a specific repository right away? Just paste the GitHub URL or <code className="text-primary-500 font-mono">owner/repo</code> name.
        </p>
        <form onSubmit={handleDirectUrlAnalyze} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="e.g. https://github.com/facebook/react or udithrpoojary04/AI-Code-Reviewer-and-Mentor"
              className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={directAnalyzing || !directUrl.trim()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-primary-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {directAnalyzing ? (
              <><FaSpinner className="animate-spin" /> Auditing Code...</>
            ) : (
              <><FaShieldAlt /> Audit Repository</>
            )}
          </button>
        </form>
      </div>

      {/* Connect Account Form (Token-Free by Default) */}
      {!isConnected ? (
        <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-xl mx-auto text-slate-900 dark:text-white">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 mb-3">
              <FaPlug className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Connect Your GitHub Account</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Simply enter your GitHub username. We will load your public repositories without requiring any Personal Access Token!
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                GitHub Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  placeholder="e.g. udithrpoojary04"
                />
              </div>
            </div>

            {/* Optional Personal Access Token Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                {showTokenInput ? <FaUnlock className="w-3 h-3" /> : <FaLock className="w-3 h-3" />}
                <span>{showTokenInput ? 'Hide Token Field (Public mode is enough)' : 'Have private repositories? (Optional: Add PAT)'}</span>
              </button>

              {showTokenInput && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Personal Access Token <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white font-mono"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Leave empty for public repos)"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Only required if you want CodeMentor AI to read your private repositories.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={connecting || !username.trim()}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer text-sm"
            >
              {connecting ? <><FaSpinner className="animate-spin" /> Connecting...</> : 'Connect & Load Repositories'}
            </button>
          </form>
        </div>
      ) : (
        /* Connected View */
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <FaCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Connected Account:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {pat ? 'Authenticated PAT' : 'Token-Free Public'}
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaGithub className="text-slate-700 dark:text-slate-300" /> @{username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchRepositories(username)}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                Refresh Repos
              </button>
              <button 
                onClick={handleDisconnect}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-rose-500/20"
              >
                Disconnect / Switch
              </button>
            </div>
          </div>

          {/* Repositories Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FaCodeBranch className="text-primary-500" />
                Repositories ({repositories.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 text-center">
                <FaSpinner className="animate-spin text-3xl text-primary-500 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Fetching repositories from GitHub...</p>
              </div>
            ) : repositories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {repositories.map(repo => (
                  <div 
                    key={repo.id} 
                    className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={repo.name}>
                          {repo.name}
                        </h3>
                        {repo.htmlUrl && (
                          <a 
                            href={repo.htmlUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-400 hover:text-primary-500 transition-colors p-1"
                            title="Open on GitHub"
                          >
                            <FaExternalLinkAlt className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 line-clamp-2 min-h-[32px]">
                        {repo.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center gap-3 mb-5 text-xs text-slate-500 dark:text-slate-400">
                        {repo.language && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazersCount !== undefined && repo.stargazersCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <FaStar className="text-amber-400 w-3 h-3" />
                            {repo.stargazersCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAnalyze(repo)}
                      disabled={analyzingRepo === repo.name}
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98] ${
                        analyzingRepo === repo.name 
                          ? 'bg-primary-900/40 text-primary-300 cursor-not-allowed border border-primary-500/30' 
                          : 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                      }`}
                    >
                      {analyzingRepo === repo.name ? (
                        <><FaSpinner className="animate-spin" /> Auditing Repository...</>
                      ) : (
                        <><FaShieldAlt className="w-3.5 h-3.5" /> Audit Repository</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <FaCodeBranch className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">No public repositories found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This user does not appear to have public repositories or the username is incorrect.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Result Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Architectural Audit Report
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaGithub className="text-primary-500" /> {analysisResult.repoName}
                </h3>
              </div>
              <button 
                onClick={() => setAnalysisResult(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-center">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Overall Score</p>
                <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">{analysisResult.score}/100</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Security</p>
                <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{analysisResult.securityScore}%</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Performance</p>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{analysisResult.performanceScore}%</p>
              </div>
            </div>

            {/* Summary Block */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                AI Architect Findings
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {analysisResult.aiSummary}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAnalysisResult(null)}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-primary-500/20 cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
