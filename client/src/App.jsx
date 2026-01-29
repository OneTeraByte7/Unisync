// src/App.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SupplierList from './pages/SupplierList';
import AddSupplier from './pages/AddSupplier';
import Buyers from './pages/Buyers';
import Inventory from './pages/Inventory';
import Quality from './pages/Quality';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import AgentPage from './pages/Agent';
import Landing from './pages/Landing';
import CrmDashboard from './pages/crm/CrmDashboard';
import Leads from './pages/crm/Leads';
import Deals from './pages/crm/Deals';
import Contacts from './pages/crm/Contacts';
import Organizations from './pages/crm/Organizations';
import Notes from './pages/crm/Notes';
import HrDashboard from './pages/hr/HrDashboard';
import HrEmployees from './pages/hr/Employees';
import HrTimeOff from './pages/hr/TimeOff';
import HrPerformance from './pages/hr/Performance';
import HrRecruitment from './pages/hr/Recruitment';
import HrEmployeeLifecycle from './pages/hr/EmployeeLifecycle';
import HrShiftAttendance from './pages/hr/ShiftAttendance';
import HrExpenseClaims from './pages/hr/ExpenseClaims';
import HrLeaves from './pages/hr/Leaves';
import HrProjects from './pages/hr/Projects';
import HrUsers from './pages/hr/Users';
import HrWebsite from './pages/hr/Website';
import HrPayroll from './pages/hr/Payroll';
import HrSalaryPayout from './pages/hr/SalaryPayout';
import HrTaxBenefits from './pages/hr/TaxBenefits';
import SuitePasswordModal from './components/SuitePasswordModal';

const LOCAL_STORAGE_KEY = 'suite-preference';
const AUTH_STORAGE_KEY = 'suite-access';
const SUITE_PASSWORDS = {
  erp: 'erp123',
  crm: 'crm123',
  hr: 'hr123',
};
const SUITE_KEYS = Object.keys(SUITE_PASSWORDS);
const PASSWORD_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

const normalizeAuthorizedSuites = (value) => {
  if (!value) {
    return {};
  }

  const result = {};

  if (Array.isArray(value)) {
    value.forEach((suite) => {
      if (SUITE_KEYS.includes(suite)) {
        result[suite] = 0; // force re-entry on upgrade
      }
    });
    return result;
  }

  if (typeof value === 'object' && value !== null) {
    Object.entries(value).forEach(([suite, expiry]) => {
      if (!SUITE_KEYS.includes(suite)) {
        return;
      }
      if (typeof expiry === 'number' && Number.isFinite(expiry)) {
        result[suite] = expiry;
      }
    });
  }

  return result;
};

const cleanExpiredSuites = (record = {}) => {
  const now = Date.now();
  let changed = false;
  const next = {};

  Object.entries(record).forEach(([suite, expiry]) => {
    if (!SUITE_KEYS.includes(suite)) {
      changed = true;
      return;
    }

    if (typeof expiry === 'number' && expiry > now) {
      next[suite] = expiry;
    } else {
      changed = true;
    }
  });

  if (!changed && Object.keys(record).length === Object.keys(next).length) {
    return record;
  }

  return next;
};

const loadAuthorizedSuites = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored);
    return cleanExpiredSuites(normalizeAuthorizedSuites(parsed));
  } catch (error) {
    console.warn('Failed to parse suite access cache', error);
    return {};
  }
};

const getSuiteFromPath = (pathname) => {
  if (!pathname) {
    return null;
  }
  const [maybeSuite] = pathname.replace(/^\//, '').split('/');
  return SUITE_KEYS.includes(maybeSuite) ? maybeSuite : null;
};

const LOCKED_SUITE_COPY = {
  erp: {
    title: 'unisync Suite',
    description: 'Enter the unisync password to access supply-chain operations and analytics.',
  },
  crm: {
    title: 'CRM Suite',
    description: 'Provide the CRM password to manage deals, contacts, and revenue insights.',
  },
  hr: {
    title: 'HR Suite',
    description: 'Unlock the HR workspace to review talent, payroll, and workforce analytics.',
  },
};

const LockedSuiteState = ({ suite, onUnlock }) => {
  const copy = LOCKED_SUITE_COPY[suite] || {
    title: 'Suite locked',
    description: 'Enter the assigned password to continue.',
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/80 px-8 py-16 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-green-400">Access required</p>
      <h2 className="mt-4 text-3xl font-bold text-white">{copy.title}</h2>
      <p className="mt-3 text-sm text-gray-400">{copy.description}</p>
      <button
        type="button"
        onClick={onUnlock}
        className="mt-6 inline-flex items-center rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/70"
      >
        Enter password
      </button>
    </div>
  );
};

const SuiteLayout = ({ suite, activeSuite, onSuiteChange, isLocked, onUnlock }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSuiteChange = useCallback(
    (nextSuite) => {
      if (!nextSuite || nextSuite === activeSuite) {
        return;
      }
      onSuiteChange?.(nextSuite);
    },
    [activeSuite, onSuiteChange]
  );

  return (
    <div
      className="min-h-screen flex flex-col text-gray-100 bg-transparent"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      <Header activeSuite={activeSuite} onSuiteChange={handleSuiteChange} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar suite={suite} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="flex-1 overflow-auto px-8 py-8 md:px-12 md:py-10 xl:px-16 xl:py-12 bg-transparent">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-10">
            {isLocked ? <LockedSuiteState suite={suite} onUnlock={onUnlock} /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSuite, setActiveSuite] = useState(() => {
    if (typeof window === 'undefined') {
      return 'erp';
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return SUITE_KEYS.includes(stored) ? stored : 'erp';
  });

  const [authorizedSuites, setAuthorizedSuites] = useState(() => loadAuthorizedSuites());

  const [passwordModalSuite, setPasswordModalSuite] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isSuiteAuthorized = useCallback(
    (suite) => {
      if (!suite) {
        return false;
      }

      const expiry = authorizedSuites?.[suite];
      if (typeof expiry !== 'number') {
        return false;
      }

      const now = Date.now();
      if (expiry > now) {
        return true;
      }

      setAuthorizedSuites((prev) => {
        if (!prev?.[suite]) {
          return prev;
        }
        const next = { ...prev };
        delete next[suite];
        return next;
      });
      return false;
    },
    [authorizedSuites, setAuthorizedSuites]
  );

  const openPasswordModal = useCallback((suite) => {
    if (!suite) {
      return;
    }
    setPasswordModalSuite(suite);
    setPasswordValue('');
    setPasswordError('');
  }, []);

  const closePasswordModal = useCallback(() => {
    setPasswordModalSuite(null);
    setPasswordValue('');
    setPasswordError('');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, activeSuite);
  }, [activeSuite]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authorizedSuites));
  }, [authorizedSuites]);

  useEffect(() => {
    setAuthorizedSuites((prev) => cleanExpiredSuites(prev));
    const interval = setInterval(() => {
      setAuthorizedSuites((prev) => cleanExpiredSuites(prev));
    }, SESSION_CLEANUP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initialSuite = getSuiteFromPath(location.pathname);
    if (initialSuite && initialSuite !== activeSuite) {
      if (isSuiteAuthorized(initialSuite)) {
        setActiveSuite(initialSuite);
      } else {
        openPasswordModal(initialSuite);
      }
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!SUITE_KEYS.includes(activeSuite)) {
      setActiveSuite('erp');
      return;
    }
    if (!isSuiteAuthorized(activeSuite) && !passwordModalSuite) {
      openPasswordModal(activeSuite);
    }
  }, [activeSuite, isSuiteAuthorized, openPasswordModal, passwordModalSuite]);

  useEffect(() => {
    // preserve the landing page when user is at root
    if (location.pathname === '/') return;
    const targetPath = `/${activeSuite}`;
    if (!location.pathname.startsWith(targetPath)) {
      navigate(targetPath, { replace: true });
    }
  }, [activeSuite, location.pathname, navigate]);

  const handleSuiteChange = useCallback(
    (nextSuite) => {
      if (!nextSuite || nextSuite === activeSuite) {
        return true;
      }

      if (!SUITE_KEYS.includes(nextSuite)) {
        setActiveSuite('erp');
        return true;
      }

      if (isSuiteAuthorized(nextSuite)) {
        setActiveSuite(nextSuite);
        return true;
      }

      openPasswordModal(nextSuite);
      return false;
    },
    [activeSuite, isSuiteAuthorized, openPasswordModal]
  );

  const handlePasswordSubmit = useCallback(
    (event) => {
      event?.preventDefault?.();
      if (!passwordModalSuite) {
        return;
      }

      const expected = SUITE_PASSWORDS[passwordModalSuite];
      if ((passwordValue || '').trim() === expected) {
        setAuthorizedSuites((prev) => {
          const next = { ...(prev || {}) };
          next[passwordModalSuite] = Date.now() + PASSWORD_SESSION_TTL_MS;
          return next;
        });
        setActiveSuite(passwordModalSuite);
        closePasswordModal();
      } else {
        setPasswordError('Incorrect password. Try again.');
      }
    },
    [closePasswordModal, passwordModalSuite, passwordValue]
  );

  const suitesLockedState = useMemo(() => {
    const now = Date.now();
    const state = {};
    SUITE_KEYS.forEach((suite) => {
      const expiry = authorizedSuites?.[suite];
      state[suite] = !(typeof expiry === 'number' && expiry > now);
    });
    return state;
  }, [authorizedSuites]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/erp"
          element={
            <SuiteLayout
              suite="erp"
              activeSuite={activeSuite}
              onSuiteChange={handleSuiteChange}
              isLocked={suitesLockedState.erp}
              onUnlock={() => openPasswordModal('erp')}
            />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="suppliers" element={<SupplierList />} />
          <Route path="add-supplier" element={<AddSupplier />} />
          <Route path="buyers" element={<Buyers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="quality" element={<Quality />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="reports" element={<Reports />} />
          <Route path="agent" element={<AgentPage />} />
        </Route>

        <Route
          path="/crm"
          element={
            <SuiteLayout
              suite="crm"
              activeSuite={activeSuite}
              onSuiteChange={handleSuiteChange}
              isLocked={suitesLockedState.crm}
              onUnlock={() => openPasswordModal('crm')}
            />
          }
        >
          <Route index element={<CrmDashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="deals" element={<Deals />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="notes" element={<Notes />} />
        </Route>

        <Route
          path="/hr"
          element={
            <SuiteLayout
              suite="hr"
              activeSuite={activeSuite}
              onSuiteChange={handleSuiteChange}
              isLocked={suitesLockedState.hr}
              onUnlock={() => openPasswordModal('hr')}
            />
          }
        >
          <Route index element={<HrDashboard />} />
          <Route path="recruitment" element={<HrRecruitment />} />
          <Route path="employee-lifecycle" element={<HrEmployeeLifecycle />} />
          <Route path="employees" element={<HrEmployees />} />
          <Route path="time-off" element={<HrTimeOff />} />
          <Route path="performance" element={<HrPerformance />} />
          <Route path="shift-attendance" element={<HrShiftAttendance />} />
          <Route path="expense-claims" element={<HrExpenseClaims />} />
          <Route path="leaves" element={<HrLeaves />} />
          <Route path="projects" element={<HrProjects />} />
          <Route path="users" element={<HrUsers />} />
          <Route path="website" element={<HrWebsite />} />
          <Route path="payroll" element={<HrPayroll />} />
          <Route path="payroll/salary-payout" element={<HrSalaryPayout />} />
          <Route path="payroll/tax-benefits" element={<HrTaxBenefits />} />
        </Route>

        <Route path="*" element={<Navigate to={`/${activeSuite}`} replace />} />
      </Routes>

      <SuitePasswordModal
        suite={passwordModalSuite}
        value={passwordValue}
        onChange={setPasswordValue}
        error={passwordError}
        onCancel={closePasswordModal}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;