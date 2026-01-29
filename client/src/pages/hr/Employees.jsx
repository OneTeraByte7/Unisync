import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Briefcase, Mail, Phone, ArrowRightCircle, Filter } from 'lucide-react';

const MOCK_EMPLOYEES = [
  {
    id: 1,
    name: 'Amelia Chen',
    department: 'Revenue',
    role: 'Account Executive',
    email: 'amelia.chen@company.com',
    phone: '+1 (415) 555-0101',
    linkedDeal: 'Q4 Upsell – Globex',
    crmUrl: '/crm/deals',
  },
  {
    id: 2,
    name: 'Rafael Ortega',
    department: 'Operations',
    role: 'Implementation Manager',
    email: 'rafael.ortega@company.com',
    phone: '+1 (503) 555-0198',
    linkedSupplier: 'Atlas Manufacturing',
    erpUrl: '/erp/suppliers',
  },
  {
    id: 3,
    name: 'Priya Patel',
    department: 'People',
    role: 'HR Business Partner',
    email: 'priya.patel@company.com',
    phone: '+1 (737) 555-4422',
    linkedDeal: 'Enterprise Renewal – Vanta',
    crmUrl: '/crm/organizations',
  },
  {
    id: 4,
    name: 'Luca Rossi',
    department: 'Finance',
    role: 'Strategic Finance Analyst',
    email: 'luca.rossi@company.com',
    phone: '+39 02 1234 5678',
    linkedSupplier: 'Oceanic Logistics',
    erpUrl: '/erp/reports',
  },
];

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const departments = useMemo(() => {
    const list = new Set(['All']);
    MOCK_EMPLOYEES.forEach((employee) => list.add(employee.department));
    return Array.from(list);
  }, []);

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((employee) => {
      const matchesDepartment =
        departmentFilter === 'All' || employee.department.toLowerCase() === departmentFilter.toLowerCase();
      const query = searchTerm.trim().toLowerCase();
      if (!query) return matchesDepartment;
      return (
        matchesDepartment &&
        [employee.name, employee.role, employee.email, employee.department]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      );
    });
  }, [departmentFilter, searchTerm]);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team directory</h1>
          <p className="text-sm text-gray-400">
            Keep every employee connected with their CRM accounts and ERP records for a shared source of truth.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2 text-sm text-gray-300">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search people"
              className="w-48 bg-transparent text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2 text-sm text-gray-300">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="bg-transparent text-sm text-gray-100 focus:outline-none"
            >
              {departments.map((department) => (
                <option key={department} value={department} className="bg-gray-900 text-gray-900">
                  {department}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80">
        <table className="min-w-full divide-y divide-gray-800 text-sm">
          <thead className="bg-gray-900/90 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Employee</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Contact</th>
              <th className="px-5 py-3 text-left">Connected records</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="transition hover:bg-gray-900/60">
                <td className="px-5 py-4">
                  <div className="font-semibold text-white">{employee.name}</div>
                  <div className="text-xs text-gray-500">{employee.department}</div>
                </td>
                <td className="px-5 py-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-200">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    {employee.role}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm">
                  <div className="flex flex-col gap-1 text-gray-300">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {employee.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {employee.phone}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm">
                  {employee.linkedDeal ? (
                    <Link
                      to={employee.crmUrl}
                      className="inline-flex items-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 hover:bg-blue-500/20"
                    >
                      <ArrowRightCircle className="h-3.5 w-3.5" />
                      {employee.linkedDeal}
                    </Link>
                  ) : (
                    <Link
                      to={employee.erpUrl}
                      className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20"
                    >
                      <ArrowRightCircle className="h-3.5 w-3.5" />
                      {employee.linkedSupplier}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Users className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Why it matters</h2>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            Linking employees to CRM and ERP records makes approvals instantaneous—no more chasing context across
            tools.
          </p>
        </div>
        <Link
          to="/crm"
          className="flex flex-col justify-between rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 text-sm text-blue-100 transition hover:border-blue-500/50 hover:bg-blue-500/15"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/70">CRM integration</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Share pipeline context with managers</h3>
            <p className="mt-3 text-sm text-blue-100/80">
              Jump into CRM dashboards to see how hiring decisions impact revenue operations.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
            Explore CRM
            <ArrowRightCircle className="h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/erp"
          className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100 transition hover:border-emerald-500/50 hover:bg-emerald-500/15"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">ERP integration</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Check budget & vendor onboarding</h3>
            <p className="mt-3 text-sm text-emerald-100/80">
              Keep procurement and HR aligned by reviewing ERP reports tied to each team.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
            Open ERP
            <ArrowRightCircle className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
};

export default Employees;
