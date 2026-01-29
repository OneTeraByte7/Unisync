// src/components/Sidebar.jsx
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Bot,
  Users,
  UserCheck,
  Package,
  BadgeCheck,
  Banknote,
  FileText,
  Sparkles,
  GaugeCircle,
  Rocket,
  Briefcase,
  UserCircle2,
  Building2,
  StickyNote,
  CalendarClock,
  UserPlus,
  UserCog,
  Star,
  Receipt,
  Leaf,
  ClipboardList,
  Globe,
  Wallet,
  CircleDollarSign,
  Percent,
} from 'lucide-react';

const SUITE_META = {
  erp: {
    title: 'unisync',
    subtitle: 'Operations Center',
    badge: 'unisync',
  },
  crm: {
    title: 'CRM Suite',
    subtitle: 'Growth Workspace',
    badge: 'CRM Suite',
  },
  hr: {
    title: 'HR Suite',
    subtitle: 'People Operations',
    badge: 'HR Suite',
  },
};

const erpMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview and quick stats',
    icon: Home,
    path: '/erp',
    exact: true,
  },
  {
    id: 'agent',
    label: 'AI Agent',
    description: 'Natural language operations',
    icon: Bot,
    path: '/erp/agent',
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    description: 'Manage supplier directory',
    icon: Users,
    path: '/erp/suppliers',
  },
  {
    id: 'buyers',
    label: 'Buyers',
    description: 'Customer and buyer records',
    icon: UserCheck,
    path: '/erp/buyers',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Track stock levels',
    icon: Package,
    path: '/erp/inventory',
  },
  {
    id: 'quality',
    label: 'Quality',
    description: 'Quality checks and audits',
    icon: BadgeCheck,
    path: '/erp/quality',
  },
  {
    id: 'accounting',
    label: 'Accounting',
    description: 'Receivables and payables',
    icon: Banknote,
    path: '/erp/accounting',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Insights and analytics',
    icon: FileText,
    path: '/erp/reports',
  },
];

const crmMenuItems = [
  {
    id: 'crm-dashboard',
    label: 'Dashboard',
    description: 'Pipeline health and KPIs',
    icon: GaugeCircle,
    path: '/crm',
    exact: true,
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Capture and qualify prospects',
    icon: Rocket,
    path: '/crm/leads',
  },
  {
    id: 'deals',
    label: 'Deals',
    description: 'Track sales opportunities',
    icon: Briefcase,
    path: '/crm/deals',
  },
  {
    id: 'contacts',
    label: 'Contacts',
    description: 'Buyer relationship hub',
    icon: UserCircle2,
    path: '/crm/contacts',
  },
  {
    id: 'organizations',
    label: 'Organizations',
    description: 'Company records and hierarchies',
    icon: Building2,
    path: '/crm/organizations',
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Call notes and interactions',
    icon: StickyNote,
    path: '/crm/notes',
  },
];

const hrMenuItems = [
  { type: 'section', id: 'hr-section-public', label: 'PUBLIC' },
  {
    id: 'hr-dashboard',
    label: 'HR Overview',
    description: 'People operations pulse',
    icon: GaugeCircle,
    path: '/hr',
    exact: true,
  },
  {
    id: 'hr-recruitment',
    label: 'Recruitment',
    description: 'Source and hire talent',
    icon: UserPlus,
    path: '/hr/recruitment',
  },
  {
    id: 'hr-employee-lifecycle',
    label: 'Employee Lifecycle',
    description: 'Onboarding and growth',
    icon: UserCog,
    path: '/hr/employee-lifecycle',
  },
  {
    id: 'hr-performance',
    label: 'Performance',
    description: 'Goals and reviews',
    icon: Star,
    path: '/hr/performance',
  },
  {
    id: 'hr-shift-attendance',
    label: 'Shift & Attendance',
    description: 'Scheduling coverage',
    icon: CalendarClock,
    path: '/hr/shift-attendance',
  },
  {
    id: 'hr-expense-claims',
    label: 'Expense Claims',
    description: 'Reimbursements and audits',
    icon: Receipt,
    path: '/hr/expense-claims',
  },
  {
    id: 'hr-leaves',
    label: 'Leaves',
    description: 'Balance and approvals',
    icon: Leaf,
    path: '/hr/leaves',
  },
  {
    id: 'hr-projects',
    label: 'Projects',
    description: 'Cross-team initiatives',
    icon: ClipboardList,
    path: '/hr/projects',
  },
  {
    id: 'hr-users',
    label: 'Users',
    description: 'Provisioning and access',
    icon: Users,
    path: '/hr/users',
  },
  {
    id: 'hr-website',
    label: 'Website',
    description: 'Internal portal',
    icon: Globe,
    path: '/hr/website',
  },
  {
    id: 'hr-payroll',
    label: 'Payroll',
    description: 'Compensation hub',
    icon: Wallet,
    path: '/hr/payroll',
    children: [
      {
        id: 'hr-salary-payout',
        label: 'Salary Payout',
        description: 'Monthly run status',
        icon: CircleDollarSign,
        path: '/hr/payroll/salary-payout',
      },
      {
        id: 'hr-tax-benefits',
        label: 'Tax & Benefits',
        description: 'Deductions and perks',
        icon: Percent,
        path: '/hr/payroll/tax-benefits',
      },
    ],
  },
];

const Sidebar = ({ collapsed, setCollapsed, suite = 'erp' }) => {
  const location = useLocation();

  const menuItems = useMemo(() => {
    if (suite === 'crm') return crmMenuItems;
    if (suite === 'hr') return hrMenuItems;
    return erpMenuItems;
  }, [suite]);
  const suiteMeta = SUITE_META[suite] || SUITE_META.erp;

  const isRouteActive = (itemPath) => { 
    if (!itemPath) return false; 
    if (['/erp', '/crm', '/hr'].includes(itemPath)) { 
      return location.pathname === itemPath || location.pathname === `${itemPath}/`; 
    } 
    return location.pathname.startsWith(itemPath); 
  };

  const navItemClassName = (active) =>
    `relative group w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:ring-offset-2 focus:ring-offset-gray-900 ${
      active
        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-green-500/20'
        : 'text-gray-400 hover:text-white hover:bg-gray-900/70'
    }`;

  const renderNavItem = (item) => {
    if (item.type === 'section') {
      if (collapsed) return null;
      return (
        <div key={item.id} className="px-4 pt-5 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-500">
          {item.label}
        </div>
      );
    }

    const childActive = (item.children || []).some((child) => isRouteActive(child.path));
    const active = isRouteActive(item.path) || childActive;
    const Icon = item.icon;

    return (
      <div key={item.id} className="space-y-2">
        <NavLink
          to={item.path}
          end={Boolean(item.exact)}
          title={collapsed && item.description ? `${item.label} • ${item.description}` : undefined}
          className={({ isActive }) => navItemClassName(isActive || active)}
          aria-current={active ? 'page' : undefined}
        >
          <span
            aria-hidden="true"
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full bg-gradient-to-b from-green-500 to-blue-500 transition-opacity ${
              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
            }`}
          />
          {Icon && <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />}
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span className="font-medium leading-tight text-sm">{item.label}</span>
              {item.description && <span className="text-xs text-gray-500 leading-tight">{item.description}</span>}
            </div>
          )}
        </NavLink>

        {!collapsed && item.children && item.children.length > 0 && (
          <div className="space-y-1 pl-7">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const childActiveState = isRouteActive(child.path);
              return (
                <NavLink
                  key={child.id}
                  to={child.path}
                  end
                  className={({ isActive }) =>
                    `group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      isActive || childActiveState
                        ? 'bg-gray-900/80 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                    }`
                  }
                  aria-current={childActiveState ? 'page' : undefined}
                >
                  {ChildIcon && (
                    <ChildIcon className="h-4 w-4 flex-shrink-0 text-gray-500 group-hover:text-gray-300" />
                  )}
                  <span className="flex-1 text-left">{child.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      aria-label="Primary navigation"
      className={`bg-gray-950/85 backdrop-blur-lg border-r border-gray-900/60 shadow-[10px_0_30px_rgba(2,6,23,0.65)] transition-[width] duration-300 ease-in-out flex flex-col ${
        collapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-900/60">
        {!collapsed && (
          <div className="flex items-center gap-2 text-white">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 text-white shadow-lg shadow-green-500/30">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-300/80">{suiteMeta.badge}</p>
              <p className="font-semibold text-base">{suiteMeta.subtitle}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={!collapsed}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          {collapsed ? <Menu className="w-5 h-5" aria-hidden="true" /> : <X className="w-5 h-5" aria-hidden="true" />}
          <span className="sr-only">Toggle sidebar</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main">
        {menuItems.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  );
};

export default Sidebar;