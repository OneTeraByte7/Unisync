const supabase = require('../utils/supabaseClient');
const { trimOrNull, parseNumber, isMissingTableError, respondWithError } = require('../utils/controllerUtils');

const TABLE_NAME = 'buyer';

const ensureTable = (error, res, action = 'access buyers') => {
  if (isMissingTableError(error)) {
    return res.status(501).json({
      success: false,
      error: 'Buyer table is not configured. Please create a "buyer" table in Supabase or update the controller configuration.',
    });
  }
  throw error;
};

const getAllBuyers = async (_req, res) => {
  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return res.json({ success: true, data: [], message: 'No buyer records found. Create the "buyer" table to start tracking buyers.' });
      }
      throw error;
    }

    res.json({ success: true, data: data || [] });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load buyers' });
  }
};

const getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();

    if (error) {
      return ensureTable(error, res);
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load buyer details' });
  }
};

const createBuyer = async (req, res) => {
  try {
    const {
      buyer_name,
      company_name,
      contact_name,
      email,
      phone,
      address,
      city,
      state,
      country,
      notes,
      credit_limit,
      payment_terms,
    } = req.body;

    if (!buyer_name || !buyer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Buyer name is required' });
    }

    const payload = {
      buyer_name: buyer_name.trim(),
      company_name: trimOrNull(company_name),
      contact_name: trimOrNull(contact_name),
      email: trimOrNull(email),
      phone: trimOrNull(phone),
      address: trimOrNull(address),
      city: trimOrNull(city),
      state: trimOrNull(state),
      country: trimOrNull(country),
      notes: trimOrNull(notes),
      credit_limit: parseNumber(credit_limit),
      payment_terms: trimOrNull(payment_terms),
    };

    const { data, error } = await supabase.from(TABLE_NAME).insert([payload]).select().single();

    if (error) {
      return ensureTable(error, res);
    }

    res.status(201).json({ success: true, data, message: 'Buyer created successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create buyer' });
  }
};

const updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      buyer_name,
      company_name,
      contact_name,
      email,
      phone,
      address,
      city,
      state,
      country,
      notes,
      credit_limit,
      payment_terms,
    } = req.body;

    if (!buyer_name || !buyer_name.trim()) {
      return res.status(400).json({ success: false, error: 'Buyer name is required' });
    }

    const payload = {
      buyer_name: buyer_name.trim(),
      company_name: trimOrNull(company_name),
      contact_name: trimOrNull(contact_name),
      email: trimOrNull(email),
      phone: trimOrNull(phone),
      address: trimOrNull(address),
      city: trimOrNull(city),
      state: trimOrNull(state),
      country: trimOrNull(country),
      notes: trimOrNull(notes),
      credit_limit: parseNumber(credit_limit),
      payment_terms: trimOrNull(payment_terms),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq('id', id).select().single();

    if (error) {
      return ensureTable(error, res);
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Buyer not found' });
    }

    res.json({ success: true, data, message: 'Buyer updated successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update buyer' });
  }
};

const deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      return ensureTable(error, res);
    }

    res.json({ success: true, message: 'Buyer deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete buyer' });
  }
};

module.exports = {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
};
