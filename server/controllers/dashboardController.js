const supabase = require('../utils/supabaseClient');
const { parseNumber, isMissingTableError, respondWithError } = require('../utils/controllerUtils');

const safeSelect = async (table, select = '*') => {
  const { data, error } = await supabase.from(table).select(select);

  if (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }

  return data || [];
};

const normaliseStatus = (value) => (value || '').toLowerCase();

const getDashboardSummary = async (_req, res) => {
  try {
    const [inventory, suppliers, buyers, accountingEntries, qualityChecks] = await Promise.all([
      safeSelect('inventory', 'id, item_name, quantity, unit_cost, reorder_level, location, updated_at'),
      safeSelect('supplier', 'id'),
      safeSelect('buyer', 'id'),
      safeSelect('accounting_entries', 'entry_type, amount, status, due_date'),
      safeSelect('quality_checks', 'status, score, score_max'),
    ]);

    const inventorySummary = inventory.reduce(
      (acc, item) => {
        const qty = parseNumber(item.quantity, 0) || 0;
        const cost = parseNumber(item.unit_cost, 0) || 0;
        const reorder = parseNumber(item.reorder_level, 0) || 0;
        const value = qty * cost;

        acc.totalQuantity += qty;
        acc.totalValue += value;

        if (reorder > 0 && qty <= reorder) {
          acc.lowStock += 1;
        }

        if (item.location) {
          const key = item.location.trim();
          acc.byLocation[key] = (acc.byLocation[key] || 0) + qty;
        }

        return acc;
      },
      { totalQuantity: 0, totalValue: 0, lowStock: 0, byLocation: {} },
    );

    const accountingSummary = (accountingEntries || []).reduce(
      (acc, entry) => {
        const amount = parseNumber(entry.amount, 0) || 0;
        const status = normaliseStatus(entry.status);
        const dueDate = entry.due_date ? new Date(entry.due_date) : null;
        const now = new Date();
        const isReceivable = (entry.entry_type || '').toUpperCase() === 'RECEIVABLE';

        if (isReceivable) {
          acc.totalReceivable += amount;
          if (status !== 'paid' && dueDate && dueDate < now) {
            acc.overdueReceivable += amount;
          }
        } else {
          acc.totalPayable += amount;
          if (status !== 'paid' && dueDate && dueDate < now) {
            acc.overduePayable += amount;
          }
        }

        return acc;
      },
      { totalReceivable: 0, totalPayable: 0, overdueReceivable: 0, overduePayable: 0 },
    );

    const qualitySummary = (qualityChecks || []).reduce(
      (acc, check) => {
        const status = normaliseStatus(check.status);
        acc.total += 1;
        switch (status) {
          case 'completed':
          case 'passed':
            acc.completed += 1;
            break;
          case 'in_progress':
          case 'in-progress':
            acc.inProgress += 1;
            break;
          default:
            acc.awaiting += 1;
        }

        const score = parseNumber(check.score);
        const max = parseNumber(check.score_max);
        if (score !== null && max && max > 0) {
          acc.scoreSum += score / max;
          acc.scored += 1;
        }

        return acc;
      },
      { total: 0, awaiting: 0, inProgress: 0, completed: 0, scoreSum: 0, scored: 0 },
    );

    const averageQualityScore = qualitySummary.scored
      ? Number(((qualitySummary.scoreSum / qualitySummary.scored) * 100).toFixed(1))
      : 0;

    const overview = {
      counts: {
        suppliers: suppliers.length,
        buyers: buyers.length,
        inventoryItems: inventory.length,
        openQualityItems: qualitySummary.awaiting + qualitySummary.inProgress,
      },
      inventory: {
        totalQuantity: inventorySummary.totalQuantity,
        totalValue: inventorySummary.totalValue,
        lowStockCount: inventorySummary.lowStock,
        byLocation: Object.entries(inventorySummary.byLocation).map(([location, quantity]) => ({
          location,
          quantity,
        })),
      },
      accounting: {
        ...accountingSummary,
        netCashflow: accountingSummary.totalReceivable - accountingSummary.totalPayable,
      },
      quality: {
        total: qualitySummary.total,
        awaiting: qualitySummary.awaiting,
        inProgress: qualitySummary.inProgress,
        completed: qualitySummary.completed,
        averageScore: averageQualityScore,
      },
    };

    res.json({ success: true, data: overview });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load dashboard data' });
  }
};

module.exports = {
  getDashboardSummary,
};
