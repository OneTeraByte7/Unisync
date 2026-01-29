const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/crmController');

router.get('/dashboard/summary', getCrmSummary);

router.get('/leads', listLeads);
router.post('/leads', createLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);

router.get('/deals', listDeals);
router.post('/deals', createDeal);
router.put('/deals/:id', updateDeal);
router.delete('/deals/:id', deleteDeal);

router.get('/contacts', listContacts);
router.post('/contacts', createContact);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

router.get('/organizations', listOrganizations);
router.post('/organizations', createOrganization);
router.put('/organizations/:id', updateOrganization);
router.delete('/organizations/:id', deleteOrganization);

router.get('/notes', listNotes);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;
