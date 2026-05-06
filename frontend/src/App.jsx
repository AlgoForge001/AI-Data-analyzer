import React, { useState, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomInputBar from './components/BottomInputBar';
import AnalysisOutput from './components/AnalysisOutput';
import Chat from './components/Chat';
import SearchPage from './components/SearchPage';
import AnalyticsPage from './components/AnalyticsPage';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';
import UserProfilePage from './components/UserProfilePage';
import { Zap, Loader2, AlertCircle, PanelRightOpen, Database, Sparkles, X, ArrowLeft, LayoutDashboard } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "https://javax.onrender.com";
const POLL_INTERVAL_MS = 2000;

const PAGE_TITLES = {
  dashboard: 'Main Dashboard',
  search: 'Search',
  analytics: 'Analytics',
  history: 'History',
  settings: 'Settings',
  profile: 'User Profile',
};

function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [noDataAlert, setNoDataAlert] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentView, setCurrentView] = useState('new'); // 'new' or 'result'
  const [viewingHistoryItem, setViewingHistoryItem] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [activeResultTab, setActiveResultTab] = useState('charts');
  const [selectedAction, setSelectedAction] = useState(null); // 'charts' | 'chat' | null
  // chatInitialQuery: the prompt auto-fired when chat panel first opens (Bug 1)
  const [chatInitialQuery, setChatInitialQuery] = useState(null);
  const fileInputAppRef = useRef(null);
  const fileRef = useRef(null); // Persist file for follow-up chart generation
  const [isResizing, setIsResizing] = useState(false);
  const [splitRatio, setSplitRatio] = useState(() => {
    const saved = localStorage.getItem('dashboardSplitRatio');
    return saved ? parseFloat(saved) : 60;
  });

  const containerRef = useRef(null);

  // Persistence for sidebar collapse
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Persistence for split ratio
  React.useEffect(() => {
    localStorage.setItem('dashboardSplitRatio', splitRatio);
  }, [splitRatio]);

  // Reset selected action when file is removed, persist file ref for follow-ups
  React.useEffect(() => {
    if (file) {
      fileRef.current = file; // Persist for follow-up chart generation
    } else {
      setSelectedAction(null);
    }
  }, [file]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constraints: min 320px for both sides
    const minPercent = (320 / containerRect.width) * 100;
    const maxPercent = 100 - minPercent;

    if (newRatio >= minPercent && newRatio <= maxPercent) {
      setSplitRatio(newRatio);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const taskIdRef = useRef(null);
  const pollingRef = useRef(false);

  // ── helpers ──
  const stopPolling = () => {
    pollingRef.current = false;
  };

  const resetState = () => {
    setLoading(false);
    setIsUploading(false);
    setIsCancelling(false);
    taskIdRef.current = null;
    pollingRef.current = false;
  };

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFileSelect = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setDatasetId(null);        // Clear previous session ID
      setSessionHistory([]);     // Clear previous interactions
      setAnalysisData(null);     // Clear previous data
      setViewingHistoryItem(null);
    }
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  // ── start analysis ──
  const handleAnalyze = useCallback(async () => {
    // If we are in an existing session (datasetId exists) and want to generate more charts
    const isExistingSession = !!datasetId;

    if (!isExistingSession && !file) {
      alert('Please upload a file first!');
      return;
    }
    if (!prompt) {
      alert('Please enter an analysis prompt!');
      return;
    }

    if (taskIdRef.current) {
      await fetch(`${API_URL}/cancel/${taskIdRef.current}`, { method: 'POST' }).catch(() => { });
    }

    stopPolling();
    setIsCancelling(false);
    setLoading(true);
    setIsUploading(!isExistingSession);
    setError(null);
    if (!isExistingSession) {
      setAnalysisData(null);
      setDatasetId(null);
      setSessionHistory([]); // Clear session history for new file upload
    }
    setShowChat(false);
    setActivePage('dashboard');

    try {
      // Always use /start-analysis with FormData (works with deployed backend)
      const activeFile = file || fileRef.current;
      if (!activeFile) {
        setError('No file available. Please upload a dataset first.');
        resetState();
        return;
      }

      const formData = new FormData();
      formData.append('file', activeFile);
      formData.append('query', prompt);
      const startRes = await fetch(`${API_URL}/start-analysis`, {
        method: 'POST',
        body: formData
      });

      if (!startRes.ok) {
        const text = await startRes.text();
        throw new Error(text || `Server error: ${startRes.status}`);
      }

      const { task_id, dataset_id: returnedDatasetId } = await startRes.json();
      taskIdRef.current = task_id;
      setIsUploading(false);
      pollingRef.current = true;

      while (pollingRef.current) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        if (!pollingRef.current) break;

        const statusRes = await fetch(`${API_URL}/status/${task_id}`);
        if (!statusRes.ok) throw new Error(`Status check failed: ${statusRes.status}`);

        const result = await statusRes.json();
        if (result.status === 'completed') {
          setAnalysisData(result.data);
          setSessionHistory(prev => {
            const newEntry = { query: prompt, data: result.data, timestamp: new Date().toISOString() };
            return [...prev, newEntry];
          });
          setDatasetId(result.dataset_id);
          setCurrentView('result');
          setViewingHistoryItem(null);
          if (selectedAction === 'chat') {
            // Bug 1 fix: pass the typed prompt as initialQuery so it's
            // auto-fired in the Chat panel — user won't need to retype.
            setChatInitialQuery(prompt);
            setShowChat(true);
          } else {
            setChatInitialQuery(null);
            setShowChat(false);
          }
          setPrompt(''); // Clear the prompt for the next interaction
          break;
        }
        if (result.status === 'cancelled') break;
        if (result.status === 'error') throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message || 'Failed to connect to the analysis engine');
    } finally {
      resetState();
      fetchHistory();
    }
  }, [file, prompt, selectedAction, fetchHistory, datasetId]);

  // ── cancel ──
  const handleCancel = useCallback(() => {
    const taskId = taskIdRef.current;
    if (!taskId) return;
    setIsCancelling(true);
    stopPolling();
    fetch(`${API_URL}/cancel/${taskId}`, { method: 'POST' }).catch(() => { });
  }, []);

  // ── follow-up chart generation (inline prompt inside AnalysisOutput) ──
  const handleChartFollowUp = useCallback(async (followUpPrompt) => {
    if (!followUpPrompt) return;

    let activeFile = fileRef.current;

    // If no file in memory, try to download it from the backend (GridFS)
    if (!activeFile && datasetId) {
      try {
        const fileRes = await fetch(`${API_URL}/get-file/${datasetId}`);
        if (fileRes.ok) {
          const blob = await fileRes.blob();
          const disposition = fileRes.headers.get('Content-Disposition') || '';
          const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
          let filename = filenameMatch ? filenameMatch[1] : null;

          if (!filename) {
            if (viewingHistoryItem && viewingHistoryItem.filename) {
              filename = viewingHistoryItem.filename;
            } else if (blob.type.includes('spreadsheetml') || blob.type.includes('excel')) {
              filename = 'data.xlsx';
            } else {
              filename = 'data.csv';
            }
          }

          activeFile = new File([blob], filename, { type: blob.type });
          fileRef.current = activeFile; // Cache for future follow-ups
        }
      } catch (e) {
        console.warn('[handleChartFollowUp] Could not download file from backend:', e);
      }
    }

    if (!activeFile) {
      console.error('[handleChartFollowUp] No file available');
      setError('Cannot generate charts: No file available. Please start a new analysis with a file upload.');
      return;
    }

    if (taskIdRef.current) {
      await fetch(`${API_URL}/cancel/${taskIdRef.current}`, { method: 'POST' }).catch(() => { });
    }

    stopPolling();
    setLoading(true);
    setError(null);

    // Optimistically append a pending entry so existing charts stay mounted
    const pendingEntry = { query: followUpPrompt, data: null, timestamp: new Date().toISOString(), _pending: true };
    setSessionHistory(prev => [...prev, pendingEntry]);

    try {
      // Use the standard /start-analysis endpoint with file
      const formData = new FormData();
      formData.append('file', activeFile);
      formData.append('query', followUpPrompt);
      if (datasetId) {
        formData.append('dataset_id', datasetId);
      }

      const startRes = await fetch(`${API_URL}/start-analysis`, {
        method: 'POST',
        body: formData
      });

      if (!startRes.ok) {
        const text = await startRes.text();
        throw new Error(text || `Server error: ${startRes.status}`);
      }

      const { task_id } = await startRes.json();
      taskIdRef.current = task_id;
      pollingRef.current = true;

      while (pollingRef.current) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        if (!pollingRef.current) break;

        const statusRes = await fetch(`${API_URL}/status/${task_id}`);
        if (!statusRes.ok) throw new Error(`Status check failed: ${statusRes.status}`);

        const result = await statusRes.json();
        if (result.status === 'completed') {
          setAnalysisData(result.data);
          // Replace only the pending entry, keep all previous items intact
          setSessionHistory(prev => {
            const withoutPending = prev.filter(e => !e._pending);
            const newEntry = { query: followUpPrompt, data: result.data, timestamp: new Date().toISOString() };
            return [...withoutPending, newEntry];
          });
          setPrompt('');
          break;
        }
        if (result.status === 'cancelled') {
          setSessionHistory(prev => prev.filter(e => !e._pending));
          break;
        }
        if (result.status === 'error') {
          setSessionHistory(prev => prev.filter(e => !e._pending));
          throw new Error(result.error || 'Analysis failed');
        }
      }
    } catch (err) {
      console.error('[handleChartFollowUp] Error:', err);
      setError(err.message || 'Failed to connect to the analysis engine');
      setSessionHistory(prev => prev.filter(e => !e._pending));
    } finally {
      resetState();
      fetchHistory();
    }
  }, [fetchHistory, datasetId, viewingHistoryItem]);

  const handleLoadHistoryItem = useCallback(async (taskId, mode = null) => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);
    setDatasetId(null);
    setShowChat(false);
    stopPolling();
    setActivePage('dashboard');

    try {
      const res = await fetch(`${API_URL}/history/${taskId}`);
      if (!res.ok) throw new Error('Failed to load history item');
      const item = await res.json();

      if (item.status === 'completed' && item.data) {
        setAnalysisData(item.data);
        setSessionHistory(item.interactions || []);
        setDatasetId(item.dataset_id);
        setViewingHistoryItem({ filename: item.filename, query: item.query });
        setCurrentView('result');
        setPrompt('');

        // Use requested mode or default to charts
        if (mode === 'chat') {
          setSelectedAction('chat');
          setShowChat(true);
        } else {
          setSelectedAction('charts');
          setShowChat(mode === 'charts' ? false : showChat);
        }
      } else if (item.status === 'error') {
        setError(item.error || 'This analysis failed previously');
      } else {
        setError('Analysis is still running or was cancelled');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteHistoryItem = useCallback(async (taskId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;

    try {
      const res = await fetch(`${API_URL}/history/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.task_id !== taskId));
        fetchHistory();
      } else {
        console.error('Failed to delete history item');
      }
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  }, [fetchHistory]);

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setPrompt('');
    setFile(null);
    setDatasetId(null);        // ← critical: clear session so cards re-lock
    setSessionHistory([]);     // Clear interactions
    setCurrentView('new');
    setViewingHistoryItem(null);
    setShowChat(false);
    setActivePage('dashboard');
    setActiveResultTab('charts');
    setSelectedAction(null);
    setChatInitialQuery(null);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    if (page !== 'dashboard') {
      setShowChat(false);
    }
  };

  const pageTitle = PAGE_TITLES[activePage] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-anthropic-parchment text-anthropic-near-black">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        history={history}
        onHistoryItemClick={handleLoadHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onNewAnalysis={handleNewAnalysis}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[56px]' : 'lg:ml-[220px]'}`}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        {activePage !== 'dashboard' && (
          <div className="flex-1 overflow-y-auto">
            {activePage === 'search' && (
              <SearchPage history={history} onHistoryItemClick={handleLoadHistoryItem} />
            )}
            {activePage === 'analytics' && (
              <AnalyticsPage history={history} />
            )}
            {activePage === 'history' && (
              <HistoryPage
                history={history}
                onHistoryItemClick={handleLoadHistoryItem}
                onDeleteHistoryItem={handleDeleteHistoryItem}
              />
            )}
            {activePage === 'settings' && <SettingsPage />}
            {activePage === 'profile' && <UserProfilePage />}
          </div>
        )}

        {/* Dashboard */}
        {activePage === 'dashboard' && (
          <main className="flex-1 flex flex-col min-h-0 bg-white">
            <div className="flex-1 flex flex-col min-h-0">
              {/* Main Workspace Area */}
              <div
                ref={containerRef}
                className={`flex-1 flex min-h-0 ${isResizing ? '' : 'transition-all duration-500 ease-in-out'} ${currentView === 'result' ? 'gap-0' : 'gap-0'}`}
              >

                {/* Left Side: Welcome or Results */}
                <div
                  className={`flex-col overflow-hidden ${isResizing ? '' : 'transition-all duration-500 ease-in-out'} ${currentView === 'result' && selectedAction === 'chat' ? 'hidden' : showChat && currentView === 'result' ? 'hidden lg:flex' : 'flex'} w-full lg:w-[var(--split-width)]`}
                  style={{ '--split-width': currentView === 'result' && showChat ? `${splitRatio}%` : '100%' }}
                >

                  {/* Initial Welcome State */}
                  {currentView === 'new' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center animate-fade-in">
                      {/* Inject animations once */}
                      <style>{`
                        /* ── Animated grain texture on locked cards ───────────── */
                        @keyframes grain {
                          0%   { transform: translate(0,    0)   scale(1.5); }
                          10%  { transform: translate(-2%, -3%)  scale(1.5); }
                          20%  { transform: translate(3%,   1%)  scale(1.5); }
                          30%  { transform: translate(-1%,  3%)  scale(1.5); }
                          40%  { transform: translate(2%,  -2%)  scale(1.5); }
                          50%  { transform: translate(-3%,  1%)  scale(1.5); }
                          60%  { transform: translate(1%,   3%)  scale(1.5); }
                          70%  { transform: translate(-2%, -1%)  scale(1.5); }
                          80%  { transform: translate(3%,   2%)  scale(1.5); }
                          90%  { transform: translate(-1%, -3%)  scale(1.5); }
                          100% { transform: translate(0,    0)   scale(1.5); }
                        }

                        /* Grain pseudo-element — warm beige noise, very subtle */
                        .action-card { position: relative; overflow: hidden; }
                        .action-card.card-locked::before {
                          content: '';
                          position: absolute;
                          inset: -25%;
                          width: 150%; height: 150%;
                          z-index: 1;
                          pointer-events: none;
                          opacity: 0.055;
                          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0.72 0 0.9 0 0 0.55 0 0 0.8 0 0.38 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
                          background-repeat: repeat;
                          background-size: 200px 200px;
                          animation: grain 0.45s steps(1) infinite;
                          transition: opacity 0.3s ease;
                        }
                        .action-card.card-locked:hover::before { opacity: 0.09; }

                        /* Card content layers */
                        .action-card .card-content {
                          position: relative; z-index: 2;
                          transition: opacity 0.3s ease, transform 0.3s ease;
                        }
                        .action-card .card-hover-msg {
                          position: absolute; inset: 0; z-index: 3;
                          display: flex; align-items: center; justify-content: center;
                          opacity: 0; transform: translateY(6px);
                          transition: opacity 0.3s ease, transform 0.3s ease;
                          pointer-events: none;
                        }

                        /* Crossfade on hover when locked */
                        .action-card.card-locked:hover .card-content,
                        .action-card.card-locked:focus .card-content {
                          opacity: 0; transform: translateY(-6px);
                        }
                        .action-card.card-locked:hover .card-hover-msg,
                        .action-card.card-locked:focus .card-hover-msg {
                          opacity: 1; transform: translateY(0);
                        }
                        .action-card.card-locked:hover {
                          border-color: rgba(184,92,69,0.3) !important;
                          box-shadow: 0 0 0 2px rgba(184,92,69,0.08);
                        }
                      `}</style>

                      <h1 className="text-[2rem] md:text-[2.5rem] font-serif text-anthropic-near-black mb-4 tracking-tight">
                        How can I help with your data?
                      </h1>
                      <p className="text-anthropic-stone-gray max-w-md text-sm md:text-body-std leading-relaxed">
                        Upload a dataset and describe the analysis you need. I'll generate insights, visualizations, and a summary for you.
                      </p>

                      <div className="mt-8 md:mt-12 flex flex-col items-center gap-6 max-w-2xl w-full">

                        {/* Upload Data Button */}
                        <button
                          onClick={() => fileInputAppRef.current?.click()}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm max-w-full ${file
                            ? 'bg-anthropic-warm-sand border border-anthropic-terracotta/30 text-anthropic-near-black hover:bg-anthropic-warm-sand/70'
                            : 'bg-anthropic-near-black text-white hover:scale-105 active:scale-95'
                            }`}
                        >
                          <Database size={16} className={`shrink-0 ${file ? 'text-anthropic-terracotta' : 'text-white'}`} />
                          <span className="text-[13px] font-medium truncate">
                            {file ? file.name : 'Upload Data'}
                          </span>
                        </button>

                        {/* Actions (Hidden once an action is selected) */}
                        {!selectedAction && (
                          <>
                            {/* Cards grid */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full transition-all duration-300 animate-fade-in-up">

                              {/* Generate Charts card */}
                              <div
                                className={`action-card ${!file && !datasetId ? 'card-locked' : ''} p-4 sm:p-6 bg-white border rounded-2xl text-left transition-all cursor-pointer group ${selectedAction === 'charts'
                                  ? 'border-anthropic-terracotta shadow-md'
                                  : 'border-anthropic-border-cream hover:border-anthropic-border-warm'
                                  }`}
                                onClick={() => {
                                  if (!file && !datasetId) return;
                                  if (analysisData) {
                                    setCurrentView('result');
                                    setShowChat(false);
                                    setSelectedAction('charts');
                                  } else {
                                    setSelectedAction('charts');
                                  }
                                }}
                              >
                                {/* Normal card content — fades out on hover when locked */}
                                <div className="card-content">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${selectedAction === 'charts' ? 'bg-anthropic-terracotta text-white' : 'bg-anthropic-warm-sand/50 text-anthropic-terracotta'
                                    }`}>
                                    <Zap size={20} />
                                  </div>
                                  <h3 className="font-semibold text-anthropic-near-black mb-1">Generate Charts</h3>
                                  <p className="text-[12px] text-anthropic-stone-gray line-clamp-2">Automatically generate charts and maps to reveal patterns.</p>
                                </div>
                                {/* Hover message — fades in on hover when locked */}
                                {!file && !datasetId && (
                                  <div className="card-hover-msg">
                                    <span className="text-[13px] font-semibold text-[#b85c45] tracking-wide">Upload Data</span>
                                  </div>
                                )}
                              </div>

                              {/* Chat Feature card */}
                              <div
                                className={`action-card ${!file && !datasetId ? 'card-locked' : ''} p-4 sm:p-6 bg-white border rounded-2xl text-left transition-all cursor-pointer group ${selectedAction === 'chat'
                                  ? 'border-anthropic-terracotta shadow-md'
                                  : 'border-anthropic-border-cream hover:border-anthropic-border-warm'
                                  }`}
                                onClick={() => {
                                  if (!file && !datasetId) return;
                                  if (datasetId) {
                                    setChatInitialQuery(null);
                                    setShowChat(true);
                                    setCurrentView('result');
                                    setSelectedAction('chat');
                                  } else {
                                    setSelectedAction('chat');
                                  }
                                }}
                              >
                                {/* Normal card content — fades out on hover when locked */}
                                <div className="card-content">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${selectedAction === 'chat' ? 'bg-anthropic-terracotta text-white' : 'bg-anthropic-warm-sand/50 text-anthropic-terracotta'
                                    }`}>
                                    <Sparkles size={20} />
                                  </div>
                                  <h3 className="font-semibold text-anthropic-near-black mb-1">Chat Feature</h3>
                                  <p className="text-[12px] text-anthropic-stone-gray line-clamp-2">Interact with AI to analyze your data.</p>
                                </div>
                                {/* Hover message — fades in on hover when locked */}
                                {!file && !datasetId && (
                                  <div className="card-hover-msg">
                                    <span className="text-[13px] font-semibold text-[#b85c45] tracking-wide">Upload Data</span>
                                  </div>
                                )}
                              </div>
                            </div>


                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Results View */}
                  {currentView === 'result' && (
                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                      {/* Analysis Header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-anthropic-border-cream bg-white/50 backdrop-blur-sm shrink-0 min-h-[72px]">
                        {/* Left Side: Title & Filename */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                          <h2 className="text-feature !text-[1rem] font-serif line-clamp-1 md:truncate min-w-0 flex-1">
                            {viewingHistoryItem?.query || (sessionHistory.length > 0 ? sessionHistory[0].query : prompt) || 'Analysis Session'}
                          </h2>
                          <div className="flex items-center gap-2 text-anthropic-stone-gray text-[10px] uppercase tracking-wider shrink-0 hidden lg:flex">
                            <span className="px-1.5 py-0.5 bg-anthropic-warm-sand/30 rounded border border-anthropic-border-cream truncate max-w-[120px]">
                              {viewingHistoryItem?.filename || file?.name}
                            </span>
                          </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Switch between Charts ↔ Chat */}
                          {analysisData && selectedAction === 'chat' && (
                            <button
                              onClick={() => {
                                setShowChat(false);
                                setSelectedAction('charts');
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-anthropic-warm-sand text-anthropic-near-black border border-anthropic-border-warm rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-anthropic-warm-sand/50 transition-all shadow-sm shrink-0"
                            >
                              <Zap size={14} className="text-anthropic-terracotta shrink-0" />
                              <span className="whitespace-nowrap">View Charts</span>
                            </button>
                          )}

                          {!showChat && analysisData && selectedAction === 'charts' && (
                            <button
                              onClick={() => setShowChat(true)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-anthropic-warm-sand text-anthropic-near-black border border-anthropic-border-warm rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-anthropic-warm-sand/50 transition-all shadow-sm shrink-0"
                            >
                              <Sparkles size={14} className="text-anthropic-terracotta shrink-0" />
                              <span className="whitespace-nowrap">Open Assistant</span>
                            </button>
                          )}

                          {analysisData && selectedAction === 'charts' && (
                            <button
                              onClick={() => {
                                if (showChat) {
                                  setSelectedAction('chat');
                                } else {
                                  handleNewAnalysis();
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-anthropic-warm-sand text-anthropic-near-black border border-anthropic-border-warm rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-anthropic-warm-sand/50 transition-all shadow-sm shrink-0"
                            >
                              <X size={14} className="text-anthropic-terracotta shrink-0" />
                              <span className="whitespace-nowrap">Close chart</span>
                            </button>
                          )}

                          {/* Result Tabs */}
                          {analysisData && selectedAction !== 'chat' && (
                            <div className="flex items-center gap-1 bg-white/80 rounded-lg p-0.5 border border-anthropic-border-cream shrink-0">
                              {['charts', 'raw'].map(tab => (
                                <button
                                  key={tab}
                                  onClick={() => setActiveResultTab(tab)}
                                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-tight transition-all ${activeResultTab === tab ? 'bg-anthropic-near-black text-white shadow-sm' : 'text-anthropic-stone-gray hover:text-anthropic-near-black'}`}
                                >
                                  {tab === 'charts' ? 'Charts' : 'Data'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden relative">
                        <AnalysisOutput
                          data={analysisData}
                          history={sessionHistory}
                          loading={loading}
                          activeTab={activeResultTab}
                          onSubmitPrompt={selectedAction === 'charts' ? handleChartFollowUp : undefined}
                          isGenerating={loading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Draggable Divider */}
                {showChat && currentView === 'result' && !loading && selectedAction !== 'chat' && (
                  <div
                    onMouseDown={handleMouseDown}
                    className={`hidden lg:flex w-1 hover:w-1.5 bg-anthropic-border-cream hover:bg-anthropic-terracotta/40 transition-all cursor-col-resize items-center justify-center relative group z-10 ${isResizing ? 'bg-anthropic-terracotta/40 w-1.5' : ''}`}
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center gap-0.5 px-1 py-4 bg-white border border-anthropic-border-cream shadow-sm transition-all ${isResizing ? 'scale-110 shadow-md border-anthropic-terracotta/30' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="flex flex-col gap-1">
                        <div className="w-0.5 h-0.5 rounded-full bg-anthropic-stone-gray" />
                        <div className="w-0.5 h-0.5 rounded-full bg-anthropic-stone-gray" />
                        <div className="w-0.5 h-0.5 rounded-full bg-anthropic-stone-gray" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="w-0.5 h-0.5 rounded-full bg-anthropic-stone-gray" />
                        <div className="w-0.5 h-0.5 rounded-full bg-anthropic-stone-gray" />
                        <div className="w-0.5 h-0.5 rounded-full bg-anthropic-stone-gray" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Side: Chat Column */}
                {showChat && currentView === 'result' && !loading && (
                  <div
                    className={`bg-anthropic-ivory/50 flex flex-col animate-fade-in min-h-0 overflow-hidden w-full lg:w-[var(--chat-width)]`}
                    style={{ '--chat-width': selectedAction === 'chat' ? '100%' : `${100 - splitRatio}%` }}
                  >
                    <Chat
                      key={datasetId}
                      datasetId={datasetId}
                      onClose={() => {
                        setShowChat(false);
                        setSelectedAction('charts');
                      }}
                      // Bug 1 fix: auto-fire the typed prompt as first message
                      initialQuery={chatInitialQuery}
                      onInitialQueryFired={() => setChatInitialQuery(null)}
                      initialSummary={
                        !chatInitialQuery && analysisData
                          ? "I've analysed your dataset. Here's what I found — feel free to ask follow-up questions!"
                          : null
                      }
                      onShowCharts={selectedAction === 'chat' ? () => {
                        setSelectedAction('charts');
                        setShowChat(true);
                      } : null}
                    />
                  </div>
                )}
              </div>

              {/* Error Popup */}
              {error && (
                <div className="mx-auto max-w-2xl mb-4 p-4 bg-anthropic-error/10 border border-anthropic-error/20 rounded-2xl flex items-center gap-3 text-anthropic-error animate-fade-in shadow-whisper">
                  <AlertCircle size={20} />
                  <p className="font-medium text-[13px]">{error}</p>
                  <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-anthropic-error/10 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Hidden File Input for "Upload Data" Card */}
              <input
                type="file"
                ref={fileInputAppRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".csv,.xlsx,.json"
              />

              {/* Universal Bottom Input Bar — ONLY on dashboard welcome (not during active session) */}
              {currentView !== 'result' && selectedAction !== null && (
                <div className="block animate-fade-in-up bg-anthropic-ivory/50">

                  {/* ── Mode Toggle Tabs ── */}
                  {!loading && currentView !== 'result' && (
                    <div className="flex justify-center mb-2 px-4 animate-fade-in">
                      <div className="inline-flex items-center gap-1 bg-white border border-anthropic-border-cream rounded-2xl p-1 shadow-sm">
                        {/* Generate Charts tab */}
                        <button
                          onClick={() => setSelectedAction('charts')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${selectedAction === 'charts'
                            ? 'bg-anthropic-near-black text-white shadow-sm'
                            : 'text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/40'
                            }`}
                        >
                          <Zap size={13} className={selectedAction === 'charts' ? 'text-white' : 'text-anthropic-terracotta'} />
                          Generate Charts
                        </button>

                        {/* Chat Feature tab */}
                        <button
                          onClick={() => setSelectedAction('chat')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 ${selectedAction === 'chat'
                            ? 'bg-anthropic-near-black text-white shadow-sm'
                            : 'text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/40'
                            }`}
                        >
                          <Sparkles size={13} className={selectedAction === 'chat' ? 'text-white' : 'text-anthropic-terracotta'} />
                          Chat Feature
                        </button>
                      </div>
                    </div>
                  )}

                  <BottomInputBar
                    file={file}
                    setFile={setFile}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onExecute={handleAnalyze}
                    loading={loading}
                    isUploading={isUploading}
                    onCancel={handleCancel}
                    isCancelling={isCancelling}
                    placeholder={
                      selectedAction === 'chat'
                        ? "Enter prompt to chat with AI..."
                        : "Enter prompt to generate additional charts..."
                    }
                  />

                  <div className="h-12" />
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
