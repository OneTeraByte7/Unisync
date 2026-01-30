Files added/modified by Copilot assistant:
- client/src/components/Toast.jsx (new): lightweight toast notification UI
- client/src/components/Header.jsx (replaced): enhanced header with profile dropdown and ARIA attributes
- client/src/components/SuitePasswordModal.jsx (modified): added password strength indicator, show/hide toggle, keyboard shortcut hint
- client/src/pages/Dashboard.jsx (modified): improved loading skeletons
- client/src/index.css (modified): added custom animations and scrollbar styles

Next recommended steps:
- Run the dev server: `npm run dev` in client folder
- Verify header interactions and toast placement
- Optionally wire a toast store (context) to show notifications from actions

If you want, I can add a small toast context provider and hook to show toasts from anywhere in the app.