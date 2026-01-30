// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Package, Building2, Users, User, Settings, LogOut, Bell, HelpCircle } from 'lucide-react';

const SUITE_LABELS = {
  erp: {
    title: 'unisync',
    subtitle: 'Operations Center',
    icon: Package,
  },
  crm: {
    title: 'Revenue CRM',
    subtitle: 'Growth Workspace',
    icon: Building2,
  },
  hr: {
    title: 'People HR',
    subtitle: 'People Operations Hub',
    icon: Users,
  },
};

const suiteOptions = [
  { value: 'erp', label: 'unisync' },
  { value: 'crm', label: 'CRM Suite' },
  { value: 'hr', label: 'HR Suite' },
];

const Header = ({ activeSuite, onSuiteChange }) => {
  const currentSuite = SUITE_LABELS[activeSuite] || SUITE_LABELS.erp;
  const SuiteIcon = currentSuite.icon || Package;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications] = useState(3);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen]);

  return (
    <header className="flex items-center justify-between border-b border-gray-800/70 bg-gray-900/80 px-6 py-4 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.35)]" role="banner">
      <div className="flex items-center space-x-3">
        <SuiteIcon className="w-8 h-8 text-green-500" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-white">{currentSuite.title}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest">{currentSuite.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center text-sm text-gray-300 space-x-2" htmlFor="suite-selector">
          <span className="hidden sm:inline">Workspace</span>
          <select
            id="suite-selector"
            value={activeSuite}
            onChange={(event) => onSuiteChange?.(event.target.value)}
            aria-label="Select workspace suite"
            className="rounded-lg border border-gray-700/70 bg-gray-900/60 px-3 py-2 text-sm text-gray-100 shadow-inner focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
          >
            {suiteOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
                {option.disabled ? ' (soon)' : ''}
              </option>
            ))}
          </select>
        </label>
        
        {/* Notifications */}
        <button 
          className="relative p-2 text-gray-400 hover:text-gray-200 transition rounded-lg hover:bg-gray-800/50"
          aria-label={`${notifications} notifications`}
          title="Notifications"
        >
          <Bell size={20} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Help */}
        <button 
          className="p-2 text-gray-400 hover:text-gray-200 transition rounded-lg hover:bg-gray-800/50"
          aria-label="Help"
          title="Help & Documentation"
        >
          <HelpCircle size={20} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-800/50 transition"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="text-right leading-tight hidden md:block">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@company.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-800 bg-gray-900/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-semibold text-white">Admin User</p>
                <p className="text-xs text-gray-400 mt-0.5">admin@company.com</p>
              </div>
              <nav className="py-2" role="menu">
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition" role="menuitem">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition" role="menuitem">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <div className="my-1 border-t border-gray-800"></div>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800/50 hover:text-red-300 transition" role="menuitem">
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
