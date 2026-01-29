import React, { useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { ShieldCheck, UserCheck, MailPlus, ShieldAlert, Loader2 } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const Users = () => {
  const [data, setData] = useState({ accounts: [], pendingInvites: [], audit: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getUsers();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load HR users', err);
        if (mounted) {
          setError('Cannot load HR access registry just yet.');
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
        <h1 className="text-3xl font-bold text-white">HR users & access</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Audit who can approve payroll, view employee data, and ship policy updates. Invites and role changes stay in
          sync with the ERP user directory automatically.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Loading HR user registry…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.5fr_1.5fr]">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Active accounts</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  {(data.accounts || []).length} people
                </span>
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800 text-sm text-gray-200">
                  <thead className="bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Last seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {(data.accounts || []).map((account) => (
                      <tr key={account.id} className="transition hover:bg-gray-900/60">
                        <td className="px-4 py-3 font-medium text-white">{account.email}</td>
                        <td className="px-4 py-3 text-gray-300">{account.role}</td>
                        <td className="px-4 py-3 text-gray-200">{account.status}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(account.last_seen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
                <div className="flex items-center gap-3">
                  <MailPlus className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Pending invites</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {(data.pendingInvites || []).map((invite) => (
                    <article key={invite.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-200">
                      <p className="font-semibold text-white">{invite.email}</p>
                      <p className="mt-1 text-xs text-gray-500">Role • {invite.role}</p>
                      <p className="mt-1 text-xs text-gray-500">Invited • {invite.invited_on}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-300" />
                  <h2 className="text-lg font-semibold text-white">Audit log</h2>
                </div>
                <div className="mt-4 space-y-3 text-xs text-gray-300">
                  {(data.audit || []).map((entry) => (
                    <article key={entry.id} className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{formatDate(entry.created_at)}</span>
                        <span>{entry.actor}</span>
                      </div>
                      <p className="mt-2 font-medium text-white">{entry.action}</p>
                      {entry.target && <p className="mt-1 text-gray-400">Target • {entry.target}</p>}
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </>
      )}
    </section>
  );
};

export default Users;
