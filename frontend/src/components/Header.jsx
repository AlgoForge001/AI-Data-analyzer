import React from "react";
import { Menu, Bell, User, ChevronDown } from "lucide-react";

const Header = ({ onMenuClick, pageTitle }) => {
  return (
    <header className="h-16 border-b border-anthropic-border-cream bg-anthropic-parchment/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 rounded-lg transition-all"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sub-small !text-[1.1rem] !font-sans font-medium text-anthropic-near-black">
          {pageTitle}
        </h2>
      </div>
    </header>
  );
};

export default Header;
