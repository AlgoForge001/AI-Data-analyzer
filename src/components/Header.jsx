import React from 'react';
import { Search, Bell, Settings, User, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
    return (
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-[#0b0f19]/80 backdrop-blur-sm sticky top-0 z-10 w-full">
            <div className="flex flex-1 max-w-xl items-center gap-2 lg:gap-0">
                <button 
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex-shrink-0"
                >
                    <Menu size={24} />
                </button>
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00C6FF] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search datasets, reports..."
                        className="w-full bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-[#7B2FF7]/50 focus:shadow-[0_0_15px_rgba(123,47,247,0.2)] transition-all placeholder:text-slate-500 shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all relative hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#F107A3] rounded-full border-2 border-[#0B0F1A] shadow-[0_0_8px_rgba(241,7,163,0.8)]"></span>
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <Settings size={20} />
                </button>
                <div className="h-8 w-[1px] bg-white/5 mx-2"></div>
                <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">User Profile</p>
                        <p className="text-[10px] text-[#00C6FF] uppercase tracking-widest font-bold">Pro Account</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#7B2FF7] p-[2px] shadow-[0_0_15px_rgba(0,198,255,0.3)]">
                        <div className="w-full h-full rounded-full bg-[#0B0F1A] flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
