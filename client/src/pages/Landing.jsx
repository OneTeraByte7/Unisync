import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-gray-100">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-tr from-white/3 via-white/5 to-white/2 border border-white/5 backdrop-blur-md p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                unisync
                <span className="text-emerald-300"> ·</span>
                <span className="block text-lg md:inline text-gray-300 font-semibold ml-2">Modular ERP · HR · CRM</span>
              </h1>

              <p className="mt-6 text-gray-300 text-lg">A compact, extensible operations suite combining HR, CRM and core ERP workflows. Built with React, Vite and Supabase-ready schemas — designed for rapid development and easy customization.</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/erp" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow hover:scale-[1.02] transform transition">
                  Try unisync
                </Link>
                <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition">
                  Learn more
                </a>
              </div>

              <div className="mt-6 flex gap-4 items-center text-sm text-gray-400">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Realtime-ready</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse delay-150" />
                  <span>Component-driven UI</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-pulse delay-300" />
                  <span>Supabase schemas</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-96">
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute -left-10 -top-10 w-48 h-48 bg-gradient-to-br from-emerald-500/30 to-blue-400/10 blur-3xl opacity-70 animate-blob" />
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gradient-to-br from-pink-500/20 to-violet-400/10 blur-3xl opacity-60 animate-blob animation-delay-2000" />

                <div className="relative z-10 bg-gradient-to-b from-gray-900/60 to-gray-900/40 border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-white font-semibold">Quick tour</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-300">
                    <li>• CRM: leads, deals, contacts</li>
                    <li>• HR: employees, attendance, payroll</li>
                    <li>• ERP: inventory, suppliers, accounting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <section id="features" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 backdrop-blur-sm hover:scale-[1.02] transition">
              <h4 className="font-semibold text-white">Customizable</h4>
              <p className="mt-2 text-sm text-gray-300">Component-first architecture makes it easy to extend pages and replace modules.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 backdrop-blur-sm hover:scale-[1.02] transition">
              <h4 className="font-semibold text-white">Supabase Ready</h4>
              <p className="mt-2 text-sm text-gray-300">SQL schema files included for CRM and HR — get a database started quickly.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 backdrop-blur-sm hover:scale-[1.02] transition">
              <h4 className="font-semibold text-white">Developer Friendly</h4>
              <p className="mt-2 text-sm text-gray-300">Built with Vite for fast refresh and a familiar React + Tailwind stack.</p>
            </div>
          </section>
          {/* Team section — centered and directly below main card */}
          <section id="team" className="mt-10 flex items-center justify-center">
            <div className="max-w-2xl w-full flex items-center justify-center">
              {/* Team card (click to open profile) */}
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="cursor-pointer p-4 rounded-xl bg-white/3 border border-white/5 backdrop-blur-sm flex items-center gap-4 hover:scale-[1.02] transition w-full max-w-md"
              >
                <img src="/3.jpg" alt="Soham J Suryawanshi" className="w-16 h-16 rounded-full object-cover shadow-lg" loading="lazy" />
                <div>
                  <p className="text-sm text-gray-300">Soham J Suryawanshi</p>
                  <p className="mt-1 text-xs text-gray-400">Project Owner</p>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Profile modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative max-w-xl w-full bg-gradient-to-b from-gray-900/90 to-gray-900/80 border border-white/5 rounded-2xl p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setProfileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
              aria-label="Close profile"
            >
              ✕
            </button>

            <div className="flex items-start gap-6">
              <img src="/3.jpg" alt="Soham J Suryawanshi" className="w-28 h-28 rounded-xl object-cover shadow-lg" />
              <div>
                <h4 className="text-2xl font-semibold">Soham J Suryawanshi</h4>
                <p className="mt-1 text-sm text-gray-300">Project Owner</p>

                <div className="mt-4 text-sm text-gray-300 space-y-2">
                  <p>BTech, CSE — Pune</p>
                  <p>3x Hackathon Winner</p>
                  <p>SDE &amp; ML Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
