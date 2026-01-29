import React, { useEffect, useMemo, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { KanbanSquare, UsersRound, GaugeCircle, Loader2 } from 'lucide-react';

const Projects = () => {
  const [data, setData] = useState({ projects: [], capacity: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getProjects();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load HR projects', err);
        if (mounted) {
          setError('Could not reach HR project tracker.');
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

  const capacity = useMemo(
    () => ({
      availableHours: data.capacity?.availableHours ?? 0,
      allocatedHours: data.capacity?.allocatedHours ?? 0,
      utilization: data.capacity?.utilization ?? 0,
    }),
    [data.capacity]
  );

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">People projects</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Coordinate HR programs, enablement workstreams, and cross-functional initiatives using a live capacity view.
          Sync budget and staffing signals back to ERP so projects stay funded and staffed.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Loading project backlog…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <UsersRound className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-gray-200">Available capacity</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{capacity.availableHours} hrs</p>
              <p className="mt-2 text-xs text-gray-500">People hours available for upcoming work.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <KanbanSquare className="h-5 w-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Allocated</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{capacity.allocatedHours} hrs</p>
              <p className="mt-2 text-xs text-gray-500">Hours already planned across initiatives.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <GaugeCircle className="h-5 w-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-gray-200">Utilization</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{capacity.utilization}%</p>
              <p className="mt-2 text-xs text-gray-500">Total rewards, people ops, and HRBP workload share.</p>
            </article>
          </div>

          <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Active projects</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                {(data.projects || []).length} workstreams
              </span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {(data.projects || []).map((project) => (
                <article key={project.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-5">
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span className="font-semibold text-white">{project.name}</span>
                    <span className="text-xs text-gray-500">Due {project.due_on}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Lead • {project.lead}</p>
                  <p className="mt-3 text-xs text-gray-400">Status • {project.status}</p>
                  <p className="mt-3 text-xs text-gray-400">Contributors • {project.contributors ?? project.assignees_count ?? '—'}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
};

export default Projects;
