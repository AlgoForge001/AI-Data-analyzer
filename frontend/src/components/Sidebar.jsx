import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Search,
  Settings,
  Database,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  Plus,
  Bell,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

/* Tooltip that appears on the right side when sidebar is collapsed */
const CollapsedTooltip = ({ label }) => (
  <span
    className="
      pointer-events-none absolute left-full ml-3 z-[9999]
      px-2.5 py-1 rounded-lg
      text-[11px] font-semibold whitespace-nowrap
      opacity-0 group-hover:opacity-100
      translate-x-[-4px] group-hover:translate-x-0
      transition-all duration-150
      shadow-md
    "
    style={{
      background: 'var(--bg-popover, #F5F0EA)',
      color: 'var(--text-primary, #0D0F1A)',
      border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
    }}
  >
    {label}
  </span>
);

const SidebarItem = ({ icon: Icon, label, active = false, onClick, isCollapsed }) => (
  <div
    onClick={onClick}
    className={`
      relative flex items-center group gap-3 px-4 py-3 rounded-xl cursor-pointer
      transition-all duration-200
      ${active
        ? "sidebar-item-active"
        : "text-anthropic-olive-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50"
      }
      ${isCollapsed ? "justify-center !px-0" : ""}
    `}
  >
    <Icon
      size={18}
      className={`${active
        ? "text-anthropic-near-black"
        : "text-anthropic-stone-gray group-hover:text-anthropic-near-black"
        } transition-colors shrink-0`}
    />

    {/* Label: animate with opacity + max-width, NOT conditional render, so layout is preserved */}
    <span
      className="text-body-sm font-medium flex-1 truncate transition-all duration-200 leading-none"
      style={{
        opacity: isCollapsed ? 0 : 1,
        maxWidth: isCollapsed ? 0 : '160px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>

    {active && !isCollapsed && (
      <ChevronRight
        size={14}
        className="text-anthropic-near-black opacity-40 shrink-0 transition-all duration-200"
        style={{ opacity: isCollapsed ? 0 : undefined, width: isCollapsed ? 0 : undefined }}
      />
    )}

    {/* Tooltip only in collapsed state */}
    {isCollapsed && <CollapsedTooltip label={label} />}
  </div>
);

const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  history = [],
  onHistoryItemClick,
  onNewAnalysis,
  activePage,
  onNavigate,
}) => {
  const [showUserPopover, setShowUserPopover] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeMenuPos, setActiveMenuPos] = useState({ top: 0 });

  const SIDEBAR_EXPANDED_W = 220;
  const SIDEBAR_COLLAPSED_W = 56;
  const POPUP_GAP = 10; // px gap between sidebar edge and popup

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle History Menu
      if (
        activeMenuId &&
        !event.target.closest('.history-hover-card') &&
        !event.target.closest('.history-item-container') &&
        !event.target.closest('.sidebar-toggle-btn')
      ) {
        setActiveMenuId(null);
      }
      
      // Handle User Popover
      if (
        showUserPopover &&
        !event.target.closest('.user-popover') &&
        !event.target.closest('.user-trigger')
      ) {
        setShowUserPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId, showUserPopover]);

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    // Toggle off if same item clicked again
    if (activeMenuId === item.task_id) {
      setActiveMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveMenuId(item.task_id);
    setActiveMenuPos({ top: rect.top + rect.height / 2 });

    // Auto-load charts immediately on click
    onHistoryItemClick(item.task_id, 'charts');

    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const popupLeft = isCollapsed ? SIDEBAR_COLLAPSED_W + POPUP_GAP : SIDEBAR_EXPANDED_W + POPUP_GAP;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-anthropic-near-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 z-40 h-screen
          bg-anthropic-ivory border-r border-anthropic-border-cream
          flex flex-col overflow-visible
          transition-all duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ width: isCollapsed ? `${SIDEBAR_COLLAPSED_W}px` : `${SIDEBAR_EXPANDED_W}px`, padding: isCollapsed ? '8px' : '24px' }}
      >
        {/* TOP BAR */}
        <div className={`flex items-center mb-6 transition-all duration-200 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1" onClick={() => onNavigate('dashboard')}>
              <div className="w-7 h-7 rounded-lg bg-anthropic-terracotta/10 border border-anthropic-terracotta/20 flex items-center justify-center shrink-0">
                <Database size={14} className="text-anthropic-terracotta" />
              </div>
              <div className="overflow-hidden leading-none">
                <h1 className="text-sub-small !text-[1.1rem] !font-serif tracking-tight leading-none whitespace-nowrap">JavaX</h1>
                <p className="text-overline !text-[8px] text-anthropic-stone-gray mt-0.5">AI Data Engine</p>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="sidebar-toggle-btn hidden lg:flex w-7 h-7 rounded-lg shrink-0 bg-anthropic-warm-sand/60 border border-anthropic-border-cream items-center justify-center text-anthropic-stone-gray hover:text-anthropic-near-black transition-all"
            style={{ zIndex: 60, position: 'relative' }}
          >
            {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>

          {!isCollapsed && (
            <button onClick={onClose} className="lg:hidden p-1 text-anthropic-stone-gray hover:text-anthropic-near-black rounded-lg ml-1">
              <X size={20} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex items-center justify-center mb-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-7 h-7 rounded-lg bg-anthropic-terracotta/10 border border-anthropic-terracotta/20 flex items-center justify-center">
              <Database size={14} className="text-anthropic-terracotta" />
            </div>
          </div>
        )}

        {/* New Analysis button */}
        <div className="relative group/newbtn mb-6">
          <button
            onClick={() => { onNewAnalysis(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-anthropic-near-black text-anthropic-ivory rounded-xl font-medium text-body-sm hover:bg-anthropic-charcoal-warm transition-all active:scale-95 shadow-whisper"
          >
            <Plus size={18} className="shrink-0" />
            {!isCollapsed && <span className="overflow-hidden whitespace-nowrap transition-all duration-200">New Analysis</span>}
          </button>
        </div>

        <nav className="flex flex-col flex-1 min-h-0 -mx-2 px-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {!isCollapsed && <p className="text-overline text-anthropic-stone-gray ml-4 mb-3 uppercase tracking-widest text-[9px]">Menu</p>}
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activePage === "dashboard"} onClick={() => { onNavigate("dashboard"); onClose(); }} isCollapsed={isCollapsed} />
            <SidebarItem icon={Search} label="Search" active={activePage === "search"} onClick={() => { onNavigate("search"); onClose(); }} isCollapsed={isCollapsed} />
          </div>

          {history.length > 0 && !isCollapsed && (
            <div className="flex flex-col min-h-0 pt-5 mt-5 border-t border-anthropic-border-cream flex-1">
              <p className="text-overline text-anthropic-stone-gray ml-4 mb-2 uppercase tracking-widest text-[9px] shrink-0">Recent</p>
              <div className="flex-1 space-y-0.5 pr-1">
                {history.map((item) => (
                  <div
                    key={item.task_id}
                    onClick={(e) => handleItemClick(e, item)}
                    className={`history-item-container group/history-item relative px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer
                      ${activeMenuId === item.task_id ? 'bg-anthropic-warm-sand/60 text-anthropic-near-black' : 'hover:bg-anthropic-warm-sand/30'}
                    `}
                  >
                    <div className="text-[11px] text-anthropic-olive-gray group-hover/history-item:text-anthropic-near-black truncate transition-colors" title={item.query || "Untitled"}>
                      {item.query || "Untitled"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Info Card */}
        <div className="mt-auto relative">
          {showUserPopover && (
            <div className="absolute bottom-[calc(100%+12px)] left-0 w-full min-w-[200px] bg-anthropic-ivory border border-anthropic-border-cream rounded-2xl shadow-elegant animate-fade-in-up z-50 overflow-hidden user-popover">
              <div className="p-4 border-b border-anthropic-border-cream bg-anthropic-warm-sand/20">
                <p className="text-[12px] font-semibold text-anthropic-near-black">Admin User</p>
                <p className="text-[10px] text-anthropic-stone-gray truncate">admin@javax.io</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { onNavigate("settings"); setShowUserPopover(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-colors text-left">
                  <Settings size={14} className="text-anthropic-stone-gray" /> Settings
                </button>
                <button onClick={() => { onNavigate("profile"); setShowUserPopover(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-colors text-left">
                  <User size={14} className="text-anthropic-stone-gray" /> Profile
                </button>
                <button onClick={() => {
                  const html = document.documentElement;
                  const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                  html.setAttribute('data-theme', newTheme);
                  localStorage.setItem('javax-theme', newTheme);
                  setIsDarkMode(newTheme === 'dark');
                }} className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-colors text-left">
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
              <div className="p-1.5 border-t border-anthropic-border-cream">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-terracotta hover:bg-anthropic-terracotta/10 rounded-lg text-left font-medium">
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}

          <div
            onClick={() => setShowUserPopover(!showUserPopover)}
            className={`user-trigger flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-anthropic-warm-sand/50 hover:border-anthropic-border-cream ${isCollapsed ? "justify-center p-2" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-anthropic-terracotta/10 border border-anthropic-terracotta/20 flex items-center justify-center text-anthropic-terracotta shrink-0">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-anthropic-near-black leading-none truncate">Admin User</p>
                <p className="text-[9px] text-anthropic-stone-gray mt-1 truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HOVER POPUP CARD ── */}
      {activeMenuId && (
        <div
          className="history-hover-card fixed flex flex-col gap-1.5 rounded-xl p-2 min-w-[188px]"
          style={{
            zIndex: 45,
            top: activeMenuPos.top,
            left: popupLeft,
            transform: 'translateY(-50%)',
            transition: 'left 200ms ease-in-out',
            background: 'var(--bg-popover, #F5F0EA)',
            border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 border-l border-b border-anthropic-border-cream rotate-45" style={{ backgroundColor: 'var(--bg-popover, #F5F0EA)' }} />
          <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-anthropic-border-cream rounded-full flex items-center justify-center text-anthropic-stone-gray hover:text-red-500 shadow-sm transition-colors">
            <X size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onHistoryItemClick(activeMenuId, 'charts'); setActiveMenuId(null); }} className="w-full flex items-center gap-3 py-2 px-4 bg-anthropic-warm-sand/50 border border-anthropic-border-warm text-anthropic-near-black rounded-lg hover:bg-anthropic-warm-sand transition-all transform active:scale-95">
            <LayoutDashboard size={14} className="shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">dashboard and charts</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onHistoryItemClick(activeMenuId, 'chat'); setActiveMenuId(null); }} className="w-full flex items-center gap-3 py-2 px-4 bg-anthropic-terracotta text-white rounded-lg hover:opacity-90 transition-all transform active:scale-95 font-medium">
            <Sparkles size={14} className="shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">chat analysis</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
