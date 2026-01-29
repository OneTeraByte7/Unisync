const express = require('express');
const {
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
} = require('../controllers/hrController');

const router = express.Router();

router.get('/dashboard/summary', getHrDashboardSummary);
router.get('/recruitment', getRecruitmentSummary);
router.post('/recruitment/jobs', createRecruitmentJob);
router.put('/recruitment/jobs/:id', updateRecruitmentJob);
router.delete('/recruitment/jobs/:id', deleteRecruitmentJob);
router.post('/recruitment/applications', createRecruitmentApplication);
router.put('/recruitment/applications/:id', updateRecruitmentApplication);
router.delete('/recruitment/applications/:id', deleteRecruitmentApplication);
router.get('/employee-lifecycle', getEmployeeLifecycle);
router.get('/performance', getPerformanceData);
router.get('/shift-attendance', getShiftAttendance);
router.get('/expense-claims', getExpenseClaims);
router.post('/expense-claims', createExpenseClaim);
router.put('/expense-claims/:id', updateExpenseClaim);
router.delete('/expense-claims/:id', deleteExpenseClaim);
router.get('/leaves', getLeaveData);
router.post('/leave-requests', createLeaveRequest);
router.put('/leave-requests/:id', updateLeaveRequest);
router.delete('/leave-requests/:id', deleteLeaveRequest);
router.get('/projects', getProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);
router.get('/users', getUsers);
router.get('/website', getWebsite);
router.get('/payroll/summary', getPayrollSummary);
router.get('/payroll/runs', getPayrollRuns);
router.get('/payroll/benefits', getPayrollBenefits);

module.exports = router;
