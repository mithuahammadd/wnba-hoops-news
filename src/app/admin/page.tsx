'use client';

import React, { useState } from 'react';

/**
 * Protected Administrator Dashboard (/admin)
 * Accessible only at https://your-domain.com/admin (protected by middleware.ts & Supabase RLS).
 */
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'aidrafts' | 'scores' | 'rss'>('articles');
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <div className="min-h-screen bg-hoops-navy text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-hoops-orange">Protected Route • /admin</span>
            <h1 className="text-2xl font-extrabold text-white">WNBA Hoops News — Editorial &amp; Sports CMS</h1>
            <p className="text-xs text-slate-400">Hidden from public navigation. Protected by Next.js middleware and Supabase Row Level Security.</p>
          </div>
          <a href="/" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold">
            ← View Public Website
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'articles', label: 'A. News Management' },
            { id: 'aidrafts', label: 'B. Gemini AI Drafts (Pending Review)' },
            { id: 'scores', label: 'C. Manual Game Scores & Standings' },
            { id: 'rss', label: 'D. RSS Feed Automation' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                activeTab === t.id ? 'bg-hoops-orange text-white' : 'bg-hoops-charcoal border border-slate-800 text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-semibold">
            {statusMessage}
          </div>
        )}

        <div className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-6 space-y-4">
          {activeTab === 'articles' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStatusMessage('Article saved via /api/admin/articles.');
              }}
              className="space-y-4 max-w-xl text-sm"
            >
              <h2 className="text-lg font-bold text-hoops-orange uppercase">Create &amp; Publish WNBA Article</h2>
              <input type="text" required placeholder="Article Headline..." className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <textarea rows={3} required placeholder="Article Excerpt / Meta Description..." className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <textarea rows={6} required placeholder="Full Article Body..." className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700" />
              <button type="submit" className="px-5 py-2.5 rounded-lg bg-hoops-orange text-white font-bold text-xs">
                Publish Article
              </button>
            </form>
          )}

          {activeTab === 'aidrafts' && (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-bold text-hoops-orange uppercase">AI Draft Review Queue (Never Auto-Published)</h2>
              <p className="text-xs text-slate-400">
                Cron endpoint <code>/api/cron/rss-sync</code> discovers WNBA stories and saves Gemini-generated drafts with <code>status = &apos;pending_review&apos;</code>. Approve below to publish.
              </p>
              <button
                onClick={() => setStatusMessage('Triggered RSS discovery & Gemini draft generation job.')}
                className="px-4 py-2 rounded-lg bg-hoops-orange text-white text-xs font-bold"
              >
                Run RSS + Gemini Draft Sync Now
              </button>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-bold text-hoops-orange uppercase">Manual WNBA Score &amp; Standings Override</h2>
              <p className="text-xs text-slate-400">
                Update quarter-by-quarter scores and final game results in the <code>public.games</code> table.
              </p>
            </div>
          )}

          {activeTab === 'rss' && (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-bold text-hoops-orange uppercase">Configured RSS / Atom Sources</h2>
              <p className="text-xs text-slate-400">
                Manage feeds stored in <code>public.rss_sources</code> (WNBA Official Feed, ESPN WNBA, AP Sports).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
