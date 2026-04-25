import React from "react";
import { User, Crown, Mail, Key, Shield, Calendar, ArrowRight, ExternalLink } from "lucide-react";

const UserProfilePage = () => {
  return (
    <div className="page-container animate-fade-in-up max-w-3xl">
      <div className="mb-10">
        <h1 className="text-section !text-[2.5rem] text-anthropic-near-black mb-2">
          Profile
        </h1>
        <p className="text-body-std text-anthropic-stone-gray">
          Account management and subscription details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card mb-8 p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="relative">
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-anthropic-terracotta to-anthropic-coral p-[3px] shadow-whisper">
            <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center">
              <User size={48} className="text-anthropic-near-black" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-anthropic-near-black flex items-center justify-center text-anthropic-ivory shadow-lg border-2 border-anthropic-parchment">
            <Crown size={20} />
          </div>
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-sub-large !text-[1.8rem] text-anthropic-near-black mb-1">
            Admin User
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-anthropic-terracotta/10 text-anthropic-terracotta rounded-full text-overline !text-[9px] font-bold border border-anthropic-terracotta/20">
              Premium Account
            </span>
            <span className="flex items-center gap-1.5 text-caption text-anthropic-stone-gray">
              <Calendar size={14} />
              Member since Jan 2026
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8">
          <h3 className="text-feature text-anthropic-near-black mb-6 flex items-center gap-2">
            Personal Information
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-anthropic-warm-sand/30 rounded-lg">
                <Mail size={16} className="text-anthropic-stone-gray" />
              </div>
              <div>
                <p className="text-label text-anthropic-stone-gray uppercase tracking-widest font-bold">Email Address</p>
                <p className="text-body-std text-anthropic-near-black font-medium">user@example.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-anthropic-warm-sand/30 rounded-lg">
                <Shield size={16} className="text-anthropic-stone-gray" />
              </div>
              <div>
                <p className="text-label text-anthropic-stone-gray uppercase tracking-widest font-bold">Subscription Plan</p>
                <p className="text-body-std text-anthropic-near-black font-medium">Premium Enterprise</p>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-3 bg-anthropic-warm-sand/50 text-anthropic-charcoal-warm rounded-xl font-medium text-body-sm hover:bg-anthropic-warm-sand transition-all border border-anthropic-border-cream">
            Edit Profile
          </button>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-feature text-anthropic-near-black mb-6 flex items-center gap-2">
            Security & Access
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-anthropic-warm-sand/30 rounded-lg">
                <Key size={16} className="text-anthropic-stone-gray" />
              </div>
              <div className="flex-1">
                <p className="text-label text-anthropic-stone-gray uppercase tracking-widest font-bold">Master API Key</p>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-body-sm text-anthropic-focus font-mono bg-anthropic-focus/5 px-2 py-0.5 rounded">sk-••••••••3f7a</code>
                  <button className="text-[10px] text-anthropic-focus font-bold uppercase hover:underline">Reveal</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <button className="w-full py-3 bg-anthropic-near-black text-anthropic-ivory rounded-xl font-medium text-body-sm hover:bg-anthropic-charcoal-warm transition-all flex items-center justify-center gap-2">
              Generate New Key
              <ArrowRight size={16} />
            </button>
            <button className="w-full py-3 text-anthropic-stone-gray rounded-xl font-medium text-body-sm hover:bg-anthropic-warm-sand/30 transition-all flex items-center justify-center gap-2">
              View Audit Logs
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
