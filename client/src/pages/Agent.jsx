import React from 'react';
import AgentPanel from '../components/AgentPanel';

const AgentPage = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <AgentPanel />
      <aside className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-gray-950/60 p-6 text-sm text-emerald-100">
        <h3 className="text-base font-semibold text-white">Quick prompts</h3>
        <ul className="space-y-3 text-xs text-emerald-200/80">
          <li className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
            <p className="font-semibold uppercase tracking-[0.3em] text-[10px]">Recruitment</p>
            <p className="mt-1 text-sm">create recruitment job title="Support Manager" department="Service"</p>
          </li>
          <li className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="font-semibold uppercase tracking-[0.3em] text-[10px]">Leaves</p>
            <p className="mt-1 text-sm">fetch leave request employee_id=42 status="pending"</p>
          </li>
          <li className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="font-semibold uppercase tracking-[0.3em] text-[10px]">Expenses</p>
            <p className="mt-1 text-sm">update expense claim id=8 status="approved"</p>
          </li>
          <li className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="font-semibold uppercase tracking-[0.3em] text-[10px]">Audit</p>
            <p className="mt-1 text-sm">show recent actions limit=5</p>
          </li>
        </ul>
        <div className="rounded-xl border border-emerald-500/20 bg-gray-950 p-4 text-xs text-emerald-200/70">
          <p className="font-semibold text-emerald-200">Tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Use short key=value pairs to target specific records.</li>
            <li>Include <code>confirm=true</code> for irreversible actions.</li>
            <li>Check the data preview to verify the outcome.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AgentPage;
