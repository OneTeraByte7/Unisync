const supabase = require('../utils/supabaseClient');
const { isMissingTableError, respondWithError, trimOrNull, parseNumber } = require('../utils/controllerUtils');

const TABLES = {
  dashboardMetrics: 'hr_dashboard_metrics',
  recruitmentJobs: 'hr_recruitment_jobs',
  recruitmentApplications: 'hr_recruitment_applications',
  lifecycleEvents: 'hr_employee_lifecycle_events',
  performanceReviews: 'hr_performance_reviews',
  performanceGoals: 'hr_performance_goals',
  shiftSchedules: 'hr_shift_schedules',
  attendanceLogs: 'hr_attendance_logs',
  expenseClaims: 'hr_expense_claims',
  leaveBalances: 'hr_leave_balances',
  leaveRequests: 'hr_leave_requests',
  projects: 'hr_projects',
  projectAssignments: 'hr_project_assignments',
  users: 'hr_users',
  userInvites: 'hr_user_invites',
  auditLog: 'hr_audit_log',
  websitePages: 'hr_website_pages',
  websiteUpdates: 'hr_website_updates',
  payrollRuns: 'hr_payroll_runs',
  payrollAdjustments: 'hr_payroll_adjustments',
  payrollBenefits: 'hr_payroll_benefits',
};

const safeExecute = async (query, fallback = []) => {
  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) {
      return fallback;
    }
    throw error;
  }
  return data ?? fallback;
};

const sanitizeArray = (value) => (Array.isArray(value) ? value : []);

const camelCaseKey = (key) => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const stripUndefined = (object) =>
  Object.fromEntries(Object.entries(object || {}).filter(([, value]) => value !== undefined));

const mutateSingleRow = async (query, { fallback } = {}) => {
  const { data, error } = await query;
  if (error) {
    if ((error.code === 'PGRST116' || error.code === 'PGRST114') && fallback !== undefined) {
      return fallback;
    }
    if (isMissingTableError(error) && fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
  return data;
};

const requireId = (res, id, resourceLabel = 'record') => {
  if (!id) {
    respondWithError(res, new Error('Missing identifier'), {
      defaultMessage: `Missing ${resourceLabel} identifier`,
      status: 400,
    });
    return false;
  }
  return true;
};

const buildRecruitmentJobPayload = (input, { partial = false } = {}) => {
  const mapped = {
    title: trimOrNull(input.title),
    department: trimOrNull(input.department),
    hiring_manager: trimOrNull(input.hiringManager ?? input.hiring_manager),
    status: trimOrNull(input.status),
    candidates:
      input.candidates !== undefined && input.candidates !== null
        ? parseNumber(input.candidates, null)
        : undefined,
    avg_time_to_fill:
      input.avg_time_to_fill !== undefined || input.avgTimeToFill !== undefined
        ? parseNumber(input.avgTimeToFill ?? input.avg_time_to_fill, null)
        : undefined,
    offer_acceptance:
      input.offer_acceptance !== undefined || input.offerAcceptance !== undefined
        ? parseNumber(input.offerAcceptance ?? input.offer_acceptance, null)
        : undefined,
    openings:
      input.openings !== undefined && input.openings !== null
        ? parseNumber(input.openings, null)
        : undefined,
    diversity_ratio:
      input.diversity_ratio !== undefined || input.diversityRatio !== undefined
        ? parseNumber(input.diversityRatio ?? input.diversity_ratio, null)
        : undefined,
  };

  if (!partial) {
    return stripUndefined(mapped);
  }

  return stripUndefined(
    Object.fromEntries(
      Object.entries(mapped).filter(([key]) => input[key] !== undefined || input[camelCaseKey(key)] !== undefined)
    )
  );
};

const buildRecruitmentApplicationPayload = (input, { partial = false } = {}) => {
  const mapped = {
    job_id: trimOrNull(input.job_id ?? input.jobId),
    candidate_name: trimOrNull(input.candidate_name ?? input.candidateName),
    stage: trimOrNull(input.stage),
    score:
      input.score !== undefined && input.score !== null
        ? parseNumber(input.score, null)
        : undefined,
    submitted_on: trimOrNull(input.submitted_on ?? input.submittedOn),
    email: trimOrNull(input.email),
    phone: trimOrNull(input.phone),
    resume_url: trimOrNull(input.resume_url ?? input.resumeUrl),
    notes: trimOrNull(input.notes),
  };

  if (!partial) {
    return stripUndefined(mapped);
  }

  return stripUndefined(
    Object.fromEntries(
      Object.entries(mapped).filter(([key]) => input[key] !== undefined || input[camelCaseKey(key)] !== undefined)
    )
  );
};

const buildLeaveRequestPayload = (input, { partial = false } = {}) => {
  const mapped = {
    employee_id: trimOrNull(input.employee_id ?? input.employeeId),
    employee_name: trimOrNull(input.employee_name ?? input.employeeName),
    leave_type: trimOrNull(input.leave_type ?? input.leaveType ?? input.type),
    start_date: trimOrNull(input.start_date ?? input.startDate),
    end_date: trimOrNull(input.end_date ?? input.endDate),
    status: trimOrNull(input.status),
    approver: trimOrNull(input.approver),
    notes: trimOrNull(input.notes ?? input.reason),
  };

  if (!partial) {
    return stripUndefined(mapped);
  }

  return stripUndefined(
    Object.fromEntries(
      Object.entries(mapped).filter(([key]) => input[key] !== undefined || input[camelCaseKey(key)] !== undefined)
    )
  );
};

const buildExpenseClaimPayload = (input, { partial = false } = {}) => {
  const mapped = {
    employee_name: trimOrNull(input.employee_name ?? input.employeeName),
    category: trimOrNull(input.category),
    amount:
      input.amount !== undefined && input.amount !== null
        ? parseNumber(input.amount, 0)
        : undefined,
    status: trimOrNull(input.status),
    submitted_on: trimOrNull(input.submitted_on ?? input.submittedOn),
    reimbursement_date: trimOrNull(input.reimbursement_date ?? input.reimbursementDate),
    notes: trimOrNull(input.notes),
    receipt_url: trimOrNull(input.receipt_url ?? input.receiptUrl),
  };

  if (!partial) {
    return stripUndefined(mapped);
  }

  return stripUndefined(
    Object.fromEntries(
      Object.entries(mapped).filter(([key]) => input[key] !== undefined || input[camelCaseKey(key)] !== undefined)
    )
  );
};

const buildProjectPayload = (input, { partial = false } = {}) => {
  const mapped = {
    name: trimOrNull(input.name),
    lead: trimOrNull(input.lead),
    status: trimOrNull(input.status),
    due_on: trimOrNull(input.due_on ?? input.dueOn),
    contributors: sanitizeArray(input.contributors ?? input.contributorsList ?? input.contributors_json ?? input.contributorsJson),
    notes: trimOrNull(input.notes),
  };

  if (!partial) {
    return stripUndefined(mapped);
  }

  return stripUndefined(
    Object.fromEntries(
      Object.entries(mapped).filter(([key]) => input[key] !== undefined || input[camelCaseKey(key)] !== undefined)
    )
  );
};

const mapAssignmentInput = (assignments = []) =>
  sanitizeArray(assignments)
    .map((item) => ({
      employee_id: trimOrNull(item.employee_id ?? item.employeeId ?? item.employeeCode),
      employee_name: trimOrNull(item.employee_name ?? item.employeeName),
      hours_allocated:
        item.hours_allocated !== undefined || item.hoursAllocated !== undefined
          ? parseNumber(item.hoursAllocated ?? item.hours_allocated, 0)
          : 0,
    }))
    .filter((item) => item.employee_name);

const getHrDashboardSummary = async (_req, res) => {
  try {
    const metrics = await safeExecute(
      supabase
        .from(TABLES.dashboardMetrics)
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(1),
      []
    );

    const latest = metrics[0] || {};

    res.json({
      success: true,
      data: {
        headcount: latest.headcount ?? 0,
        openRoles: latest.open_roles ?? 0,
        pendingOffers: latest.pending_offers ?? 0,
        attritionRate: latest.attrition_rate ?? 0,
        hiringVelocity: latest.avg_time_to_fill ?? 0,
        engagementScore: latest.engagement_score ?? 0,
        upcomingActions: Array.isArray(latest.upcoming_actions) ? latest.upcoming_actions : [],
      },
    });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load HR dashboard summary',
      fallbackData: {
        headcount: 0,
        openRoles: 0,
        pendingOffers: 0,
        attritionRate: 0,
        hiringVelocity: 0,
        engagementScore: 0,
        upcomingActions: [],
      },
    });
  }
};

const getRecruitmentSummary = async (_req, res) => {
  try {
    const [jobs, applications] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.recruitmentJobs)
          .select('*')
          .order('updated_at', { ascending: false }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.recruitmentApplications)
          .select('*')
          .order('submitted_on', { ascending: false }),
        []
      ),
    ]);

    const pipeline = applications.reduce((acc, application) => {
      const stage = (application.stage || 'Unknown').trim();
      const existing = acc.find((item) => item.stage === stage);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ stage, count: 1 });
      }
      return acc;
    }, []);

    const metrics = {
      timeToHire:
        jobs.length > 0
          ? jobs.reduce((acc, job) => acc + (job.avg_time_to_fill || 0), 0) / jobs.length
          : 0,
      offerAcceptance:
        jobs.length > 0
          ? jobs.reduce((acc, job) => acc + (job.offer_acceptance || 0), 0) / jobs.length
          : 0,
      diversityPipeline:
        pipeline.length > 0
          ? pipeline.reduce((acc, stage) => acc + (stage.diversity_ratio || 0), 0) / pipeline.length
          : 0,
    };

    res.json({ success: true, data: { jobs, applications, pipeline, metrics } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load recruitment pipeline',
      fallbackData: { jobs: [], applications: [], pipeline: [], metrics: { timeToHire: 0, offerAcceptance: 0, diversityPipeline: 0 } },
    });
  }
};

const getEmployeeLifecycle = async (_req, res) => {
  try {
    const [events, milestones] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.lifecycleEvents)
          .select('*')
          .order('effective_date', { ascending: true }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.lifecycleEvents)
          .select('*')
          .order('effective_date', { ascending: true })
          .limit(6),
        []
      ),
    ]);

    const normalizedMilestones = milestones.map((item) => ({
      id: item.id,
      title: item.title || item.event_type || item.notes || 'Lifecycle milestone',
      owner: item.owner || item.employee_name || 'Unassigned',
      due_on: item.effective_date,
      status: item.status || item.event_status || 'Planned',
      notes: item.notes,
    }));

    res.json({ success: true, data: { events, milestones: normalizedMilestones } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load employee lifecycle timeline',
      fallbackData: { events: [], milestones: [] },
    });
  }
};

const getPerformanceData = async (_req, res) => {
  try {
    const [reviews, goalStats] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.performanceReviews)
          .select('*')
          .order('submitted_on', { ascending: false })
          .limit(25),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.performanceGoals)
          .select('status, count:id')
          .group('status'),
        []
      ),
    ]);

    const goals = goalStats.length
      ? goalStats.reduce(
          (acc, row) => {
            const key = row.status?.toLowerCase() || 'unknown';
            if (key.includes('complete')) {
              acc.completed += row.count;
            } else if (key.includes('risk') || key.includes('late')) {
              acc.atRisk += row.count;
            } else {
              acc.inProgress += row.count;
            }
            return acc;
          },
          { completed: 0, inProgress: 0, atRisk: 0 }
        )
      : { completed: 0, inProgress: 0, atRisk: 0 };

    res.json({ success: true, data: { reviews, heatmap: [], goals } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load performance reviews',
      fallbackData: { reviews: [], heatmap: [], goals: { completed: 0, inProgress: 0, atRisk: 0 } },
    });
  }
};

const getShiftAttendance = async (_req, res) => {
  try {
    const [schedules, attendance] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.shiftSchedules)
          .select('*')
          .order('shift_date', { ascending: true })
          .limit(50),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.attendanceLogs)
          .select('*')
          .order('shift_date', { ascending: false })
          .limit(50),
        []
      ),
    ]);

    const totalAttendance = attendance.length;
    const onTime = totalAttendance
      ? attendance.filter((entry) => {
          if (entry.variance_minutes === null || entry.variance_minutes === undefined) {
            return (entry.status || '').toLowerCase() === 'present';
          }
          return Number(entry.variance_minutes) <= 5;
        }).length
      : 0;

    const coverageSummary = {
      onTimeRate: totalAttendance ? Math.round((onTime / totalAttendance) * 100) : 0,
      overtimeHours: Number(
        attendance.reduce((acc, entry) => acc + Math.max(Number(entry.variance_minutes) || 0, 0), 0) / 60
      ).toFixed(1),
      vacancies: schedules.filter((schedule) => Number(schedule.coverage) < 95).length,
    };

    coverageSummary.overtimeHours = Number(coverageSummary.overtimeHours);

    res.json({ success: true, data: { schedules, attendance, coverage: coverageSummary } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load shift and attendance data',
      fallbackData: { schedules: [], attendance: [], coverage: { onTimeRate: 0, overtimeHours: 0, vacancies: 0 } },
    });
  }
};

const getExpenseClaims = async (_req, res) => {
  try {
    const claims = await safeExecute(
      supabase
        .from(TABLES.expenseClaims)
        .select('*')
        .order('submitted_on', { ascending: false })
        .limit(50),
      []
    );

    const totals = claims.length
      ? claims.reduce(
          (acc, claim) => {
            const amount = Number(claim.amount) || 0;
            if (['approved', 'paid', 'reimbursed'].includes((claim.status || '').toLowerCase())) {
              acc.reimbursed += amount;
            } else {
              acc.pending += amount;
            }
            acc.monthToDate += amount;
            return acc;
          },
          { monthToDate: 0, pending: 0, reimbursed: 0 }
        )
      : { monthToDate: 0, pending: 0, reimbursed: 0 };

    res.json({ success: true, data: { claims, totals } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load expense claims',
      fallbackData: { claims: [], totals: { monthToDate: 0, pending: 0, reimbursed: 0 } },
    });
  }
};

const getLeaveData = async (_req, res) => {
  try {
    const [balances, requests] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.leaveBalances)
          .select('*')
          .order('employee_name', { ascending: true }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.leaveRequests)
          .select('*')
          .order('start_date', { ascending: false })
          .limit(50),
        []
      ),
    ]);

    const stats = requests.length
      ? requests.reduce(
          (acc, request) => {
            const status = (request.status || '').toLowerCase();
            if (status.includes('approve')) {
              acc.approved += 1;
            } else if (status.includes('pending') || status.includes('await')) {
              acc.pending += 1;
            } else {
              acc.declined += 1;
            }
            return acc;
          },
          { approved: 0, pending: 0, declined: 0 }
        )
      : { approved: 0, pending: 0, declined: 0 };

    res.json({ success: true, data: { balances, requests, stats } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load leave management data',
      fallbackData: { balances: [], requests: [], stats: { approved: 0, pending: 0, declined: 0 } },
    });
  }
};

const getProjects = async (_req, res) => {
  try {
    const [projects, assignments] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.projects)
          .select('*')
          .order('due_on', { ascending: true }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.projectAssignments)
          .select('*'),
        []
      ),
    ]);

    const uniqueContributors = new Set(
      assignments.map((assignment) => assignment.employee_id || assignment.employee_name)
    ).size;
    const allocatedHours = assignments.reduce((acc, record) => acc + (Number(record.hours_allocated) || 0), 0);
    const theoreticalCapacity = uniqueContributors * 40; // assume 40 hours per contributor per cycle
    const availableHours = Math.max(theoreticalCapacity - allocatedHours, 0);
    const utilization = theoreticalCapacity
      ? Math.min(100, Math.round((allocatedHours / theoreticalCapacity) * 100))
      : 0;

    const capacity = {
      availableHours,
      allocatedHours,
      utilization,
    };

    res.json({ success: true, data: { projects, capacity } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load HR projects',
      fallbackData: { projects: [], capacity: { availableHours: 0, allocatedHours: 0, utilization: 0 } },
    });
  }
};

const getUsers = async (_req, res) => {
  try {
    const [accounts, invites, audit] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.users)
          .select('*')
          .order('email', { ascending: true }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.userInvites)
          .select('*')
          .order('invited_on', { ascending: false }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.auditLog)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        []
      ),
    ]);

    res.json({ success: true, data: { accounts, pendingInvites: invites, audit } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load HR users',
      fallbackData: { accounts: [], pendingInvites: [], audit: [] },
    });
  }
};

const getWebsite = async (_req, res) => {
  try {
    const [pages, updates] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.websitePages)
          .select('*')
          .order('updated_at', { ascending: false }),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.websiteUpdates)
          .select('*')
          .order('published_on', { ascending: false }),
        []
      ),
    ]);

    res.json({ success: true, data: { pages, updates } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load HR website content',
      fallbackData: { pages: [], updates: [] },
    });
  }
};

const getPayrollSummary = async (_req, res) => {
  try {
    const [runs, adjustments] = await Promise.all([
      safeExecute(
        supabase
          .from(TABLES.payrollRuns)
          .select('*')
          .order('disbursement_date', { ascending: false })
          .limit(3),
        []
      ),
      safeExecute(
        supabase
          .from(TABLES.payrollAdjustments)
          .select('*')
          .order('effective_date', { ascending: false })
          .limit(10),
        []
      ),
    ]);

    const totals = runs.reduce(
      (acc, run) => {
        acc.netPay += Number(run.net_pay) || 0;
        acc.taxes += Number(run.total_taxes) || 0;
        acc.benefits += Number(run.total_benefits) || 0;
        return acc;
      },
      { netPay: 0, taxes: 0, benefits: 0 }
    );

    const latestRun = runs[0];
    const progress = latestRun
      ? {
          currentStep: latestRun.approvals_complete ? 'Completed' : latestRun.status || 'In progress',
          nextCutoff: latestRun.period_end || latestRun.disbursement_date || null,
          riskLevel: latestRun.status && latestRun.status.toLowerCase().includes('hold')
            ? 'High'
            : latestRun.approvals_complete
            ? 'Low'
            : 'Medium',
        }
      : { currentStep: 'No runs recorded', nextCutoff: null, riskLevel: 'Unknown' };

    const alerts = adjustments.slice(0, 5).map((adjustment) => {
      const amount = Number(adjustment.amount) || 0;
      const severity = Math.abs(amount) >= 5000 ? 'high' : Math.abs(amount) >= 1000 ? 'medium' : 'low';
      const employee = adjustment.employee_name || 'Unnamed employee';
      return {
        id: adjustment.id,
        severity,
        message: `${adjustment.adjustment_type || 'Adjustment'} for ${employee} (${amount < 0 ? '-' : ''}$${Math.abs(
          amount
        ).toLocaleString()})`,
      };
    });

    res.json({
      success: true,
      data: {
        runs,
        totals,
        progress,
        alerts,
      },
    });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load payroll summary',
      fallbackData: { runs: [], totals: { netPay: 0, taxes: 0, benefits: 0 }, progress: { currentStep: 'No data', nextCutoff: null, riskLevel: 'Unknown' }, alerts: [] },
    });
  }
};

const getPayrollRuns = async (_req, res) => {
  try {
    const runs = await safeExecute(
      supabase
        .from(TABLES.payrollRuns)
        .select('*')
        .order('disbursement_date', { ascending: false })
        .limit(12),
      []
    );

    res.json({ success: true, data: { runs } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load payroll runs',
      fallbackData: { runs: [] },
    });
  }
};

const getPayrollBenefits = async (_req, res) => {
  try {
    const benefits = await safeExecute(
      supabase
        .from(TABLES.payrollBenefits)
        .select('*')
        .order('name', { ascending: true }),
      []
    );

    const adjustments = await safeExecute(
      supabase
        .from(TABLES.payrollAdjustments)
        .select('*')
        .order('effective_date', { ascending: false })
        .limit(25),
      []
    );

    res.json({ success: true, data: { benefits, adjustments } });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to load tax and benefits data',
      fallbackData: { benefits: [], adjustments: [] },
    });
  }
};

const createRecruitmentJob = async (req, res) => {
  try {
    const payload = buildRecruitmentJobPayload(req.body);
    if (!payload.title) {
      respondWithError(res, new Error('Title is required'), {
        defaultMessage: 'Job title is required',
        status: 422,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase.from(TABLES.recruitmentJobs).insert(payload).select().single()
    );

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Recruitment job creation failed:', error);
    respondWithError(res, error, {
      defaultMessage: 'Failed to create recruitment job',
    });
  }
};

const updateRecruitmentJob = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'recruitment job')) return;

  try {
    const payload = buildRecruitmentJobPayload(req.body, { partial: true });
    if (Object.keys(payload).length === 0) {
      respondWithError(res, new Error('No fields to update'), {
        defaultMessage: 'Provide at least one field to update',
        status: 400,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase
        .from(TABLES.recruitmentJobs)
        .update(payload)
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Recruitment job not found'), {
        defaultMessage: 'Recruitment job not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to update recruitment job',
    });
  }
};

const deleteRecruitmentJob = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'recruitment job')) return;

  try {
    const record = await mutateSingleRow(
      supabase
        .from(TABLES.recruitmentJobs)
        .delete()
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Recruitment job not found'), {
        defaultMessage: 'Recruitment job not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to delete recruitment job',
    });
  }
};

const createRecruitmentApplication = async (req, res) => {
  try {
    const payload = buildRecruitmentApplicationPayload(req.body);
    if (!payload.job_id || !payload.candidate_name) {
      respondWithError(res, new Error('Job ID and candidate name are required'), {
        defaultMessage: 'Job ID and candidate name are required',
        status: 422,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase.from(TABLES.recruitmentApplications).insert(payload).select().single()
    );

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to create application',
    });
  }
};

const updateRecruitmentApplication = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'application')) return;

  try {
    const payload = buildRecruitmentApplicationPayload(req.body, { partial: true });
    if (Object.keys(payload).length === 0) {
      respondWithError(res, new Error('No fields to update'), {
        defaultMessage: 'Provide at least one field to update',
        status: 400,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase
        .from(TABLES.recruitmentApplications)
        .update(payload)
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Application not found'), {
        defaultMessage: 'Application not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to update application',
    });
  }
};

const deleteRecruitmentApplication = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'application')) return;

  try {
    const record = await mutateSingleRow(
      supabase
        .from(TABLES.recruitmentApplications)
        .delete()
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Application not found'), {
        defaultMessage: 'Application not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to delete application',
    });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const payload = buildLeaveRequestPayload(req.body);
    if (!payload.employee_name || !payload.leave_type || !payload.start_date || !payload.end_date) {
      respondWithError(res, new Error('Missing leave details'), {
        defaultMessage: 'Employee, leave type, start date, and end date are required',
        status: 422,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase.from(TABLES.leaveRequests).insert(payload).select().single()
    );

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Leave request creation failed:', error);
    respondWithError(res, error, {
      defaultMessage: 'Failed to create leave request',
    });
  }
};

const updateLeaveRequest = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'leave request')) return;

  try {
    const payload = buildLeaveRequestPayload(req.body, { partial: true });
    if (Object.keys(payload).length === 0) {
      respondWithError(res, new Error('No fields to update'), {
        defaultMessage: 'Provide at least one field to update',
        status: 400,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase
        .from(TABLES.leaveRequests)
        .update(payload)
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Leave request not found'), {
        defaultMessage: 'Leave request not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to update leave request',
    });
  }
};

const deleteLeaveRequest = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'leave request')) return;

  try {
    const record = await mutateSingleRow(
      supabase
        .from(TABLES.leaveRequests)
        .delete()
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Leave request not found'), {
        defaultMessage: 'Leave request not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to delete leave request',
    });
  }
};

const createExpenseClaim = async (req, res) => {
  try {
    const payload = buildExpenseClaimPayload(req.body);
    if (!payload.employee_name || payload.amount === undefined) {
      respondWithError(res, new Error('Missing claim fields'), {
        defaultMessage: 'Employee and amount are required',
        status: 422,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase.from(TABLES.expenseClaims).insert(payload).select().single()
    );

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Expense claim creation failed:', error);
    respondWithError(res, error, {
      defaultMessage: 'Failed to create expense claim',
    });
  }
};

const updateExpenseClaim = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'expense claim')) return;

  try {
    const payload = buildExpenseClaimPayload(req.body, { partial: true });
    if (Object.keys(payload).length === 0) {
      respondWithError(res, new Error('No fields to update'), {
        defaultMessage: 'Provide at least one field to update',
        status: 400,
      });
      return;
    }

    const record = await mutateSingleRow(
      supabase
        .from(TABLES.expenseClaims)
        .update(payload)
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Expense claim not found'), {
        defaultMessage: 'Expense claim not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to update expense claim',
    });
  }
};

const deleteExpenseClaim = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'expense claim')) return;

  try {
    const record = await mutateSingleRow(
      supabase
        .from(TABLES.expenseClaims)
        .delete()
        .eq('id', id)
        .select()
        .single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Expense claim not found'), {
        defaultMessage: 'Expense claim not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to delete expense claim',
    });
  }
};

const syncProjectAssignments = async (projectId, assignments) => {
  const cleanedAssignments = mapAssignmentInput(assignments).map((assignment) => ({
    ...assignment,
    project_id: projectId,
  }));

  await supabase.from(TABLES.projectAssignments).delete().eq('project_id', projectId);

  if (!cleanedAssignments.length) {
    return [];
  }

  const inserted = await mutateSingleRow(
    supabase.from(TABLES.projectAssignments).insert(cleanedAssignments).select(),
    { fallback: [] }
  );

  return inserted || [];
};

const createProject = async (req, res) => {
  try {
    const payload = buildProjectPayload(req.body);
    if (!payload.name) {
      respondWithError(res, new Error('Project name is required'), {
        defaultMessage: 'Project name is required',
        status: 422,
      });
      return;
    }

    const assignments = sanitizeArray(req.body.assignments);

    const record = await mutateSingleRow(
      supabase.from(TABLES.projects).insert(payload).select().single()
    );

    if (assignments.length) {
      record.assignments = await syncProjectAssignments(record.id, assignments);
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to create project',
    });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'project')) return;

  try {
    const payload = buildProjectPayload(req.body, { partial: true });
    const assignments = req.body.assignments;

    if (Object.keys(payload).length === 0 && assignments === undefined) {
      respondWithError(res, new Error('No fields to update'), {
        defaultMessage: 'Provide at least one field to update',
        status: 400,
      });
      return;
    }

    let record = null;
    if (Object.keys(payload).length > 0) {
      record = await mutateSingleRow(
        supabase
          .from(TABLES.projects)
          .update(payload)
          .eq('id', id)
          .select()
          .single(),
        { fallback: null }
      );

      if (!record) {
        respondWithError(res, new Error('Project not found'), {
          defaultMessage: 'Project not found',
          status: 404,
        });
        return;
      }
    } else {
      const existing = await mutateSingleRow(
        supabase
          .from(TABLES.projects)
          .select('*')
          .eq('id', id)
          .single(),
        { fallback: null }
      );
      if (!existing) {
        respondWithError(res, new Error('Project not found'), {
          defaultMessage: 'Project not found',
          status: 404,
        });
        return;
      }
      record = existing;
    }

    if (assignments !== undefined) {
      record.assignments = await syncProjectAssignments(id, assignments);
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to update project',
    });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  if (!requireId(res, id, 'project')) return;

  try {
    const record = await mutateSingleRow(
      supabase.from(TABLES.projects).delete().eq('id', id).select().single(),
      { fallback: null }
    );

    if (!record) {
      respondWithError(res, new Error('Project not found'), {
        defaultMessage: 'Project not found',
        status: 404,
      });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error) {
    respondWithError(res, error, {
      defaultMessage: 'Failed to delete project',
    });
  }
};

module.exports = {
  getHrDashboardSummary,
  getRecruitmentSummary,
  getEmployeeLifecycle,
  getPerformanceData,
  getShiftAttendance,
  getExpenseClaims,
  getLeaveData,
  getProjects,
  getUsers,
  getWebsite,
  getPayrollSummary,
  getPayrollRuns,
  getPayrollBenefits,
  createRecruitmentJob,
  updateRecruitmentJob,
  deleteRecruitmentJob,
  createRecruitmentApplication,
  updateRecruitmentApplication,
  deleteRecruitmentApplication,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  createExpenseClaim,
  updateExpenseClaim,
  deleteExpenseClaim,
  createProject,
  updateProject,
  deleteProject,
};
