const supabase = require('../utils/supabaseClient');
const { isMissingTableError } = require('../utils/controllerUtils');

const parseNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const trimOrNull = (value) => (value && typeof value === 'string' ? value.trim() : value ?? null);

const fetchInventoryItem = async (id) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

const recordInventoryTransaction = async ({
  inventoryId,
  type,
  quantityChange,
  quantityBefore,
  quantityAfter,
  unitCost,
  note,
}) => {
  const payload = {
    inventory_id: inventoryId,
    type,
    quantity_change: quantityChange,
    quantity_before: quantityBefore,
    quantity_after: quantityAfter,
    unit_cost: unitCost,
    note: trimOrNull(note),
  };

  const { error } = await supabase.from('inventory_transactions').insert([payload]);

  if (error) {
    if (isMissingTableError(error)) {
      console.warn('inventory_transactions table missing, skipping history log. Payload:', payload);
      return;
    }
    console.warn('Failed to record inventory transaction', error);
  }
};

// GET all inventory items
const getAllInventoryItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET inventory item by ID
const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// POST create new inventory item
const createInventoryItem = async (req, res) => {
  try {
    const {
      item_name,
      sku,
      quantity,
      unit_cost,
      reorder_level,
      location,
      description,
    } = req.body;

    if (!item_name || !item_name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Item name is required',
      });
    }

    const payload = {
      item_name: item_name.trim(),
      sku: sku?.trim() || null,
      quantity: parseNumber(quantity, 0),
      unit_cost: parseNumber(unit_cost),
      reorder_level: parseNumber(reorder_level, 0),
      location: location?.trim() || null,
      description: description?.trim() || null,
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Inventory item created successfully',
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// PUT update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item_name,
      sku,
      quantity,
      unit_cost,
      reorder_level,
      location,
      description,
    } = req.body;

    if (!item_name || !item_name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Item name is required',
      });
    }

    const payload = {
      item_name: item_name.trim(),
      sku: sku?.trim() || null,
      quantity: parseNumber(quantity, 0),
      unit_cost: parseNumber(unit_cost),
      reorder_level: parseNumber(reorder_level, 0),
      location: location?.trim() || null,
      description: description?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inventory')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
      });
    }

    res.json({
      success: true,
      data,
      message: 'Inventory item updated successfully',
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('inventory').delete().eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const buyInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unit_cost, note } = req.body;

    const qty = parseNumber(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Purchase quantity must be a positive number',
      });
    }

    const item = await fetchInventoryItem(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
      });
    }

    const currentQuantity = parseNumber(item.quantity, 0) || 0;
    const newQuantity = currentQuantity + qty;

    const updates = {
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    };

    const parsedUnitCost = parseNumber(unit_cost);
    if (parsedUnitCost !== null && parsedUnitCost !== undefined) {
      updates.unit_cost = parsedUnitCost;
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await recordInventoryTransaction({
      inventoryId: id,
      type: 'BUY',
      quantityChange: qty,
      quantityBefore: currentQuantity,
      quantityAfter: newQuantity,
      unitCost: parseNumber(updates.unit_cost, item.unit_cost),
      note,
    });

    res.json({
      success: true,
      data,
      message: 'Inventory updated with purchase',
    });
  } catch (error) {
    console.error('Error purchasing inventory:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const sellInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, note } = req.body;

    const qty = parseNumber(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Sale quantity must be a positive number',
      });
    }

    const item = await fetchInventoryItem(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found',
      });
    }

    const currentQuantity = parseNumber(item.quantity, 0) || 0;
    if (qty > currentQuantity) {
      return res.status(400).json({
        success: false,
        error: 'Cannot sell more items than available in stock',
      });
    }

    const newQuantity = currentQuantity - qty;

    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await recordInventoryTransaction({
      inventoryId: id,
      type: 'SELL',
      quantityChange: -qty,
      quantityBefore: currentQuantity,
      quantityAfter: newQuantity,
      unitCost: parseNumber(item.unit_cost),
      note,
    });

    res.json({
      success: true,
      data,
      message: 'Inventory updated with sale',
    });
  } catch (error) {
    console.error('Error selling inventory:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getInventoryTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseNumber(req.query.limit, 25) || 25;

    let query = supabase
      .from('inventory_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (id) {
      query = query.eq('inventory_id', id);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingTableError(error)) {
        return res.json({ success: true, data: [] });
      }
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getInventoryAnalytics = async (_req, res) => {
  try {
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) throw error;

    const items = data || [];
    const totalItems = items.length;
    const totals = items.reduce(
      (acc, item) => {
        const qty = parseNumber(item.quantity, 0) || 0;
        const unitCost = parseNumber(item.unit_cost, 0) || 0;
        const reorderLevel = parseNumber(item.reorder_level, 0) || 0;
        const value = qty * unitCost;

        acc.quantity += qty;
        acc.value += value;

        if (reorderLevel > 0 && qty <= reorderLevel) {
          acc.lowStock.push({
            id: item.id,
            item_name: item.item_name,
            quantity: qty,
            reorder_level: reorderLevel,
          });
        }

        if (item.location) {
          const key = item.location.trim();
          acc.byLocation[key] = (acc.byLocation[key] || 0) + qty;
        }

        acc.series.push({
          name: item.item_name,
          quantity: qty,
          value,
        });

        return acc;
      },
      {
        quantity: 0,
        value: 0,
        lowStock: [],
        byLocation: {},
        series: [],
      }
    );

    const locationSeries = Object.entries(totals.byLocation).map(([location, quantity]) => ({
      location,
      quantity,
    }));

    const topValued = totals.series
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalItems,
        totalQuantity: totals.quantity,
        totalValue: totals.value,
        lowStockItems: totals.lowStock,
        inventoryByLocation: locationSeries,
        topValuedItems: topValued,
        itemSeries: totals.series,
      },
    });
  } catch (error) {
    console.error('Error calculating inventory analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  buyInventoryItem,
  sellInventoryItem,
  getInventoryTransactions,
  getInventoryAnalytics,
};
