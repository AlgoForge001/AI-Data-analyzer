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
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [hoveredItemPos, setHoveredItemPos] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef(null);
  
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

  const handleItemMouseEnter = (e, item) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItemId(item.task_id);
    setHoveredItemPos({ top: rect.top + rect.height / 2, left: rect.right });
  };

  const handleItemMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItemId(null);
    }, 150);
  };

  const handleMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMenuMouseLeave = () => {
    handleItemMouseLeave();
  };

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
        style={{ width: isCollapsed ? '56px' : '220px', padding: isCollapsed ? '8px' : '24px' }}
      >
        {/* Toggle Button — pinned to right edge, vertically centred */}
        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="
            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6
            bg-anthropic-ivory border border-anthropic-border-cream
            items-center justify-center text-anthropic-stone-gray
            hover:text-anthropic-near-black hover:bg-anthropic-warm-sand
            shadow-sm z-50 transition-all duration-150
          "
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Brand / Logo area */}
        <div
          className={`flex items-center mb-8 transition-all duration-200 ${isCollapsed ? 'justify-center' : 'justify-between'
            }`}
        >
          <div
            className="flex items-center gap-2.5 cursor-pointer min-w-0"
            onClick={() => onNavigate('dashboard')}
          >
            {/* Icon mark — always visible */}
            <div className="w-7 h-7 rounded-lg bg-anthropic-terracotta/10 border border-anthropic-terracotta/20 flex items-center justify-center shrink-0">
              <Database size={14} className="text-anthropic-terracotta" />
            </div>

            {/* Full brand name — fades out when collapsed */}
            <div
              className="overflow-hidden transition-all duration-200 leading-none"
              style={{ opacity: isCollapsed ? 0 : 1, maxWidth: isCollapsed ? 0 : '140px' }}
            >
              <h1 className="text-sub-small !text-[1.1rem] !font-serif tracking-tight leading-none whitespace-nowrap">
                JavaX
              </h1>
              <p className="text-overline !text-[8px] text-anthropic-stone-gray mt-0.5 whitespace-nowrap">
                AI Data Engine
              </p>
            </div>
          </div>

          {/* Close button for mobile — hidden when collapsed */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-all duration-200"
            style={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : undefined, overflow: 'hidden' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* New Analysis button */}
        <div className="relative group/newbtn mb-6">
          <button
            onClick={() => {
              onNewAnalysis();
              onClose();
            }}
            className="
              w-full flex items-center justify-center gap-2 py-3
              bg-anthropic-near-black text-anthropic-ivory rounded-xl font-medium text-body-sm
              hover:bg-anthropic-charcoal-warm transition-all duration-200 active:scale-95 shadow-whisper
            "
            style={{ paddingLeft: isCollapsed ? 0 : undefined, paddingRight: isCollapsed ? 0 : undefined }}
          >
            <Plus size={18} className="shrink-0" />
            <span
              className="overflow-hidden whitespace-nowrap transition-all duration-200"
              style={{ opacity: isCollapsed ? 0 : 1, maxWidth: isCollapsed ? 0 : '120px' }}
            >
              New Analysis
            </span>
          </button>
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <span
              className="
                pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[9999]
                px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap
                opacity-0 group-hover/newbtn:opacity-100
                translate-x-[-4px] group-hover/newbtn:translate-x-0
                transition-all duration-150 shadow-md
              "
              style={{
                background: 'var(--bg-popover, #F5F0EA)',
                color: 'var(--text-primary, #0D0F1A)',
                border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
              }}
            >
              New Analysis
            </span>
          )}
        </div>

        <nav
          className="flex flex-col flex-1 min-h-0 -mx-2 px-2 overflow-y-auto overflow-x-visible scrollbar-hide"
        >
          {/* Menu items */}
          <div className="space-y-1" style={{ overflowX: 'visible' }}>
            {!isCollapsed && (
              <p className="text-overline text-anthropic-stone-gray ml-4 mb-3 uppercase tracking-widest text-[9px]">
                Menu
              </p>
            )}
            <SidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activePage === "dashboard"}
              onClick={() => {
                onNavigate("dashboard");
                onClose();
              }}
              isCollapsed={isCollapsed}
            />
            <SidebarItem
              icon={Search}
              label="Search"
              active={activePage === "search"}
              onClick={() => {
                onNavigate("search");
                onClose();
              }}
              isCollapsed={isCollapsed}
            />
          </div>

          {/* Recent Chats — scrollable, fills remaining space */}
          {history.length > 0 && !isCollapsed && (
            <div className="flex flex-col min-h-0 pt-5 mt-5 border-t border-anthropic-border-cream flex-1">
              <p className="text-overline text-anthropic-stone-gray ml-4 mb-2 uppercase tracking-widest text-[9px] shrink-0">
                Recent
              </p>
              <div className="flex-1 space-y-0.5 pr-1">
                {history.map((item) => (
                  <div
                    key={item.task_id}
                    onMouseEnter={(e) => handleItemMouseEnter(e, item)}
                    onMouseLeave={handleItemMouseLeave}
                    className="group/history-item relative px-4 py-2 rounded-lg hover:bg-anthropic-warm-sand/30 transition-all duration-200"
                  >
                    <div
                      onClick={() => {
                        onHistoryItemClick(item.task_id);
                        onClose();
                      }}
                      className="text-[11px] text-anthropic-olive-gray group-hover/history-item:text-anthropic-near-black truncate cursor-pointer transition-colors"
                      title={item.query || "Untitled"}
                    >
                      {item.query || "Untitled"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Floating Hover Card outside Sidebar - Portaled via fixed positioning */}
        {hoveredItemId && (
          <div 
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
            className="history-hover-card fixed z-[9999] flex flex-col gap-1.5 rounded-xl p-2 ml-4 min-w-[180px] animate-in fade-in slide-in-from-left-2 duration-200"
            style={{ 
              top: hoveredItemPos.top, 
              left: hoveredItemPos.left,
              transform: 'translateY(-50%)' 
            }}
          >
            {/* Visual pointer/arrow */}
            <div 
              className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 border-l border-b border-anthropic-border-cream dark:border-anthropic-border-dark rotate-45" 
              style={{ backgroundColor: 'var(--bg-popover)' }}
            />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHistoryItemClick(hoveredItemId, 'charts');
                onClose();
                setHoveredItemId(null);
              }}
              title="Open Charts"
              className="w-full flex items-center gap-3 py-2 px-4 bg-anthropic-warm-sand/50 border border-anthropic-border-warm text-anthropic-near-black rounded-lg hover:bg-anthropic-warm-sand transition-all transform active:scale-95 z-10"
            >
              <LayoutDashboard size={14} className="shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Open Charts</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onHistoryItemClick(hoveredItemId, 'chat');
                onClose();
                setHoveredItemId(null);
              }}
              title="Open Assistant"
              className="w-full flex items-center gap-3 py-2 px-4 bg-anthropic-terracotta text-white rounded-lg hover:opacity-90 transition-all transform active:scale-95 z-10 font-medium"
            >
              <Sparkles size={14} className="shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">Open Assistant</span>
            </button>
          </div>
        )}

        {/* User Info Card */}
        <div className="mt-auto relative">
          {/* User Popover */}
          {showUserPopover && (
            <div className={`
              absolute bottom-[calc(100%+12px)] left-0 w-full min-w-[200px]
              bg-anthropic-ivory border border-anthropic-border-cream rounded-2xl
              shadow-elegant animate-fade-in-up z-50 overflow-hidden user-popover
              ${isCollapsed ? "left-0" : ""}
            `}>
              <div className="p-4 border-b border-anthropic-border-cream bg-anthropic-warm-sand/20">
                <p className="text-[12px] font-semibold text-anthropic-near-black">Admin User</p>
                <p className="text-[10px] text-anthropic-stone-gray truncate">admin@javax.io</p>
                <p className="text-[9px] font-bold text-anthropic-terracotta mt-1 uppercase tracking-tighter">Administrator</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { onNavigate("settings"); setShowUserPopover(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-colors text-left"
                >
                  <Settings size={14} className="text-anthropic-stone-gray" />
                  Settings
                </button>
                <button
                  onClick={() => { onNavigate("profile"); setShowUserPopover(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-colors text-left"
                >
                  <User size={14} className="text-anthropic-stone-gray" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    const html = document.documentElement;
                    const currentTheme = html.getAttribute('data-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    html.setAttribute('data-theme', newTheme);
                    localStorage.setItem('javax-theme', newTheme);
                    setIsDarkMode(newTheme === 'dark');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-colors text-left"
                >
                  {isDarkMode ? <Sun size={14} className="text-anthropic-stone-gray" /> : <Moon size={14} className="text-anthropic-stone-gray" />}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
              <div className="p-1.5 border-t border-anthropic-border-cream">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-anthropic-terracotta hover:bg-anthropic-terracotta/10 rounded-lg transition-colors text-left font-medium"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            </div>
          )}

          <div
            onClick={() => setShowUserPopover(!showUserPopover)}
            className={`
              flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent
              hover:bg-anthropic-warm-sand/50 hover:border-anthropic-border-cream
              ${isCollapsed ? "justify-center p-2" : ""}
            `}
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
            {!isCollapsed && (
              <div className="relative group/bell" onClick={(e) => e.stopPropagation()}>
                <Bell size={14} className="text-anthropic-stone-gray group-hover/bell:text-anthropic-near-black transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-anthropic-terracotta rounded-full border border-anthropic-ivory" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
