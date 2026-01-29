const supabase = require('../utils/supabaseClient');
const { trimOrNull, parseNumber, isMissingTableError, respondWithError } = require('../utils/controllerUtils');

const TABLE_NAME = 'quality_checks';

const withMissingTableFallback = (error, res, fallback) => {
  if (isMissingTableError(error)) {
    return res.json({ success: true, data: fallback, message: 'Quality check tracking table is not configured yet.' });
  }
  throw error;
};

const ensureTable = (error, res) => {
  if (isMissingTableError(error)) {
    return res.status(501).json({
      success: false,
      error:
        'Quality check table is missing. Create a "quality_checks" table in Supabase with the expected columns before using this module.',
    });
  }
  throw error;
};

const getQualityChecks = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return withMissingTableFallback(error, res, []);
    }

    res.json({ success: true, data: data || [] });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load quality checks' });
  }
};

const createQualityCheck = async (req, res) => {
  try {
    const {
      title,
      status = 'scheduled',
      owner,
      location,
      score,
      score_max,
      due_date,
      notes,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Quality check title is required' });
    }

    const payload = {
      title: title.trim(),
      status: trimOrNull(status) || 'scheduled',
      owner: trimOrNull(owner),
      location: trimOrNull(location),
      score: parseNumber(score),
      score_max: parseNumber(score_max),
      due_date: trimOrNull(due_date),
      notes: trimOrNull(notes),
    };

    const { data, error } = await supabase.from(TABLE_NAME).insert([payload]).select().single();

    if (error) {
      return ensureTable(error, res);
    }

    res.status(201).json({ success: true, data, message: 'Quality check created successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create quality check' });
  }
};

const updateQualityCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      status,
      owner,
      location,
      score,
      score_max,
      due_date,
      completed_at,
      notes,
    } = req.body;

    if (title && !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title cannot be empty' });
    }

    const payload = {
      ...(title ? { title: title.trim() } : {}),
      ...(status ? { status: trimOrNull(status) } : {}),
      owner: trimOrNull(owner),
      location: trimOrNull(location),
      score: parseNumber(score),
      score_max: parseNumber(score_max),
      due_date: trimOrNull(due_date),
      completed_at: trimOrNull(completed_at),
      notes: trimOrNull(notes),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq('id', id).select().single();

    if (error) {
      return ensureTable(error, res);
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Quality check not found' });
    }

    res.json({ success: true, data, message: 'Quality check updated successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update quality check' });
  }
};

const deleteQualityCheck = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      return ensureTable(error, res);
    }

    res.json({ success: true, message: 'Quality check deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete quality check' });
  }
};

const getQualitySummary = async (_req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('*');

    if (error) {
      if (isMissingTableError(error)) {
        return res.json({
          success: true,
          data: {
            totalChecks: 0,
            awaiting: 0,
            inProgress: 0,
            completed: 0,
            averageScore: 0,
          },
        });
      }
      throw error;
    }

    const checks = data || [];
    const summary = checks.reduce(
      (acc, check) => {
        acc.totalChecks += 1;

        switch ((check.status || '').toLowerCase()) {
          case 'in_progress':
          case 'in-progress':
            acc.inProgress += 1;
            break;
          case 'completed':
          case 'passed':
            acc.completed += 1;
            break;
          default:
            acc.awaiting += 1;
            break;
        }

        const score = parseNumber(check.score);
        const max = parseNumber(check.score_max);
        if (score !== null && max && max > 0) {
          acc.scoreSum += score / max;
          acc.scored += 1;
        }

        return acc;
      },
      { totalChecks: 0, awaiting: 0, inProgress: 0, completed: 0, scoreSum: 0, scored: 0 },
    );

    const averageScore = summary.scored > 0 ? Number((summary.scoreSum / summary.scored * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: {
        totalChecks: summary.totalChecks,
        awaiting: summary.awaiting,
        inProgress: summary.inProgress,
        completed: summary.completed,
        averageScore,
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to summarise quality checks' });
  }
};

module.exports = {
  getQualityChecks,
  createQualityCheck,
  updateQualityCheck,
  deleteQualityCheck,
  getQualitySummary,
};
