import React, { useCallback, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AgentPanel = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pushMessage = useCallback((message) => {
    setMessages((prev) => [message, ...prev].slice(0, 25));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;

    const userEntry = { role: 'user', content: command, timestamp: Date.now() };
    pushMessage(userEntry);
    setInput('');

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/agent/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const payload = await response.json();
      const assistantEntry = {
        role: 'assistant',
        content:
          payload?.success
            ? payload.summary || 'Done.'
            : payload?.error || 'The agent could not complete that action.',
        data: payload?.data,
        success: payload?.success,
        timestamp: Date.now(),
      };
      pushMessage(assistantEntry);
    } catch (error) {
      console.error('Agent request failed', error);
      pushMessage({
        role: 'assistant',
        content: 'Agent request failed. Check your network or server logs.',
        success: false,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex h-full flex-col gap-3 rounded-2xl border border-emerald-500/40 bg-gray-950/70 p-4 text-sm text-emerald-50">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">AI agent</h2>
          <p className="text-xs text-emerald-200/70">Issue quick CRUD commands in plain language.</p>
        </div>
        {loading && <span className="text-xs text-emerald-200/60">Executing…</span>}
      </header>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={"e.g. create recruitment job title=\"Support Manager\""}
          className="flex-1 rounded-xl border border-emerald-500/30 bg-gray-950/80 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
          disabled={loading}
        >
          Send
        </button>
      </form>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-xs text-emerald-200/60">Agent responses will appear here.</p>
        ) : (
          messages.map((message) => (
            <article
              key={message.timestamp + message.role}
              className={`rounded-xl border px-3 py-2 ${
                message.role === 'user'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                  : message.success
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-50'
                  : 'border-red-500/40 bg-red-500/10 text-red-100'
              }`}
            >
              <header className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em]">
                <span>{message.role === 'user' ? 'You' : 'Agent'}</span>
                <time className="text-[10px] lowercase text-emerald-200/60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </time>
              </header>
              <p className="mt-2 text-sm leading-relaxed">{message.content}</p>
              {message.data && message.success && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/40 p-2 text-[11px] text-emerald-100">
                  {JSON.stringify(message.data, null, 2)}
                </pre>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default AgentPanel;
