import React, { useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { Globe, FileText, Megaphone, Loader2 } from 'lucide-react';

const Website = () => {
  const [data, setData] = useState({ pages: [], updates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getWebsite();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load HR website data', err);
        if (mounted) {
          setError('Internal portal updates are unavailable right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">HR website & portal</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Manage policy pages, benefits microsites, and navigation updates from one place. Every change can be synced to
          your static site generator or intranet automatically.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Loading portal content…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.5fr_1.5fr]">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Page governance</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                  {(data.pages || []).length} pages
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {(data.pages || []).map((page) => (
                  <article key={page.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-200">
                      <span className="font-semibold text-white">{page.title}</span>
                      <span className="text-xs text-gray-500">Updated {page.updated_at}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Owner • {page.owner}</p>
                    <p className="mt-2 text-xs text-gray-400">Status • {page.status}</p>
                  </article>
                ))}
              </div>
            </article>

            <aside className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Announcements</h2>
              </div>
              <div className="mt-4 space-y-3">
                {(data.updates || []).map((update) => (
                  <article key={update.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-200">
                    <p className="font-semibold text-white">{update.headline}</p>
                    <p className="mt-1 text-xs text-gray-500">Published {update.published_on}</p>
                    <p className="mt-1 text-xs text-gray-500">Author • {update.author}</p>
                  </article>
                ))}
              </div>
            </aside>
          </section>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
            <div className="flex items-center gap-3 font-medium">
              <Globe className="h-5 w-5" />
              Push these updates to your public careers site, internal wiki, and onboarding checklist automatically via the
              Supabase webhooks included in the schema below.
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Website;
