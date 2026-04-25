import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  History,
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
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, active = false, onClick, isCollapsed }) => (
  <div
    onClick={onClick}
    title={isCollapsed ? label : ""}
    className={`
    flex items-center group gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
    ${
      active
        ? "sidebar-item-active"
        : "text-anthropic-olive-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50"
    }
    ${isCollapsed ? "justify-center px-2" : ""}
  `}
  >
    <Icon
      size={18}
      className={`${active ? "text-anthropic-near-black" : "text-anthropic-stone-gray group-hover:text-anthropic-near-black"} transition-colors shrink-0`}
    />
    {!isCollapsed && <span className="text-body-sm font-medium flex-1 truncate">{label}</span>}
    {active && !isCollapsed && (
      <ChevronRight
        size={14}
        className="text-anthropic-near-black opacity-40"
      />
    )}
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
                flex flex-col
                transition-all duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                ${isCollapsed ? "w-[56px] p-2" : "w-[220px] p-6"}
            `}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={`
            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 
            bg-anthropic-ivory border border-anthropic-border-cream rounded-full 
            items-center justify-center text-anthropic-stone-gray hover:text-anthropic-near-black 
            hover:bg-anthropic-warm-sand shadow-whisper z-50 transition-all
          `}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-10`}>
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onNavigate("dashboard")}
          >
            {/* Logo placeholder - User will provide logo later */}
            {!isCollapsed && (
              <div>
                <h1 className="text-sub-small !text-[1.2rem] !font-serif tracking-tight leading-none">
                  javaX
                </h1>
                <p className="text-overline !text-[8px] text-anthropic-stone-gray mt-0.5">
                  AI Data Engine
                </p>
              </div>
            )}
          </div>
          {/* Close button for mobile */}
          {!isCollapsed && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            onNewAnalysis();
            onClose();
          }}
          title={isCollapsed ? "New Analysis" : ""}
          className={`
            w-full mb-8 flex items-center justify-center gap-2 py-3 
            bg-anthropic-near-black text-anthropic-ivory rounded-xl font-medium text-body-sm 
            hover:bg-anthropic-charcoal-warm transition-all active:scale-95 shadow-whisper
            ${isCollapsed ? "px-0" : ""}
          `}
        >
          <Plus size={18} />
          {!isCollapsed && "New Analysis"}
        </button>

        <nav className="flex-1 overflow-y-auto space-y-1 -mx-2 px-2 scrollbar-hide">
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
          <SidebarItem
            icon={BarChart3}
            label="Analytics"
            active={activePage === "analytics"}
            onClick={() => {
              onNavigate("analytics");
              onClose();
            }}
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            icon={History}
            label="History"
            active={activePage === "history"}
            onClick={() => {
              onNavigate("history");
              onClose();
            }}
            isCollapsed={isCollapsed}
          />

          {history.length > 0 && !isCollapsed && (
            <div className="pt-6 mt-6 border-t border-anthropic-border-cream">
              <p className="text-overline text-anthropic-stone-gray ml-4 mb-3 uppercase tracking-widest text-[9px]">
                Recent
              </p>
              <div className="space-y-1">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.task_id}
                    onClick={() => {
                      onHistoryItemClick(item.task_id);
                      onClose();
                    }}
                    className="px-4 py-2 text-[11px] text-anthropic-olive-gray hover:text-anthropic-near-black truncate cursor-pointer rounded-lg hover:bg-anthropic-warm-sand/30 transition-colors"
                  >
                    {item.query || "Untitled"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

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
