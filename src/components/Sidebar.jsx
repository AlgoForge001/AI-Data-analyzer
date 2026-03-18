import React from 'react';
import {
    LayoutDashboard,
    Upload,
    BarChart3,
    History,
    Settings,
    Database,
    ChevronRight,
    X
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div onClick={onClick} className={`
    flex items-center group gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
    ${active
            ? 'sidebar-item-active'
            : 'text-slate-500 hover:text-white hover:bg-white/5'}
  `}>
        <Icon size={20} className={`${active ? 'text-white' : 'group-hover:text-[#00C6FF]'} transition-colors`} />
        <span className="font-medium flex-1">{label}</span>
        {active && <ChevronRight size={14} className="text-white opacity-80" />}
    </div>
);

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            <div className={`
                fixed left-0 top-0 z-40 h-screen w-[220px] 
                bg-gradient-to-b from-[#080b12] to-black 
                border-r border-white/5 flex flex-col p-6 
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-glow">
                            <Database size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">AI Analyzer</h1>
                            <p className="text-[10px] text-[#F107A3] font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(241,7,163,0.5)]">Premium</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-4 mb-4">Core Actions</p>
                <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
                <SidebarItem icon={Upload} label="Upload Data" active onClick={onClose} />
                <SidebarItem icon={BarChart3} label="Analysis" onClick={onClose} />
                <SidebarItem icon={History} label="Executions" onClick={onClose} />
            </nav>

            <div className="pt-6 border-t border-white/5 relative">
                <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <SidebarItem icon={Settings} label="Settings" onClick={onClose} />
            </div>
            </div>
        </>
    );
};

export default Sidebar;
