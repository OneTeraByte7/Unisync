// src/components/KeyboardShortcuts.jsx
import React, { useState, useEffect } from 'react';
import { Command, X } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open command palette' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy demo password' },
  { keys: ['Esc'], description: 'Close dialogs' },
  { keys: ['/', '?'], description: 'Search' },
  { keys: ['Alt', '1-9'], description: 'Quick navigation' },
];

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/90 transition shadow-lg z-40"
        title="Keyboard Shortcuts (Ctrl + /)"
        aria-label="Show keyboard shortcuts"
      >
        <Command size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/95 backdrop-blur-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Command size={20} className="text-green-400" />
            <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
              <span className="text-sm text-gray-300">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-gray-500 mx-1">+</span>}
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-800 border border-gray-700 rounded text-gray-300">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-center text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
