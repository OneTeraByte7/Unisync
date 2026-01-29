// server/controllers/supplierController.js
const supabase = require('../utils/supabaseClient');

// GET all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET single supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST create new supplier
const createSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      contact_name,
      email,
      phone,
      address,
      city,
      state,
      country
    } = req.body;

    if (!supplier_name || !supplier_name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Supplier name is required'
      });
    }

    const { data, error } = await supabase
      .from('supplier')
      .insert([
        {
          supplier_name: supplier_name.trim(),
          contact_name: contact_name?.trim() || null,
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          country: country?.trim() || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// PUT update supplier
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_name,
      contact_name,
      email,
      phone,
      address,
      city,
      state,
      country
    } = req.body;

    if (!supplier_name || !supplier_name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Supplier name is required'
      });
    }

    const { data, error } = await supabase
      .from('supplier')
      .update({
        supplier_name: supplier_name.trim(),
        contact_name: contact_name?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// DELETE supplier
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('supplier')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};