import React, { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';

const SUITE_NAMES = {
  erp: 'unisync suite',
  crm: 'CRM suite',
  hr: 'HR suite',
};

const SuitePasswordModal = ({ suite, value, onChange, onSubmit, onCancel, error }) => {
  const inputRef = useRef(null);
  const visible = Boolean(suite);
  const [copied, setCopied] = useState(false);

  const DEMO_PASSWORDS = {
    erp: 'erp123',
    crm: 'crm123',
    hr: 'hr123',
  };
  const demoPassword = DEMO_PASSWORDS[suite] || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(demoPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore copy errors
    }
  };

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [visible]);

  if (!visible) {
    return null;
  }

  const label = SUITE_NAMES[suite] || 'selected suite';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/95 p-6 shadow-2xl shadow-green-500/10">
        <div className="flex items-center space-x-3">
          <Lock className="h-6 w-6 text-green-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Unlock {label}</h2>
            <p className="text-sm text-gray-400">Enter the password to continue.</p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label htmlFor="suite-password" className="block text-xs font-medium uppercase tracking-[0.25em] text-gray-400">
              Access password
            </label>
            <input
              id="suite-password"
              ref={inputRef}
              type="password"
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40"
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {demoPassword ? (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400">Demo password: <span className="font-mono text-sm text-gray-100 ml-1">{demoPassword}</span></p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-3 rounded px-2 py-1 text-xs font-medium text-gray-200 bg-gray-800/60 hover:bg-gray-800/80"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/70"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuitePasswordModal;
