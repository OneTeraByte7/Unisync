// src/components/Header.jsx
import React from 'react';
import { Package, Building2, Users } from 'lucide-react';

const SUITE_LABELS = {
  erp: {
    title: 'SupplyChain ERP',
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
  { value: 'erp', label: 'ERP Suite' },
  { value: 'crm', label: 'CRM Suite' },
  { value: 'hr', label: 'HR Suite' },
];

const Header = ({ activeSuite, onSuiteChange }) => {
  const currentSuite = SUITE_LABELS[activeSuite] || SUITE_LABELS.erp;
  const SuiteIcon = currentSuite.icon || Package;

  return (
    <header className="flex items-center justify-between border-b border-gray-800/70 bg-gray-900/80 px-6 py-4 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.35)]">
      <div className="flex items-center space-x-3">
        <SuiteIcon className="w-8 h-8 text-green-500" />
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
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-white">Admin User</p>
          <p className="text-xs text-gray-400">admin@company.com</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;