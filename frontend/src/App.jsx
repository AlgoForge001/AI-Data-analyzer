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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [activeResultTab, setActiveResultTab] = useState('charts');
  const [selectedAction, setSelectedAction] = useState(null); // 'charts' | 'chat' | null
  // chatInitialQuery: the prompt auto-fired when chat panel first opens (Bug 1)
  const [chatInitialQuery, setChatInitialQuery] = useState(null);
  const fileInputAppRef = useRef(null);
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

  // Reset selected action when file is removed
  React.useEffect(() => {
    if (!file) {
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

  // ── start analysis ──
  const handleAnalyze = useCallback(async () => {
    if (!file) {
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
    setIsUploading(true);
    setError(null);
    setAnalysisData(null);
    setDatasetId(null);
    setShowChat(false);
    setActivePage('dashboard');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('query', prompt);

    try {
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
          break;
        }
        if (result.status === 'cancelled') break;
        if (result.status === 'error') throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      if (pollingRef.current) {
        setError(err.message || 'Failed to connect to the analysis engine');
      }
    } finally {
      resetState();
      fetchHistory();
    }
  }, [file, prompt, selectedAction, fetchHistory]);

  // ── cancel ──
  const handleCancel = useCallback(() => {
    const taskId = taskIdRef.current;
    if (!taskId) return;
    setIsCancelling(true);
    stopPolling();
    fetch(`${API_URL}/cancel/${taskId}`, { method: 'POST' }).catch(() => { });
  }, []);

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
        setDatasetId(item.dataset_id);
        setViewingHistoryItem({ filename: item.filename, query: item.query });
        setCurrentView('result');
        setPrompt(item.query || '');

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
                      {/* Logo placeholder - User will provide logo later */}
                      <h1 className="text-[2rem] md:text-[2.5rem] font-serif text-anthropic-near-black mb-4 tracking-tight">
                        How can I help with your data?
                      </h1>
                      <p className="text-anthropic-stone-gray max-w-md text-sm md:text-body-std leading-relaxed">
                        Upload a dataset and describe the analysis you need. I'll generate insights, visualizations, and a summary for you.
                      </p>

                      <div className="mt-8 md:mt-12 flex flex-col items-center gap-6 max-w-2xl w-full">

                        {/* Step 1: Upload Data */}
                        <div
                          className={`w-full max-w-md p-4 flex items-center justify-between rounded-2xl cursor-pointer transition-all ${file ? 'bg-anthropic-warm-sand/50 border border-anthropic-terracotta shadow-sm' : 'bg-anthropic-near-black text-white hover:bg-anthropic-near-black/90 shadow-md'}`}
                          onClick={() => fileInputAppRef.current?.click()}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file ? 'bg-white shadow-sm' : 'bg-white/20'}`}>
                              <Database size={20} className={file ? 'text-anthropic-terracotta' : 'text-white'} />
                            </div>
                            <div className="text-left">
                              <h3 className={`font-semibold text-sm ${file ? 'text-anthropic-near-black' : 'text-white'}`}>
                                {file ? 'Data Uploaded Successfully' : ' Upload Data'}
                              </h3>
                              <p className={`text-[12px] mt-0.5 line-clamp-1 ${file ? 'text-anthropic-stone-gray' : 'text-white/70'}`}>
                                {file ? file.name : 'Select a .csv, .xlsx, or .json file'}
                              </p>
                            </div>
                          </div>
                          {!file && (
                            <div className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-[12px] font-medium text-white shrink-0">
                              Browse Files
                            </div>
                          )}
                          {file && (
                            <div className="px-4 py-2 bg-white hover:bg-anthropic-warm-sand transition-colors rounded-lg text-[12px] font-medium text-anthropic-terracotta border border-anthropic-border-warm shrink-0">
                              Change File
                            </div>
                          )}
                        </div>

                        {/* Step 2 Divider and Actions (Hidden once an action is selected) */}
                        {!selectedAction && (
                          <>
                            <div className="w-full relative flex items-center justify-center my-2 animate-fade-in-up">
                              <div className="absolute w-full h-[1px] bg-anthropic-border-cream"></div>
                              <span className={`relative bg-white px-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${file ? 'text-anthropic-terracotta' : 'text-anthropic-stone-gray/50'}`}>
                                Step 2: Choose Action
                              </span>
                            </div>

                            {/* No-data alert banner */}
                            {noDataAlert && (
                              <div className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[12px] font-medium animate-fade-in">
                                <AlertCircle size={16} className="shrink-0 text-amber-500" />
                                <span>Please upload a data file first before choosing an action.</span>
                                <button onClick={() => setNoDataAlert(false)} className="ml-auto p-0.5 hover:bg-amber-100 rounded-md">
                                  <X size={14} />
                                </button>
                              </div>
                            )}

                            {/* Step 2: Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full transition-all duration-300 animate-fade-in-up">
                              {/* Generate Charts card */}
                              <div
                                className={`p-6 bg-white border ${selectedAction === 'charts' ? 'border-anthropic-terracotta shadow-md' : 'border-anthropic-border-cream'} rounded-2xl text-left hover:border-anthropic-border-warm transition-all cursor-pointer group ${!file && !datasetId ? 'opacity-50' : ''}`}
                                onClick={() => {
                                  if (!file && !datasetId) {
                                    setNoDataAlert(true);
                                    setTimeout(() => setNoDataAlert(false), 4000);
                                    return;
                                  }
                                  if (analysisData) {
                                    setCurrentView('result');
                                    setShowChat(false);
                                    setSelectedAction('charts');
                                  } else {
                                    setSelectedAction('charts');
                                  }
                                }}
                              >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${selectedAction === 'charts' ? 'bg-anthropic-terracotta text-white' : 'bg-anthropic-warm-sand/50 text-anthropic-terracotta'}`}>
                                  <Zap size={20} className="currentColor" />
                                </div>
                                <h3 className="font-semibold text-anthropic-near-black mb-1">Generate Charts</h3>
                                <p className="text-[12px] text-anthropic-stone-gray line-clamp-2">Automatically generate charts and maps to reveal patterns.</p>
                              </div>

                              {/* Chat Feature card */}
                              <div
                                className={`p-6 bg-white border ${selectedAction === 'chat' ? 'border-anthropic-terracotta shadow-md' : 'border-anthropic-border-cream'} rounded-2xl text-left hover:border-anthropic-border-warm transition-all cursor-pointer group ${!file && !datasetId ? 'opacity-50' : ''}`}
                                onClick={() => {
                                  if (!file && !datasetId) {
                                    setNoDataAlert(true);
                                    setTimeout(() => setNoDataAlert(false), 4000);
                                    return;
                                  }
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${selectedAction === 'chat' ? 'bg-anthropic-terracotta text-white' : 'bg-anthropic-warm-sand/50 text-anthropic-terracotta'}`}>
                                  <Sparkles size={20} className="currentColor" />
                                </div>
                                <h3 className="font-semibold text-anthropic-near-black mb-1">Chat Feature</h3>
                                <p className="text-[12px] text-anthropic-stone-gray line-clamp-2">Interact with AI to analyze your data.</p>
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
                                {viewingHistoryItem?.query || prompt}
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
                          {analysisData && !loading && selectedAction === 'chat' && (
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

                          {!showChat && analysisData && !loading && selectedAction === 'charts' && (
                            <button
                              onClick={() => setShowChat(true)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-anthropic-warm-sand text-anthropic-near-black border border-anthropic-border-warm rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-anthropic-warm-sand/50 transition-all shadow-sm shrink-0"
                            >
                              <Sparkles size={14} className="text-anthropic-terracotta shrink-0" />
                              <span className="whitespace-nowrap">Open Assistant</span>
                            </button>
                          )}

                          {analysisData && !loading && selectedAction === 'charts' && (
                            <button
                              onClick={() => {
                                setSelectedAction('chat');
                                setShowChat(true);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-anthropic-warm-sand text-anthropic-near-black border border-anthropic-border-warm rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-anthropic-warm-sand/50 transition-all shadow-sm shrink-0"
                            >
                              <X size={14} className="text-anthropic-terracotta shrink-0" />
                              <span className="whitespace-nowrap">Close Charts</span>
                            </button>
                          )}

                          {/* Result Tabs */}
                          {analysisData && !loading && selectedAction !== 'chat' && (
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
                        <AnalysisOutput data={analysisData} loading={loading} activeTab={activeResultTab} />
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
                        // Bug 2 fix: when closing a chat-only session,
                        // go back to the action-cards welcome screen so
                        // the background is never blank.
                        if (selectedAction === 'chat') {
                          setSelectedAction(null);
                          setCurrentView('new');
                        }
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
                onChange={(e) => {
                  const uploadedFile = e.target.files[0];
                  if (uploadedFile) setFile(uploadedFile);
                }}
                className="hidden"
                accept=".csv,.xlsx,.json"
              />

              {/* Universal Bottom Input Bar */}
              {(currentView !== 'result' && selectedAction !== null) && (
                <div className="block animate-fade-in-up">

                  {/* ── Mode Toggle Tabs ── */}
                  {!loading && (
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
                        : "Enter prompt to generate charts..."
                    }
                  />

                  {/* Extra spacing */}
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
