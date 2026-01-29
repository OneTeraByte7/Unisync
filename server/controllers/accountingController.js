const supabase = require('../utils/supabaseClient');
const { trimOrNull, parseNumber, isMissingTableError, respondWithError } = require('../utils/controllerUtils');

const TABLE_NAME = 'accounting_entries';

const ensureTable = (error, res) => {
  if (isMissingTableError(error)) {
    return res.status(501).json({
      success: false,
      error:
        'Accounting entries table is missing. Create an "accounting_entries" table in Supabase before using this module.',
    });
  }
  throw error;
};

const getAccountingEntries = async (req, res) => {
  try {
    const { type } = req.query;

    let query = supabase.from(TABLE_NAME).select('*').order('due_date', { ascending: true });

    if (type && ['receivable', 'payable'].includes(type.toLowerCase())) {
      const normalised = type.toLowerCase() === 'receivable' ? 'RECEIVABLE' : 'PAYABLE';
      query = query.eq('entry_type', normalised);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingTableError(error)) {
        return res.json({ success: true, data: [] });
      }
      throw error;
    }

    res.json({ success: true, data: data || [] });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load accounting entries' });
  }
};

const createAccountingEntry = async (req, res) => {
  try {
    const {
      entry_type,
      entity_name,
      reference,
      amount,
      currency,
      status = 'pending',
      due_date,
      notes,
    } = req.body;

    if (!entry_type || !['RECEIVABLE', 'PAYABLE'].includes(entry_type.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'entry_type must be RECEIVABLE or PAYABLE' });
    }

    if (!entity_name || !entity_name.trim()) {
      return res.status(400).json({ success: false, error: 'Entity name is required' });
    }

    const payload = {
      entry_type: entry_type.toUpperCase(),
      entity_name: entity_name.trim(),
      reference: trimOrNull(reference),
      amount: parseNumber(amount, 0),
      currency: trimOrNull(currency) || 'USD',
      status: trimOrNull(status) || 'pending',
      due_date: trimOrNull(due_date),
      notes: trimOrNull(notes),
    };

    const { data, error } = await supabase.from(TABLE_NAME).insert([payload]).select().single();

    if (error) {
      return ensureTable(error, res);
    }

    res.status(201).json({ success: true, data, message: 'Accounting entry created successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create accounting entry' });
  }
};

const updateAccountingEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      entry_type,
      entity_name,
      reference,
      amount,
      currency,
      status,
      due_date,
      paid_at,
      notes,
    } = req.body;

    const payload = {
      ...(entry_type && ['RECEIVABLE', 'PAYABLE'].includes(entry_type.toUpperCase())
        ? { entry_type: entry_type.toUpperCase() }
        : {}),
      ...(entity_name ? { entity_name: entity_name.trim() } : {}),
      reference: trimOrNull(reference),
      amount: parseNumber(amount),
      currency: trimOrNull(currency),
      status: trimOrNull(status),
      due_date: trimOrNull(due_date),
      paid_at: trimOrNull(paid_at),
      notes: trimOrNull(notes),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq('id', id).select().single();

    if (error) {
      return ensureTable(error, res);
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Accounting entry not found' });
    }

    res.json({ success: true, data, message: 'Accounting entry updated successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update accounting entry' });
  }
};

const deleteAccountingEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      return ensureTable(error, res);
    }

    res.json({ success: true, message: 'Accounting entry deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete accounting entry' });
  }
};

const getAccountingSummary = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('entry_type, amount, status, due_date, paid_at');

    if (error) {
      if (isMissingTableError(error)) {
        return res.json({
          success: true,
          data: {
            totalReceivable: 0,
            totalPayable: 0,
            overdueReceivable: 0,
            overduePayable: 0,
            settledThisMonth: 0,
          },
        });
      }
      throw error;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary = (data || []).reduce(
      (acc, entry) => {
        const amount = parseNumber(entry.amount, 0) || 0;
        const dueDate = entry.due_date ? new Date(entry.due_date) : null;
        const paidAt = entry.paid_at ? new Date(entry.paid_at) : null;
        const isReceivable = (entry.entry_type || '').toUpperCase() === 'RECEIVABLE';
        const isPayable = !isReceivable;

        if (isReceivable) {
          acc.totalReceivable += amount;
        } else {
          acc.totalPayable += amount;
        }

        const isPending = (entry.status || '').toLowerCase() !== 'paid';

        if (isPending && dueDate && dueDate < now) {
          if (isReceivable) {
            acc.overdueReceivable += amount;
          } else {
            acc.overduePayable += amount;
          }
        }

        if (paidAt && paidAt >= startOfMonth) {
          acc.settledThisMonth += amount;
        }

        return acc;
      },
      {
        totalReceivable: 0,
        totalPayable: 0,
        overdueReceivable: 0,
        overduePayable: 0,
        settledThisMonth: 0,
      },
    );

    res.json({ success: true, data: summary });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to summarise accounting data' });
  }
};

module.exports = {
  getAccountingEntries,
  createAccountingEntry,
  updateAccountingEntry,
  deleteAccountingEntry,
  getAccountingSummary,
};
