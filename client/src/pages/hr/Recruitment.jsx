import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import {
  Users,
  Briefcase,
  Timer,
  Sparkles,
  Target,
  TrendingUp,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  FolderPlus,
} from 'lucide-react';

const defaultJobForm = {
  title: '',
  department: '',
  hiringManager: '',
  status: 'Open',
  openings: 1,
  avgTimeToFill: '',
  offerAcceptance: '',
};

const defaultApplicationForm = {
  jobId: '',
  candidateName: '',
  stage: 'Applied',
  score: '',
  submittedOn: '',
  email: '',
  phone: '',
  notes: '',
};

const stageOptions = ['Applied', 'Screen', 'Interview', 'Offer', 'Hired', 'Rejected'];
const jobStatusOptions = ['Open', 'Sourcing', 'Interviewing', 'Offer', 'Filled', 'Closed'];

const Recruitment = () => {
  const [data, setData] = useState({ jobs: [], applications: [], pipeline: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [jobForm, setJobForm] = useState(defaultJobForm);
  const [jobFormVisible, setJobFormVisible] = useState(false);
  const [jobFormSubmitting, setJobFormSubmitting] = useState(false);
  const [jobFormError, setJobFormError] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);

  const [applicationForm, setApplicationForm] = useState(defaultApplicationForm);
  const [applicationFormVisible, setApplicationFormVisible] = useState(false);
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const [applicationError, setApplicationError] = useState('');
  const [editingApplicationId, setEditingApplicationId] = useState(null);

  const loadRecruitment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hrApi.getRecruitment();
      setData(response?.data ?? { jobs: [], applications: [], pipeline: [], metrics: {} });
      setError(null);
    } catch (err) {
      console.error('Failed to load recruitment data', err);
      setError('Unable to load recruitment data right now. Try refreshing in a minute.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruitment();
  }, [loadRecruitment]);

  const pipelineTotal = useMemo(() => {
    return (data.pipeline || []).reduce((acc, stage) => acc + (stage.count || 0), 0);
  }, [data.pipeline]);

  const metrics = {
    timeToHire: data.metrics?.timeToHire ?? 0,
    offerAcceptance: data.metrics?.offerAcceptance ?? 0,
    diversityPipeline: data.metrics?.diversityPipeline ?? 0,
  };

  const jobOptions = useMemo(() => data.jobs || [], [data.jobs]);

  const resetJobForm = () => {
    setJobForm(defaultJobForm);
    setJobFormError('');
    setEditingJobId(null);
  };

  const openJobForm = (job) => {
    if (job) {
      setJobForm({
        title: job.title ?? '',
        department: job.department ?? '',
        hiringManager: job.hiring_manager ?? '',
        status: job.status ?? 'Open',
        openings: job.openings ?? job.candidates ?? 1,
        avgTimeToFill: job.avg_time_to_fill ?? '',
        offerAcceptance: job.offer_acceptance ?? '',
      });
      setEditingJobId(job.id);
    } else {
      resetJobForm();
    }
    setJobFormVisible(true);
  };

  const closeJobForm = () => {
    setJobFormVisible(false);
    resetJobForm();
  };

  const handleJobChange = (field, value) => {
    setJobForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    setJobFormSubmitting(true);
    setJobFormError('');
    try {
      const payload = {
        title: jobForm.title,
        department: jobForm.department,
        hiringManager: jobForm.hiringManager,
        status: jobForm.status,
        openings: jobForm.openings ? Number(jobForm.openings) : null,
        avgTimeToFill: jobForm.avgTimeToFill ? Number(jobForm.avgTimeToFill) : null,
        offerAcceptance: jobForm.offerAcceptance ? Number(jobForm.offerAcceptance) : null,
      };

      if (editingJobId) {
        await hrApi.updateRecruitmentJob(editingJobId, payload);
      } else {
        await hrApi.createRecruitmentJob(payload);
      }

      await loadRecruitment();
      closeJobForm();
    } catch (err) {
      setJobFormError(err.response?.data?.error ?? 'Unable to save job right now.');
    } finally {
      setJobFormSubmitting(false);
    }
  };

  const handleJobDelete = async (id) => {
    if (!id) return;
    const confirmDelete = window.confirm('Delete this requisition? This cannot be undone.');
    if (!confirmDelete) return;
    try {
      await hrApi.deleteRecruitmentJob(id);
      await loadRecruitment();
    } catch (err) {
      console.error('Failed to delete recruitment job', err);
      alert('Could not delete the job. Please try again.');
    }
  };

  const resetApplicationForm = () => {
    setApplicationForm(defaultApplicationForm);
    setApplicationError('');
    setEditingApplicationId(null);
  };

  const openApplicationForm = (application) => {
    if (application) {
      setApplicationForm({
        jobId: application.job_id ?? '',
        candidateName: application.candidate_name ?? '',
        stage: application.stage ?? 'Applied',
        score: application.score ?? '',
        submittedOn: application.submitted_on ?? '',
        email: application.email ?? '',
        phone: application.phone ?? '',
        notes: application.notes ?? '',
      });
      setEditingApplicationId(application.id);
    } else {
      resetApplicationForm();
    }
    setApplicationFormVisible(true);
  };

  const closeApplicationForm = () => {
    setApplicationFormVisible(false);
    resetApplicationForm();
  };

  const handleApplicationChange = (field, value) => {
    setApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    setApplicationSubmitting(true);
    setApplicationError('');

    try {
      const payload = {
        jobId: applicationForm.jobId,
        candidateName: applicationForm.candidateName,
        stage: applicationForm.stage,
        score: applicationForm.score ? Number(applicationForm.score) : null,
        submittedOn: applicationForm.submittedOn,
        email: applicationForm.email,
        phone: applicationForm.phone,
        notes: applicationForm.notes,
      };

      if (editingApplicationId) {
        await hrApi.updateRecruitmentApplication(editingApplicationId, payload);
      } else {
        await hrApi.createRecruitmentApplication(payload);
      }

      await loadRecruitment();
      closeApplicationForm();
    } catch (err) {
      setApplicationError(err.response?.data?.error ?? 'Unable to save application right now.');
    } finally {
      setApplicationSubmitting(false);
    }
  };

  const handleApplicationDelete = async (id) => {
    if (!id) return;
    const confirmDelete = window.confirm('Remove this application? This cannot be undone.');
    if (!confirmDelete) return;
    try {
      await hrApi.deleteRecruitmentApplication(id);
      await loadRecruitment();
    } catch (err) {
      console.error('Failed to delete application', err);
      alert('Could not delete the application. Please try again.');
    }
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Recruitment pipeline</h1>
            <p className="max-w-3xl text-sm text-gray-400">
              Track every requisition and candidate touchpoint as they flow from sourcing through onboarding. Share live
              context with revenue and operations leaders so hiring decisions stay connected to demand.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openJobForm()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              New requisition
            </button>
            <button
              type="button"
              onClick={() => openApplicationForm()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700/70 bg-gray-900/70 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-emerald-500/50 hover:text-white"
            >
              <FolderPlus className="h-4 w-4" />
              Log candidate
            </button>
          </div>
        </div>
      </header>

      {jobFormVisible && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-200">
              <Briefcase className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">
                {editingJobId ? 'Update requisition' : 'Create requisition'}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeJobForm}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-2 text-emerald-100 transition hover:bg-emerald-500/25"
              aria-label="Close job form"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleJobSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Job title</span>
              <input
                value={jobForm.title}
                onChange={(event) => handleJobChange('title', event.target.value)}
                required
                placeholder="Revenue Enablement Manager"
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Department</span>
              <input
                value={jobForm.department}
                onChange={(event) => handleJobChange('department', event.target.value)}
                placeholder="People"
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Hiring manager</span>
              <input
                value={jobForm.hiringManager}
                onChange={(event) => handleJobChange('hiringManager', event.target.value)}
                placeholder="Jordan Kim"
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Status</span>
              <select
                value={jobForm.status}
                onChange={(event) => handleJobChange('status', event.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                {jobStatusOptions.map((option) => (
                  <option key={option} value={option} className="bg-gray-900 text-gray-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Openings</span>
              <input
                type="number"
                min="0"
                value={jobForm.openings}
                onChange={(event) => handleJobChange('openings', event.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Avg time to fill (days)</span>
              <input
                type="number"
                min="0"
                value={jobForm.avgTimeToFill}
                onChange={(event) => handleJobChange('avgTimeToFill', event.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Offer acceptance (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={jobForm.offerAcceptance}
                onChange={(event) => handleJobChange('offerAcceptance', event.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            {jobFormError && (
              <p className="md:col-span-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{jobFormError}</p>
            )}
            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeJobForm}
                className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={jobFormSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-md transition hover:bg-white"
              >
                {jobFormSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingJobId ? 'Update job' : 'Create job'}
              </button>
            </div>
          </form>
        </section>
      )}

      {applicationFormVisible && (
        <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 text-sm text-blue-100">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-200">
              <Users className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">
                {editingApplicationId ? 'Update candidate' : 'Log candidate'}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeApplicationForm}
              className="rounded-lg border border-blue-500/40 bg-blue-500/15 p-2 text-blue-100 transition hover:bg-blue-500/25"
              aria-label="Close application form"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleApplicationSubmit}>
            <label className="md:col-span-2 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Requisition</span>
              <select
                value={applicationForm.jobId}
                onChange={(event) => handleApplicationChange('jobId', event.target.value)}
                required
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="" className="bg-gray-900 text-gray-900">
                  Select job
                </option>
                {jobOptions.map((job) => (
                  <option key={job.id} value={job.id} className="bg-gray-900 text-gray-900">
                    {job.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Candidate name</span>
              <input
                value={applicationForm.candidateName}
                onChange={(event) => handleApplicationChange('candidateName', event.target.value)}
                required
                placeholder="Morgan Lee"
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Stage</span>
              <select
                value={applicationForm.stage}
                onChange={(event) => handleApplicationChange('stage', event.target.value)}
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              >
                {stageOptions.map((option) => (
                  <option key={option} value={option} className="bg-gray-900 text-gray-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Score</span>
              <input
                type="number"
                step="0.1"
                value={applicationForm.score}
                onChange={(event) => handleApplicationChange('score', event.target.value)}
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Submitted on</span>
              <input
                type="date"
                value={applicationForm.submittedOn}
                onChange={(event) => handleApplicationChange('submittedOn', event.target.value)}
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Email</span>
              <input
                type="email"
                value={applicationForm.email}
                onChange={(event) => handleApplicationChange('email', event.target.value)}
                placeholder="morgan.lee@example.com"
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Phone</span>
              <input
                value={applicationForm.phone}
                onChange={(event) => handleApplicationChange('phone', event.target.value)}
                placeholder="+1 (555) 010-2020"
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="md:col-span-2 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-blue-200/80">Notes</span>
              <textarea
                value={applicationForm.notes}
                onChange={(event) => handleApplicationChange('notes', event.target.value)}
                rows={3}
                className="rounded-lg border border-blue-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
              />
            </label>
            {applicationError && (
              <p className="md:col-span-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{applicationError}</p>
            )}
            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeApplicationForm}
                className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:border-blue-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applicationSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-blue-900 shadow-md transition hover:bg-white"
              >
                {applicationSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingApplicationId ? 'Update candidate' : 'Log candidate'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Fetching pipeline intelligence…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-inner shadow-emerald-500/10">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-gray-200">Time to hire</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{metrics.timeToHire ?? '—'} days</p>
              <p className="mt-2 text-xs text-gray-500">Average days to fill across active roles.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-inner shadow-blue-500/10">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Offer acceptance</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{metrics.offerAcceptance ?? '—'}%</p>
              <p className="mt-2 text-xs text-gray-500">Closed offers compared to offers extended.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-inner shadow-purple-500/10">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-gray-200">Diversity pipeline</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{metrics.diversityPipeline ?? '—'}%</p>
              <p className="mt-2 text-xs text-gray-500">Share of candidates from underrepresented groups.</p>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Open requisitions</h2>
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <Briefcase className="h-3.5 w-3.5" />
                  {(data.jobs || []).length} active roles
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800 text-sm text-gray-200">
                  <thead className="bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Hiring manager</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Openings</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {(data.jobs || []).map((job) => (
                      <tr key={job.id} className="transition hover:bg-gray-900/60">
                        <td className="px-4 py-3 font-medium text-white">{job.title}</td>
                        <td className="px-4 py-3 text-gray-300">{job.department || '—'}</td>
                        <td className="px-4 py-3 text-gray-300">{job.hiring_manager || '—'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {job.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-200">{job.openings ?? job.candidates ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openJobForm(job)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-700/70 bg-gray-900/60 px-3 py-1 text-xs font-medium text-gray-200 transition hover:border-emerald-500/40 hover:text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleJobDelete(job.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h2 className="text-lg font-semibold text-white">Stage distribution</h2>
              <div className="space-y-4">
                {(data.pipeline || []).map((stage) => {
                  const percentage = pipelineTotal ? Math.round((stage.count / pipelineTotal) * 100) : 0;
                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{stage.stage}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
                Keep this pipeline synced with CRM opportunities to visualize hiring dependencies alongside revenue
                targets.
              </div>
            </aside>
          </div>

          <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Candidate radar</h2>
                <p className="text-xs text-gray-500">Surface priority candidates and their latest touchpoints.</p>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200">
                <Users className="h-3.5 w-3.5" />
                {(data.applications || []).length} applications
              </span>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {(data.applications || []).map((candidate) => (
                <article key={candidate.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{candidate.candidate_name}</h3>
                      <p className="text-sm text-gray-400">{candidate.job_title || candidate.job_name || '—'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openApplicationForm(candidate)}
                        className="rounded-lg border border-gray-700/70 bg-gray-900/60 p-2 text-xs text-gray-200 transition hover:border-blue-500/40 hover:text-white"
                        aria-label="Edit candidate"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplicationDelete(candidate.id)}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200 transition hover:bg-red-500/20"
                        aria-label="Delete candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-200">
                      {candidate.stage}
                    </span>
                    <span className="text-gray-500">Score {candidate.score ?? '—'}</span>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">Submitted {candidate.submitted_on || '—'}</p>
                  {candidate.notes && <p className="mt-3 text-xs text-gray-400">Notes • {candidate.notes}</p>}
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
};

export default Recruitment;
