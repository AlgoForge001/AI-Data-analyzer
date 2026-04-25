import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  CreditCard,
  User,
  Terminal,
  AlertCircle,
  Save,
  Download,
  Copy,
  RefreshCw,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isDirty, setIsDirty] = useState(false);

  // General State
  const [general, setGeneral] = useState({
    theme: localStorage.getItem('javax-theme') || 'system',
    format: 'csv',
    language: 'en-US',
    emailAlerts: true
  });

  // Account State
  const [account, setAccount] = useState({
    displayName: 'Admin User',
    email: 'admin@javax.ai',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // javaX State
  const [javax, setJavax] = useState({
    model: 'claude-3-opus',
    maxSize: 50,
    apiKey: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxx',
    webhook: 'https://api.javax.ai/webhook',
    autoGenerate: true
  });

  // Track changes to mark dirty
  const markDirty = () => setIsDirty(true);

  const handleGeneralChange = (key, val) => {
    setGeneral(p => ({ ...p, [key]: val }));
    markDirty();
    if (key === 'theme') {
      const html = document.documentElement;
      if (val === 'system') {
        localStorage.removeItem('javax-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        localStorage.setItem('javax-theme', val);
        html.setAttribute('data-theme', val);
      }
    }
  };

  const handleAccountChange = (key, val) => {
    setAccount(p => ({ ...p, [key]: val }));
    markDirty();
  };

  const handleJavaxChange = (key, val) => {
    setJavax(p => ({ ...p, [key]: val }));
    markDirty();
  };

  const handleSave = () => {
    setIsDirty(false);
    // Theme is applied immediately upon selection, so we don't need to do it here.
    // Logic to save other settings would go here
  };

  const TABS = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'account', label: 'Account', icon: User },
    { id: 'javax', label: 'javaX', icon: Terminal },
  ];

  return (
    <div className="flex h-full w-full animate-fade-in bg-anthropic-parchment">
      {/* Left Navigation */}
      <div className="w-64 border-r border-anthropic-border-cream bg-anthropic-ivory flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-sub-small font-serif text-anthropic-near-black">Settings</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-anthropic-terracotta/10 text-anthropic-terracotta shadow-sm border border-anthropic-terracotta/20' 
                    : 'text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-warm-sand/50 border border-transparent'
                }`}
              >
                <tab.icon size={18} className={isActive ? 'text-anthropic-terracotta' : ''} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col relative bg-anthropic-pure-white h-full overflow-hidden">
        {/* Unsaved Changes Banner */}
        {isDirty && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-anthropic-warm-sand border-b border-anthropic-border-warm px-6 py-3 flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-2 text-anthropic-near-black font-medium text-sm">
              <AlertCircle size={16} className="text-anthropic-terracotta" />
              You have unsaved changes
            </div>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto p-10 ${isDirty ? 'mt-[49px]' : ''} scrollbar-hide`}>
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* ── GENERAL TAB ── */}
            {activeTab === 'general' && (
              <div className="animate-fade-in">
                <h1 className="text-section !text-[2rem] text-anthropic-near-black mb-6">General Settings</h1>
                
                <div className="space-y-6">
                  {/* Theme */}
                  <div className="glass-card p-6">
                    <h3 className="text-feature text-anthropic-near-black mb-1">Appearance</h3>
                    <p className="text-body-sm text-anthropic-stone-gray mb-4">Choose your preferred application theme.</p>
                    <div className="flex bg-anthropic-warm-sand/30 border border-anthropic-border-cream rounded-xl p-1 inline-flex">
                      {[
                        { id: 'light', icon: Sun, label: 'Light' },
                        { id: 'dark', icon: Moon, label: 'Dark' },
                        { id: 'system', icon: Monitor, label: 'System' }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => handleGeneralChange('theme', theme.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
                            general.theme === theme.id
                              ? 'bg-anthropic-pure-white shadow-sm text-anthropic-near-black border border-anthropic-border-warm'
                              : 'text-anthropic-stone-gray hover:text-anthropic-near-black hover:bg-anthropic-pure-white/50 border border-transparent'
                          }`}
                        >
                          <theme.icon size={16} />
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format & Locale */}
                  <div className="glass-card p-6 space-y-5">
                    <div>
                      <h3 className="text-feature text-anthropic-near-black mb-1">Default File Format</h3>
                      <p className="text-body-sm text-anthropic-stone-gray mb-3">Preferred export format for analysis results.</p>
                      <select 
                        value={general.format} 
                        onChange={(e) => handleGeneralChange('format', e.target.value)}
                        className="anthropic-input w-full max-w-xs"
                      >
                        <option value="csv">CSV (Comma Separated Values)</option>
                        <option value="xlsx">Excel (.xlsx)</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>

                    <div className="pt-5 border-t border-anthropic-border-cream">
                      <h3 className="text-feature text-anthropic-near-black mb-1">Language & Region</h3>
                      <p className="text-body-sm text-anthropic-stone-gray mb-3">Affects dates, numbers, and default prompt language.</p>
                      <select 
                        value={general.language} 
                        onChange={(e) => handleGeneralChange('language', e.target.value)}
                        className="anthropic-input w-full max-w-xs"
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-UK">English (UK)</option>
                        <option value="es-ES">Spanish</option>
                        <option value="fr-FR">French</option>
                      </select>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-feature text-anthropic-near-black mb-1">Email Alerts</h3>
                        <p className="text-body-sm text-anthropic-stone-gray">Receive email notifications for long-running analyses.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={general.emailAlerts}
                          onChange={(e) => handleGeneralChange('emailAlerts', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-anthropic-border-warm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anthropic-terracotta"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── BILLING TAB ── */}
            {activeTab === 'billing' && (
              <div className="animate-fade-in">
                <h1 className="text-section !text-[2rem] text-anthropic-near-black mb-6">Billing & Usage</h1>
                
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="glass-card p-6 flex items-center justify-between">
                    <div>
                      <p className="text-label text-anthropic-stone-gray uppercase tracking-widest font-bold mb-1">Current Plan</p>
                      <h3 className="text-[2rem] font-serif text-anthropic-near-black">Pro Tier</h3>
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-warm-sand px-4 py-2 text-sm">Downgrade</button>
                      <button className="btn-terracotta px-4 py-2 text-sm">Upgrade Plan</button>
                    </div>
                  </div>

                  {/* Usage Meter */}
                  <div className="glass-card p-6">
                    <h3 className="text-feature text-anthropic-near-black mb-4">Monthly Usage</h3>
                    <div className="flex justify-between text-body-sm text-anthropic-stone-gray mb-2">
                      <span>45 Analyses used</span>
                      <span>100 Limit</span>
                    </div>
                    <div className="w-full bg-anthropic-warm-sand rounded-full h-2.5 overflow-hidden">
                      <div className="bg-anthropic-terracotta h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-caption text-anthropic-stone-gray mt-3">Resets on May 1st, 2026</p>
                  </div>

                  {/* Payment Method */}
                  <div className="glass-card p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-anthropic-near-black rounded border border-anthropic-olive-gray flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">VISA</span>
                      </div>
                      <div>
                        <p className="text-body-std font-medium text-anthropic-near-black">•••• •••• •••• 4242</p>
                        <p className="text-caption text-anthropic-stone-gray">Expires 12/28</p>
                      </div>
                    </div>
                    <button className="text-anthropic-terracotta font-medium text-sm hover:underline">Edit Method</button>
                  </div>

                  {/* Billing History */}
                  <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-anthropic-border-cream bg-anthropic-ivory/50">
                      <h3 className="text-feature text-anthropic-near-black">Billing History</h3>
                    </div>
                    <table className="w-full text-left text-body-sm">
                      <thead className="bg-anthropic-parchment/30 text-anthropic-stone-gray">
                        <tr>
                          <th className="px-5 py-3 font-medium border-b border-anthropic-border-cream">Date</th>
                          <th className="px-5 py-3 font-medium border-b border-anthropic-border-cream">Amount</th>
                          <th className="px-5 py-3 font-medium border-b border-anthropic-border-cream text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-anthropic-border-cream">
                        {['Apr 1, 2026', 'Mar 1, 2026', 'Feb 1, 2026'].map((date, i) => (
                          <tr key={i} className="hover:bg-anthropic-warm-sand/10">
                            <td className="px-5 py-4 text-anthropic-near-black">{date}</td>
                            <td className="px-5 py-4 text-anthropic-near-black">$49.00</td>
                            <td className="px-5 py-4 text-right">
                              <button className="text-anthropic-stone-gray hover:text-anthropic-terracotta inline-flex p-1">
                                <Download size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ACCOUNT TAB ── */}
            {activeTab === 'account' && (
              <div className="animate-fade-in">
                <h1 className="text-section !text-[2rem] text-anthropic-near-black mb-6">Account Settings</h1>
                
                <div className="space-y-6">
                  {/* Profile */}
                  <div className="glass-card p-6 flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-anthropic-terracotta/20 border-2 border-anthropic-terracotta flex items-center justify-center shrink-0">
                      <User size={32} className="text-anthropic-terracotta" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <button className="btn-warm-sand px-4 py-2 text-sm">Upload Photo</button>
                      <p className="text-caption text-anthropic-stone-gray">JPG, GIF or PNG. Max size of 800K.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-label text-anthropic-stone-gray font-bold uppercase mb-1">Display Name</label>
                          <input 
                            type="text" 
                            className="anthropic-input w-full"
                            value={account.displayName}
                            onChange={(e) => handleAccountChange('displayName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-label text-anthropic-stone-gray font-bold uppercase mb-1">Email Address</label>
                          <input 
                            type="email" 
                            className="anthropic-input w-full"
                            value={account.email}
                            onChange={(e) => handleAccountChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-feature text-anthropic-near-black mb-4">Change Password</h3>
                    <div>
                      <label className="block text-label text-anthropic-stone-gray font-bold uppercase mb-1">Current Password</label>
                      <input 
                        type="password" 
                        className="anthropic-input w-full max-w-md"
                        value={account.currentPassword}
                        onChange={(e) => handleAccountChange('currentPassword', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                      <div>
                        <label className="block text-label text-anthropic-stone-gray font-bold uppercase mb-1">New Password</label>
                        <input 
                          type="password" 
                          className="anthropic-input w-full"
                          value={account.newPassword}
                          onChange={(e) => handleAccountChange('newPassword', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-label text-anthropic-stone-gray font-bold uppercase mb-1">Confirm New</label>
                        <input 
                          type="password" 
                          className="anthropic-input w-full"
                          value={account.confirmPassword}
                          onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-anthropic-error/5 border border-anthropic-error/30 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-feature text-anthropic-error font-medium">Delete Account</h3>
                      <p className="text-body-sm text-anthropic-error/70 mt-1">Permanently delete your account and all data.</p>
                    </div>
                    <button className="px-4 py-2 bg-anthropic-error text-white rounded-lg font-medium text-sm hover:brightness-110 transition-all">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── JAVAX TAB ── */}
            {activeTab === 'javax' && (
              <div className="animate-fade-in">
                <h1 className="text-section !text-[2rem] text-anthropic-near-black mb-6">javaX Settings</h1>
                
                <div className="space-y-6">
                  {/* Model & Limits */}
                  <div className="glass-card p-6 space-y-5">
                    <div>
                      <h3 className="text-feature text-anthropic-near-black mb-1">Default AI Model</h3>
                      <p className="text-body-sm text-anthropic-stone-gray mb-3">Select the underlying model for data analysis.</p>
                      <select 
                        value={javax.model} 
                        onChange={(e) => handleJavaxChange('model', e.target.value)}
                        className="anthropic-input w-full max-w-xs"
                      >
                        <option value="claude-3-opus">Claude 3.5 Opus</option>
                        <option value="claude-3-sonnet">Claude 3.5 Sonnet</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                      </select>
                    </div>

                    <div className="pt-5 border-t border-anthropic-border-cream">
                      <h3 className="text-feature text-anthropic-near-black mb-1">Max Dataset Size</h3>
                      <p className="text-body-sm text-anthropic-stone-gray mb-3">Limit maximum MB for uploads to conserve resources.</p>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          min="1"
                          className="anthropic-input w-24"
                          value={javax.maxSize}
                          onChange={(e) => handleJavaxChange('maxSize', parseInt(e.target.value) || 0)}
                        />
                        <span className="text-body-sm text-anthropic-stone-gray">MB</span>
                      </div>
                    </div>
                  </div>

                  {/* API & Webhooks */}
                  <div className="glass-card p-6 space-y-5">
                    <div>
                      <h3 className="text-feature text-anthropic-near-black mb-1">API Key</h3>
                      <p className="text-body-sm text-anthropic-stone-gray mb-3">Your secret key for programmatic access.</p>
                      <div className="flex items-center gap-2 max-w-md">
                        <input 
                          type="password" 
                          readOnly
                          className="anthropic-input w-full bg-anthropic-warm-sand/30 font-mono text-[13px]"
                          value={javax.apiKey}
                        />
                        <button className="p-2.5 bg-anthropic-warm-sand text-anthropic-near-black rounded-xl hover:bg-anthropic-warm-sand/50 transition-colors" title="Copy">
                          <Copy size={16} />
                        </button>
                        <button className="p-2.5 bg-anthropic-warm-sand text-anthropic-near-black rounded-xl hover:bg-anthropic-warm-sand/50 transition-colors" title="Regenerate">
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-anthropic-border-cream">
                      <h3 className="text-feature text-anthropic-near-black mb-1">Webhook URL</h3>
                      <p className="text-body-sm text-anthropic-stone-gray mb-3">Receive POST requests when long-running tasks complete.</p>
                      <input 
                        type="url" 
                        className="anthropic-input w-full max-w-md"
                        value={javax.webhook}
                        onChange={(e) => handleJavaxChange('webhook', e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-feature text-anthropic-near-black mb-1">Auto-generate Charts</h3>
                        <p className="text-body-sm text-anthropic-stone-gray">Instantly generate a summary chart upon dataset upload.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={javax.autoGenerate}
                          onChange={(e) => handleJavaxChange('autoGenerate', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-anthropic-border-warm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anthropic-terracotta"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bottom spacer for pinned save button */}
            <div className="h-16" />
          </div>
        </div>

        {/* Pinned Save Button */}
        <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-anthropic-pure-white via-anthropic-pure-white/95 to-transparent flex justify-end shrink-0 border-t border-anthropic-border-cream/50 pointer-events-none">
          <button 
            onClick={handleSave}
            disabled={!isDirty}
            className={`pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-whisper ${
              isDirty 
                ? 'bg-anthropic-terracotta text-white hover:brightness-110 active:scale-95' 
                : 'bg-anthropic-warm-sand text-anthropic-stone-gray opacity-50 cursor-not-allowed'
            }`}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
