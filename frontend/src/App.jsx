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
import { Zap, Loader2, AlertCircle, PanelRightOpen, Database, Sparkles, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
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
      await fetch(`${API_URL}/cancel/${taskIdRef.current}`, { method: 'POST' }).catch(() => {});
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
          setShowChat(true);
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
  }, [file, prompt, fetchHistory]);

  // ── cancel ──
  const handleCancel = useCallback(() => {
    const taskId = taskIdRef.current;
    if (!taskId) return;
    setIsCancelling(true);
    stopPolling();
    fetch(`${API_URL}/cancel/${taskId}`, { method: 'POST' }).catch(() => {});
  }, []);

  const handleLoadHistoryItem = useCallback(async (taskId) => {
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
        setShowChat(true);
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
                  className={`flex flex-col overflow-hidden ${isResizing ? '' : 'transition-all duration-500 ease-in-out'}`} 
                  style={{ width: currentView === 'result' && showChat ? `${splitRatio}%` : '100%' }}
                >
                  
                  {/* Initial Welcome State */}
                  {currentView === 'new' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-in">
                      {/* Logo placeholder - User will provide logo later */}
                      <h1 className="text-[2.5rem] font-serif text-anthropic-near-black mb-4 tracking-tight">
                        How can I help with your data?
                      </h1>
                      <p className="text-anthropic-stone-gray max-w-md text-body-std leading-relaxed">
                        Upload a dataset and describe the analysis you need. I'll generate insights, visualizations, and a summary for you.
                      </p>
                      
                      <div className="mt-12 grid grid-cols-2 gap-4 max-w-2xl w-full">
                        <div className="p-6 bg-white border border-anthropic-border-cream rounded-2xl text-left hover:border-anthropic-border-warm transition-all cursor-pointer group">
                          <div className="w-10 h-10 bg-anthropic-warm-sand/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles size={20} className="text-anthropic-terracotta" />
                          </div>
                          <h3 className="font-semibold text-anthropic-near-black mb-1">Predictive Insights</h3>
                          <p className="text-[12px] text-anthropic-stone-gray line-clamp-2">Analyze trends and forecast future outcomes based on historical data.</p>
                        </div>
                        <div className="p-6 bg-white border border-anthropic-border-cream rounded-2xl text-left hover:border-anthropic-border-warm transition-all cursor-pointer group">
                          <div className="w-10 h-10 bg-anthropic-warm-sand/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Zap size={20} className="text-anthropic-terracotta" />
                          </div>
                          <h3 className="font-semibold text-anthropic-near-black mb-1">Visual Discovery</h3>
                          <p className="text-[12px] text-anthropic-stone-gray line-clamp-2">Automatically generate charts and maps to reveal hidden patterns.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results View */}
                  {currentView === 'result' && (
                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                      {/* Analysis Meta Header - Integrated */}
                      <div className="px-8 py-4 border-b border-anthropic-border-cream flex items-center justify-between shrink-0 bg-anthropic-ivory/50">
                        <div className="flex items-center gap-4">
                          <h2 className="text-feature !text-[1rem] font-serif truncate max-w-md">
                            {viewingHistoryItem?.query || prompt}
                          </h2>
                          <div className="flex items-center gap-2 text-anthropic-stone-gray text-[10px] uppercase tracking-wider">
                            <span className="px-1.5 py-0.5 bg-anthropic-warm-sand/30 rounded border border-anthropic-border-cream">
                              {viewingHistoryItem?.filename || file?.name}
                            </span>
                          </div>
                        </div>
                        
                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                          {!showChat && analysisData && !loading && (
                            <button
                              onClick={() => setShowChat(true)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-anthropic-warm-sand text-anthropic-near-black border border-anthropic-border-warm rounded-lg text-[11px] font-bold uppercase tracking-tight hover:bg-anthropic-warm-sand/50 transition-all shadow-sm"
                            >
                              <Sparkles size={14} className="text-anthropic-terracotta" />
                              Open Assistant
                            </button>
                          )}

                          {/* Result Tabs */}
                          {analysisData && !loading && (
                            <div className="flex items-center gap-1 bg-white/80 rounded-lg p-0.5 border border-anthropic-border-cream">
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
                {showChat && currentView === 'result' && !loading && (
                  <div 
                    onMouseDown={handleMouseDown}
                    className={`w-1 hover:w-1.5 bg-anthropic-border-cream hover:bg-anthropic-terracotta/40 transition-all cursor-col-resize flex items-center justify-center relative group z-10 ${isResizing ? 'bg-anthropic-terracotta/40 w-1.5' : ''}`}
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center gap-0.5 px-1 py-4 bg-white border border-anthropic-border-cream rounded-full shadow-sm transition-all ${isResizing ? 'scale-110 shadow-md border-anthropic-terracotta/30' : 'opacity-0 group-hover:opacity-100'}`}>
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
                    className={`bg-anthropic-ivory/50 flex flex-col animate-fade-in min-h-0 overflow-hidden`}
                    style={{ width: `${100 - splitRatio}%` }}
                  >
                    <Chat 
                      datasetId={datasetId} 
                      onClose={() => setShowChat(false)}
                      initialSummary={analysisData ? "I've analysed your dataset. Here's what I found — feel free to ask follow-up questions!" : null}
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

              {/* Universal Bottom Input Bar */}
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
              />
              
              {/* Extra spacing */}
              <div className="h-12" />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
