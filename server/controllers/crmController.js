const supabase = require('../utils/supabaseClient');
const { trimOrNull, parseNumber, isMissingTableError, respondWithError } = require('../utils/controllerUtils');

const TABLES = {
  leads: 'crm_leads',
  deals: 'crm_deals',
  contacts: 'crm_contacts',
  organizations: 'crm_organizations',
  notes: 'crm_notes',
};

const NOTE_RELATED_TYPES = new Set(['lead', 'deal', 'contact', 'organization']);

const executeSelect = async (queryBuilder) => {
  const { data, error } = await queryBuilder;
  if (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }
  return data || [];
};

const clampProbability = (value) => {
  const parsed = parseNumber(value, null);
  if (parsed === null) {
    return null;
  }
  return Math.min(Math.max(parsed, 0), 100);
};

const sanitiseLead = (payload = {}) => {
  const name = trimOrNull(payload.name);
  return {
    name,
    company: trimOrNull(payload.company),
    email: trimOrNull(payload.email),
    phone: trimOrNull(payload.phone),
    status: trimOrNull(payload.status) || 'New',
    source: trimOrNull(payload.source) || 'Website',
    owner: trimOrNull(payload.owner),
    value: parseNumber(payload.value, null),
    notes: trimOrNull(payload.notes),
  };
};

const sanitiseDeal = (payload = {}) => {
  const title = trimOrNull(payload.title);
  const probability = clampProbability(payload.probability);
  return {
    title,
    stage: trimOrNull(payload.stage) || 'Prospecting',
    value: parseNumber(payload.value, null),
    probability,
    close_date: trimOrNull(payload.close_date),
    lead_id: trimOrNull(payload.lead_id),
    organization_id: trimOrNull(payload.organization_id),
    owner: trimOrNull(payload.owner),
    notes: trimOrNull(payload.notes),
  };
};

const sanitiseContact = (payload = {}) => {
  const fullName = trimOrNull(payload.full_name);
  return {
    full_name: fullName,
    email: trimOrNull(payload.email),
    phone: trimOrNull(payload.phone),
    role: trimOrNull(payload.role),
    organization_id: trimOrNull(payload.organization_id),
    owner: trimOrNull(payload.owner),
    notes: trimOrNull(payload.notes),
  };
};

const sanitiseOrganization = (payload = {}) => {
  const name = trimOrNull(payload.name);
  return {
    name,
    industry: trimOrNull(payload.industry),
    size: trimOrNull(payload.size),
    website: trimOrNull(payload.website),
    phone: trimOrNull(payload.phone),
    status: trimOrNull(payload.status) || 'Prospect',
    owner: trimOrNull(payload.owner),
    notes: trimOrNull(payload.notes),
  };
};

const sanitiseNote = (payload = {}) => {
  const subject = trimOrNull(payload.subject);
  const relatedType = trimOrNull(payload.related_type)?.toLowerCase() || 'lead';
  const relatedId = trimOrNull(payload.related_id);

  return {
    subject,
    note: trimOrNull(payload.note),
    owner: trimOrNull(payload.owner),
    related_type: NOTE_RELATED_TYPES.has(relatedType) ? relatedType : 'lead',
    related_id: relatedId,
  };
};

const listLeads = async (_req, res) => {
  try {
    const data = await executeSelect(
      supabase.from(TABLES.leads).select('*').order('created_at', { ascending: false })
    );
    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load leads' });
  }
};

const createLead = async (req, res) => {
  try {
    const payload = sanitiseLead(req.body);
    if (!payload.name) {
      return res.status(400).json({ success: false, error: 'Lead name is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.leads)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create lead' });
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = sanitiseLead(req.body);
    if (!payload.name) {
      return res.status(400).json({ success: false, error: 'Lead name is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.leads)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update lead' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from(TABLES.leads).delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete lead' });
  }
};

const listDeals = async (_req, res) => {
  try {
    const rows = await executeSelect(
      supabase
        .from(TABLES.deals)
        .select(
          `*,
          lead:crm_leads(id, name, company),
          organization:crm_organizations(id, name)
        `
        )
        .order('created_at', { ascending: false })
    );

    const data = rows.map((row) => {
      const { lead, organization, ...rest } = row;
      return {
        ...rest,
        lead_name: lead?.name || null,
        organization_name: organization?.name || null,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load deals' });
  }
};

const createDeal = async (req, res) => {
  try {
    const payload = sanitiseDeal(req.body);
    if (!payload.title) {
      return res.status(400).json({ success: false, error: 'Deal title is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.deals)
      .insert([payload])
      .select(
        `*,
        lead:crm_leads(id, name, company),
        organization:crm_organizations(id, name)
      `
      )
      .single();

    if (error) throw error;

    const { lead, organization, ...rest } = data || {};
    res.status(201).json({
      success: true,
      data: {
        ...rest,
        lead_name: lead?.name || null,
        organization_name: organization?.name || null,
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create deal' });
  }
};

const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = sanitiseDeal(req.body);
    if (!payload.title) {
      return res.status(400).json({ success: false, error: 'Deal title is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.deals)
      .update(payload)
      .eq('id', id)
      .select(
        `*,
        lead:crm_leads(id, name, company),
        organization:crm_organizations(id, name)
      `
      )
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const { lead, organization, ...rest } = data;
    res.json({
      success: true,
      data: {
        ...rest,
        lead_name: lead?.name || null,
        organization_name: organization?.name || null,
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update deal' });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from(TABLES.deals).delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete deal' });
  }
};

const listContacts = async (_req, res) => {
  try {
    const rows = await executeSelect(
      supabase
        .from(TABLES.contacts)
        .select(
          `*,
          organization:crm_organizations(id, name)
        `
        )
        .order('created_at', { ascending: false })
    );

    const data = rows.map((row) => {
      const { organization, ...rest } = row;
      return {
        ...rest,
        organization_name: organization?.name || null,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load contacts' });
  }
};

const createContact = async (req, res) => {
  try {
    const payload = sanitiseContact(req.body);
    if (!payload.full_name) {
      return res.status(400).json({ success: false, error: 'Contact name is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.contacts)
      .insert([payload])
      .select(
        `*,
        organization:crm_organizations(id, name)
      `
      )
      .single();

    if (error) throw error;

    const { organization, ...rest } = data || {};
    res.status(201).json({
      success: true,
      data: {
        ...rest,
        organization_name: organization?.name || null,
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create contact' });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = sanitiseContact(req.body);
    if (!payload.full_name) {
      return res.status(400).json({ success: false, error: 'Contact name is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.contacts)
      .update(payload)
      .eq('id', id)
      .select(
        `*,
        organization:crm_organizations(id, name)
      `
      )
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    const { organization, ...rest } = data;
    res.json({
      success: true,
      data: {
        ...rest,
        organization_name: organization?.name || null,
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update contact' });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from(TABLES.contacts).delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete contact' });
  }
};

const listOrganizations = async (_req, res) => {
  try {
    const data = await executeSelect(
      supabase.from(TABLES.organizations).select('*').order('created_at', { ascending: false })
    );
    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load organizations' });
  }
};

const createOrganization = async (req, res) => {
  try {
    const payload = sanitiseOrganization(req.body);
    if (!payload.name) {
      return res.status(400).json({ success: false, error: 'Organization name is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.organizations)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create organization' });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = sanitiseOrganization(req.body);
    if (!payload.name) {
      return res.status(400).json({ success: false, error: 'Organization name is required' });
    }

    const { data, error } = await supabase
      .from(TABLES.organizations)
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update organization' });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from(TABLES.organizations).delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete organization' });
  }
};

const fetchNoteRelatedNames = async (notes) => {
  const idsByType = notes.reduce(
    (acc, note) => {
      if (note.related_type && note.related_id) {
        const type = note.related_type.toLowerCase();
        if (!acc[type]) {
          acc[type] = new Set();
        }
        acc[type].add(note.related_id);
      }
      return acc;
    },
    {}
  );

  const queries = [];

  if (idsByType.lead && idsByType.lead.size > 0) {
    queries.push(
      executeSelect(
        supabase
          .from(TABLES.leads)
          .select('id, name, company')
          .in('id', Array.from(idsByType.lead))
      ).then((rows) => ({ type: 'lead', rows }))
    );
  }

  if (idsByType.deal && idsByType.deal.size > 0) {
    queries.push(
      executeSelect(
        supabase
          .from(TABLES.deals)
          .select('id, title')
          .in('id', Array.from(idsByType.deal))
      ).then((rows) => ({ type: 'deal', rows }))
    );
  }

  if (idsByType.contact && idsByType.contact.size > 0) {
    queries.push(
      executeSelect(
        supabase
          .from(TABLES.contacts)
          .select('id, full_name')
          .in('id', Array.from(idsByType.contact))
      ).then((rows) => ({ type: 'contact', rows }))
    );
  }

  if (idsByType.organization && idsByType.organization.size > 0) {
    queries.push(
      executeSelect(
        supabase
          .from(TABLES.organizations)
          .select('id, name')
          .in('id', Array.from(idsByType.organization))
      ).then((rows) => ({ type: 'organization', rows }))
    );
  }

  const lookups = (await Promise.all(queries)).reduce((acc, result) => {
    acc[result.type] = result.rows.reduce((inner, row) => {
      inner[row.id] = row;
      return inner;
    }, {});
    return acc;
  }, {});

  return (note) => {
    if (!note.related_type || !note.related_id) {
      return null;
    }
    const type = note.related_type.toLowerCase();
    const lookup = lookups[type];
    if (!lookup) {
      return null;
    }
    const match = lookup[note.related_id];
    if (!match) {
      return null;
    }
    switch (type) {
      case 'lead':
        return match.company ? `${match.name} • ${match.company}` : match.name;
      case 'deal':
        return match.title;
      case 'contact':
        return match.full_name;
      case 'organization':
        return match.name;
      default:
        return null;
    }
  };
};

const listNotes = async (_req, res) => {
  try {
    const notes = await executeSelect(
      supabase.from(TABLES.notes).select('*').order('created_at', { ascending: false })
    );

    if (notes.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const lookup = await fetchNoteRelatedNames(notes);
    const data = notes.map((note) => ({
      ...note,
      related_name: lookup(note),
    }));

    res.json({ success: true, data });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load notes' });
  }
};

const createNote = async (req, res) => {
  try {
    const payload = sanitiseNote(req.body);
    if (!payload.subject) {
      return res.status(400).json({ success: false, error: 'Note subject is required' });
    }

    if (payload.related_id && !NOTE_RELATED_TYPES.has(payload.related_type)) {
      return res.status(400).json({ success: false, error: 'Invalid related record type' });
    }

    const { data, error } = await supabase
      .from(TABLES.notes)
      .insert([payload])
      .select('*')
      .single();

    if (error) throw error;

    const lookup = await fetchNoteRelatedNames([data]);

    res.status(201).json({
      success: true,
      data: {
        ...data,
        related_name: lookup(data),
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = sanitiseNote(req.body);
    if (!payload.subject) {
      return res.status(400).json({ success: false, error: 'Note subject is required' });
    }

    if (payload.related_id && !NOTE_RELATED_TYPES.has(payload.related_type)) {
      return res.status(400).json({ success: false, error: 'Invalid related record type' });
    }

    const { data, error } = await supabase
      .from(TABLES.notes)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    const lookup = await fetchNoteRelatedNames([data]);

    res.json({
      success: true,
      data: {
        ...data,
        related_name: lookup(data),
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from(TABLES.notes).delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to delete note' });
  }
};

const getCrmSummary = async (_req, res) => {
  try {
    const [leads, deals, contacts, organizations, notes] = await Promise.all([
      executeSelect(supabase.from(TABLES.leads).select('status, source, value, owner, created_at')),
      executeSelect(supabase.from(TABLES.deals).select('stage, value, probability, close_date')),
      executeSelect(supabase.from(TABLES.contacts).select('owner, organization_id')),
      executeSelect(supabase.from(TABLES.organizations).select('status, industry')),
      executeSelect(supabase.from(TABLES.notes).select('created_at')),
    ]);

    const leadStatus = leads.reduce((acc, lead) => {
      const key = (lead.status || 'New').trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const leadSource = leads.reduce((acc, lead) => {
      const key = (lead.source || 'Unknown').trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const totalPipeline = deals.reduce((acc, deal) => acc + (parseNumber(deal.value, 0) || 0), 0);
    const weightedPipeline = deals.reduce((acc, deal) => {
      const value = parseNumber(deal.value, 0) || 0;
      const probability = parseNumber(deal.probability, 0) || 0;
      return acc + value * (probability / 100);
    }, 0);

    const dealStages = deals.reduce((acc, deal) => {
      const stage = (deal.stage || 'Prospecting').trim();
      const value = parseNumber(deal.value, 0) || 0;
      const stats = acc[stage] || { count: 0, value: 0 };
      stats.count += 1;
      stats.value += value;
      acc[stage] = stats;
      return acc;
    }, {});

    const upcomingClosings = deals.filter((deal) => {
      if (!deal.close_date) return false;
      const closeDate = new Date(deal.close_date);
      if (Number.isNaN(closeDate.getTime())) return false;
      const now = new Date();
      const diffMs = closeDate - now;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;

    const contactsWithOwner = contacts.filter((contact) => trimOrNull(contact.owner)).length;
    const contactsWithoutOrg = contacts.filter((contact) => !trimOrNull(contact.organization_id)).length;

    const orgStatus = organizations.reduce((acc, org) => {
      const status = (org.status || 'Prospect').trim();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const industries = organizations.reduce((acc, org) => {
      const industry = trimOrNull(org.industry) || 'Unspecified';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {});

    const lastNoteAt = notes
      .map((note) => (note.created_at ? new Date(note.created_at) : null))
      .filter((date) => date && !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    res.json({
      success: true,
      data: {
        leads: {
          total: leads.length,
          statusBreakdown: Object.entries(leadStatus).map(([status, count]) => ({ status, count })),
          sourceBreakdown: Object.entries(leadSource).map(([source, count]) => ({ source, count })),
        },
        deals: {
          total: deals.length,
          pipelineValue: totalPipeline,
          weightedPipeline,
          stageBreakdown: Object.entries(dealStages).map(([stage, stats]) => ({ stage, ...stats })),
          closingNext30Days: upcomingClosings,
        },
        contacts: {
          total: contacts.length,
          withOwner: contactsWithOwner,
          withoutOrganization: contactsWithoutOrg,
        },
        organizations: {
          total: organizations.length,
          statusBreakdown: Object.entries(orgStatus).map(([status, count]) => ({ status, count })),
          industryBreakdown: Object.entries(industries).map(([industry, count]) => ({ industry, count })),
        },
        notes: {
          total: notes.length,
          lastActivityAt: lastNoteAt ? lastNoteAt.toISOString() : null,
        },
      },
    });
  } catch (error) {
    respondWithError(res, error, { defaultMessage: 'Failed to load CRM summary' });
  }
};

module.exports = {
  listLeads,
  createLead,
  updateLead,
  deleteLead,
  listDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  listOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  getCrmSummary,
};
