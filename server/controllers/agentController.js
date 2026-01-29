const supabase = require('../utils/supabaseClient');
const { respondWithError, trimOrNull, parseNumber } = require('../utils/controllerUtils');

const ACTION_KEYWORDS = {
  create: ['create', 'add', 'log', 'open', 'new', 'start'],
  read: ['list', 'show', 'get', 'fetch', 'view', 'find'],
  update: ['update', 'edit', 'set', 'change', 'modify'],
  delete: ['delete', 'remove', 'archive', 'drop'],
};

const ENTITY_KEYWORDS = [
  { key: 'recruitmentJob', label: 'recruitment job', words: ['recruitment job', 'job', 'requisition', 'role', 'opening'] },
  { key: 'recruitmentApplication', label: 'recruitment application', words: ['application', 'candidate', 'applicant'] },
  { key: 'leaveRequest', label: 'leave request', words: ['leave request', 'leave', 'time off', 'pto'] },
  { key: 'expenseClaim', label: 'expense claim', words: ['expense', 'claim', 'reimbursement'] },
  { key: 'project', label: 'project', words: ['project', 'initiative', 'engagement'] },
];

const TABLES = {
  recruitmentJob: 'hr_recruitment_jobs',
  recruitmentApplication: 'hr_recruitment_applications',
  leaveRequest: 'hr_leave_requests',
  expenseClaim: 'hr_expense_claims',
  project: 'hr_projects',
  auditLog: 'hr_audit_log',
};

const stripUndefined = (object = {}) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'y', 'on', 'approved'].includes(normalized)) return true;
    if (['false', 'no', 'n', 'off', 'denied'].includes(normalized)) return false;
  }
  return null;
};

const parseKeyValuePairs = (command) => {
  const pairs = {};
  if (!command) return pairs;

  const regex = /(\b[\w.]+)\s*[:=]\s*("[^"]+"|'[^']+'|[^,;\n]+)/gi;
  let match;
  while ((match = regex.exec(command)) !== null) {
    const key = match[1].toLowerCase();
    const rawValue = match[2].trim();
    let value = rawValue;
    if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
      value = rawValue.slice(1, -1);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      pairs[key] = value;
    } else if (!Number.isNaN(Number(value)) && value !== '') {
      pairs[key] = Number(value);
    } else {
      const boolValue = toBoolean(value);
      pairs[key] = boolValue !== null ? boolValue : value;
    }
  }
  return pairs;
};

const detectAction = (command) => {
  const lower = command.toLowerCase();
  for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
    if (keywords.some((word) => lower.includes(word))) {
      return action;
    }
  }
  return null;
};

const detectEntity = (command) => {
  const lower = command.toLowerCase();
  for (const entity of ENTITY_KEYWORDS) {
    if (entity.words.some((word) => lower.includes(word))) {
      return entity;
    }
  }
  return null;
};

const extractId = (command, fallback) => {
  if (fallback) return fallback;
  const match = command.match(/\b(id|record)\s*[:=]\s*([a-z0-9-]{6,})/i);
  if (match) {
    return match[2];
  }
  const uuidMatch = command.match(/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  return null;
};

const buildRecruitmentJobPayload = (input = {}) => {
  const mapped = {
    title: trimOrNull(input.title),
    department: trimOrNull(input.department),
    hiring_manager: trimOrNull(input.hiring_manager ?? input.hiringManager ?? input.manager),
    status: trimOrNull(input.status),
    openings:
      input.openings !== undefined && input.openings !== null
        ? parseNumber(input.openings, null)
        : undefined,
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
    diversity_ratio:
      input.diversity_ratio !== undefined || input.diversityRatio !== undefined
        ? parseNumber(input.diversityRatio ?? input.diversity_ratio, null)
        : undefined,
  };
  return stripUndefined(mapped);
};

const buildRecruitmentApplicationPayload = (input = {}) => {
  const mapped = {
    job_id: trimOrNull(input.job_id ?? input.jobId ?? input.job),
    candidate_name: trimOrNull(input.candidate_name ?? input.candidateName ?? input.name),
    stage: trimOrNull(input.stage),
    score:
      input.score !== undefined && input.score !== null
        ? parseNumber(input.score, null)
        : undefined,
    submitted_on: trimOrNull(input.submitted_on ?? input.submittedOn ?? input.date),
    email: trimOrNull(input.email),
    phone: trimOrNull(input.phone),
    resume_url: trimOrNull(input.resume_url ?? input.resumeUrl),
    notes: trimOrNull(input.notes),
  };
  return stripUndefined(mapped);
};

const buildLeaveRequestPayload = (input = {}) => {
  const mapped = {
    employee_id: trimOrNull(input.employee_id ?? input.employeeId),
    employee_name: trimOrNull(input.employee_name ?? input.employeeName ?? input.employee),
    leave_type: trimOrNull(input.leave_type ?? input.leaveType ?? input.type),
    start_date: trimOrNull(input.start_date ?? input.startDate ?? input.from),
    end_date: trimOrNull(input.end_date ?? input.endDate ?? input.to),
    status: trimOrNull(input.status),
    approver: trimOrNull(input.approver),
    notes: trimOrNull(input.notes ?? input.reason),
  };
  return stripUndefined(mapped);
};

const buildExpenseClaimPayload = (input = {}) => {
  const mapped = {
    employee_name: trimOrNull(input.employee_name ?? input.employeeName ?? input.employee),
    category: trimOrNull(input.category),
    amount:
      input.amount !== undefined && input.amount !== null
        ? parseNumber(input.amount, 0)
        : undefined,
    status: trimOrNull(input.status),
    submitted_on: trimOrNull(input.submitted_on ?? input.submittedOn ?? input.date),
    reimbursement_date: trimOrNull(input.reimbursement_date ?? input.reimbursementDate),
    notes: trimOrNull(input.notes),
    receipt_url: trimOrNull(input.receipt_url ?? input.receiptUrl),
  };
  return stripUndefined(mapped);
};

const buildProjectPayload = (input = {}) => {
  let contributors = input.contributors;
  if (typeof contributors === 'string') {
    contributors = contributors
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const mapped = {
    name: trimOrNull(input.name ?? input.project),
    lead: trimOrNull(input.lead ?? input.owner ?? input.manager),
    status: trimOrNull(input.status),
    due_on: trimOrNull(input.due_on ?? input.dueOn ?? input.deadline),
    contributors: Array.isArray(contributors) ? contributors : undefined,
    notes: trimOrNull(input.notes ?? input.summary),
  };
  return stripUndefined(mapped);
};

const ENTITY_CONFIG = {
  recruitmentJob: {
    label: 'recruitment job',
    table: TABLES.recruitmentJob,
    buildPayload: buildRecruitmentJobPayload,
    required: { create: ['title'] },
  },
  recruitmentApplication: {
    label: 'recruitment application',
    table: TABLES.recruitmentApplication,
    buildPayload: buildRecruitmentApplicationPayload,
    required: { create: ['job_id', 'candidate_name'] },
  },
  leaveRequest: {
    label: 'leave request',
    table: TABLES.leaveRequest,
    buildPayload: buildLeaveRequestPayload,
    required: { create: ['employee_name', 'leave_type', 'start_date', 'end_date'] },
  },
  expenseClaim: {
    label: 'expense claim',
    table: TABLES.expenseClaim,
    buildPayload: buildExpenseClaimPayload,
    required: { create: ['employee_name', 'amount'] },
  },
  project: {
    label: 'project',
    table: TABLES.project,
    buildPayload: buildProjectPayload,
    required: { create: ['name'] },
  },
};

const recordAudit = async ({ actor = 'agent', action, entity, payload, result, success }) => {
  try {
    await supabase.from(TABLES.auditLog).insert({
      actor,
      action,
      target: entity,
      metadata: { payload, result, success },
    });
  } catch (error) {
    console.warn('Failed to record agent audit log', error);
  }
};

const validateRequiredFields = (payload, required = []) => {
  const missing = required.filter((field) => payload[field] === undefined || payload[field] === null);
  return missing;
};

const selectRecords = async (table, filters = {}) => {
  let query = supabase.from(table).select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (typeof value === 'string' && value.length > 2) {
      query = query.ilike(key, `%${value}%`);
    } else {
      query = query.eq(key, value);
    }
  });
  return query.limit(100);
};

const executeAgentCommand = async (req, res) => {
  const { command, data = {}, actor = 'agent', confirm = false } = req.body || {};

  if (!command || typeof command !== 'string') {
    respondWithError(res, new Error('Command is required'), {
      defaultMessage: 'Provide a command for the agent to execute.',
      status: 400,
    });
    return;
  }

  const action = detectAction(command);
  if (!action) {
    respondWithError(res, new Error('Unknown action'), {
      defaultMessage: "Couldn't understand the requested action.",
      status: 400,
    });
    return;
  }

  const entityDetails = detectEntity(command);
  if (!entityDetails) {
    respondWithError(res, new Error('Unknown entity'), {
      defaultMessage: "Couldn't determine which record type to manage.",
      status: 400,
    });
    return;
  }

  const entityConfig = ENTITY_CONFIG[entityDetails.key];
  if (!entityConfig) {
    respondWithError(res, new Error('Unsupported entity'), {
      defaultMessage: 'This record type is not yet supported by the agent.',
      status: 400,
    });
    return;
  }

  const keyValueHints = parseKeyValuePairs(command);
  const mergedData = { ...keyValueHints, ...data };
  const id = extractId(command, mergedData.id);

  try {
    let result;
    let summary = '';
    let filters;

    switch (action) {
      case 'create': {
        const payload = entityConfig.buildPayload(mergedData);
        const missing = validateRequiredFields(payload, entityConfig.required?.create || []);
        if (missing.length) {
          respondWithError(res, new Error('Missing fields'), {
            defaultMessage: `Missing required fields: ${missing.join(', ')}`,
            status: 422,
          });
          return;
        }

        const { data: record, error } = await supabase
          .from(entityConfig.table)
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        result = { record };
        summary = `Created ${entityConfig.label}.`;

        await recordAudit({
          actor,
          action: 'create',
          entity: entityConfig.label,
          payload,
          result: record,
          success: true,
        });
        break;
      }
      case 'update': {
        if (!id) {
          respondWithError(res, new Error('Missing identifier'), {
            defaultMessage: 'Provide the record id to update.',
            status: 400,
          });
          return;
        }

        const payload = entityConfig.buildPayload(mergedData);
        if (Object.keys(payload).length === 0) {
          respondWithError(res, new Error('No fields to update'), {
            defaultMessage: 'Include at least one field to update.',
            status: 400,
          });
          return;
        }

        const { data: record, error } = await supabase
          .from(entityConfig.table)
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!record) {
          respondWithError(res, new Error('Record not found'), {
            defaultMessage: 'No record found with that id.',
            status: 404,
          });
          return;
        }

        result = { record };
        summary = `Updated ${entityConfig.label} ${id}.`;

        await recordAudit({
          actor,
          action: 'update',
          entity: entityConfig.label,
          payload: { id, ...payload },
          result: record,
          success: true,
        });
        break;
      }
      case 'delete': {
        if (!id) {
          respondWithError(res, new Error('Missing identifier'), {
            defaultMessage: 'Provide the record id to delete.',
            status: 400,
          });
          return;
        }

        if (!confirm) {
          respondWithError(res, new Error('Confirmation required'), {
            defaultMessage: 'Deletion requires confirmation. Resubmit with { confirm: true }.',
            status: 409,
          });
          return;
        }

        const { data: record, error } = await supabase
          .from(entityConfig.table)
          .delete()
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (!record) {
          respondWithError(res, new Error('Record not found'), {
            defaultMessage: 'No record found with that id.',
            status: 404,
          });
          return;
        }

        result = { recordId: id };
        summary = `Deleted ${entityConfig.label} ${id}.`;

        await recordAudit({
          actor,
          action: 'delete',
          entity: entityConfig.label,
          payload: { id },
          result: record,
          success: true,
        });
        break;
      }
      case 'read': {
        filters = entityConfig.buildPayload ? entityConfig.buildPayload(mergedData) : {};
        const { data: records, error } = await selectRecords(entityConfig.table, filters);
        if (error) throw error;

        result = { records };
        summary = `Found ${records?.length || 0} ${entityConfig.label}${records?.length === 1 ? '' : 's'}.`;
        break;
      }
      default: {
        respondWithError(res, new Error('Unsupported action'), {
          defaultMessage: 'This action is not implemented yet.',
          status: 400,
        });
        return;
      }
    }

    res.json({ success: true, action, entity: entityConfig.label, summary, data: result });
  } catch (error) {
    await recordAudit({
      actor,
      action,
      entity: entityConfig.label,
      payload: mergedData,
      result: { error: error.message },
      success: false,
    });

    respondWithError(res, error, {
      defaultMessage: `Agent failed to ${action} the ${entityConfig.label}.`,
    });
  }
};

module.exports = {
  executeAgentCommand,
};

