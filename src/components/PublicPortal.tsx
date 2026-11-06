'use client';

import React, { useState } from 'react';

const TEAMS = [
  { id: 't-nyl', name: 'New York Liberty', city: 'Brooklyn, NY', abbr: 'NYL', conference: 'Eastern', arena: 'Barclays Center', coach: 'Sandy Brondello', color: '#14B8A6', wins: 32, losses: 8, homeRec: '17-3', awayRec: '15-5', streak: 'W4', seed: 1 },
  { id: 't-con', name: 'Connecticut Sun', city: 'Uncasville, CT', abbr: 'CON', conference: 'Eastern', arena: 'Mohegan Sun Arena', coach: 'Rachid Meziane', color: '#EA580C', wins: 28, losses: 12, homeRec: '15-5', awayRec: '13-7', streak: 'W2', seed: 3 },
  { id: 't-ind', name: 'Indiana Fever', city: 'Indianapolis, IN', abbr: 'IND', conference: 'Eastern', arena: 'Gainbridge Fieldhouse', coach: 'Stephanie White', color: '#DC2626', wins: 24, losses: 16, homeRec: '14-6', awayRec: '10-10', streak: 'W3', seed: 5 },
  { id: 't-atl', name: 'Atlanta Dream', city: 'Atlanta, GA', abbr: 'ATL', conference: 'Eastern', arena: 'Gateway Center Arena', coach: 'Karl Smesko', color: '#E11D48', wins: 19, losses: 21, homeRec: '11-9', awayRec: '8-12', streak: 'L1', seed: 7 },
  { id: 't-chi', name: 'Chicago Sky', city: 'Chicago, IL', abbr: 'CHI', conference: 'Eastern', arena: 'Wintrust Arena', coach: 'Tyler Marsh', color: '#38BDF8', wins: 16, losses: 24, homeRec: '9-11', awayRec: '7-13', streak: 'L2', seed: 9 },
  { id: 't-was', name: 'Washington Mystics', city: 'Washington, D.C.', abbr: 'WAS', conference: 'Eastern', arena: 'Entertainment & Sports Arena', coach: 'Sydney Johnson', color: '#B91C1C', wins: 15, losses: 25, homeRec: '8-12', awayRec: '7-13', streak: 'W1', seed: 10 },
  { id: 't-min', name: 'Minnesota Lynx', city: 'Minneapolis, MN', abbr: 'MIN', conference: 'Western', arena: 'Target Center', coach: 'Cheryl Reeve', color: '#2563EB', wins: 31, losses: 9, homeRec: '17-3', awayRec: '14-6', streak: 'W5', seed: 2 },
  { id: 't-lva', name: 'Las Vegas Aces', city: 'Las Vegas, NV', abbr: 'LVA', conference: 'Western', arena: 'Michelob ULTRA Arena', coach: 'Becky Hammon', color: '#EF4444', wins: 27, losses: 13, homeRec: '15-5', awayRec: '12-8', streak: 'W1', seed: 4 },
  { id: 't-sea', name: 'Seattle Storm', city: 'Seattle, WA', abbr: 'SEA', conference: 'Western', arena: 'Climate Pledge Arena', coach: 'Noelle Quinn', color: '#15803D', wins: 25, losses: 15, homeRec: '14-6', awayRec: '11-9', streak: 'L1', seed: 6 },
  { id: 't-phx', name: 'Phoenix Mercury', city: 'Phoenix, AZ', abbr: 'PHX', conference: 'Western', arena: 'Footprint Center', coach: 'Nate Tibbetts', color: '#EA580C', wins: 20, losses: 20, homeRec: '12-8', awayRec: '8-12', streak: 'W1', seed: 8 },
  { id: 't-gsv', name: 'Golden State Valkyries', city: 'San Francisco, CA', abbr: 'GSV', conference: 'Western', arena: 'Chase Center', coach: 'Natalie Nakase', color: '#8B5CF6', wins: 14, losses: 26, homeRec: '9-11', awayRec: '5-15', streak: 'L3', seed: 11 },
  { id: 't-dal', name: 'Dallas Wings', city: 'Arlington, TX', abbr: 'DAL', conference: 'Western', arena: 'College Park Center', coach: 'Chris Koclanes', color: '#0284C7', wins: 13, losses: 27, homeRec: '8-12', awayRec: '5-15', streak: 'L4', seed: 12 },
  { id: 't-las', name: 'Los Angeles Sparks', city: 'Los Angeles, CA', abbr: 'LAS', conference: 'Western', arena: 'Crypto.com Arena', coach: 'Lynne Roberts', color: '#7E22CE', wins: 12, losses: 28, homeRec: '7-13', awayRec: '5-15', streak: 'W1', seed: 13 }
];

const PLAYERS = [
  { id: 'p-1', name: "A'ja Wilson", teamAbbr: 'LVA', teamName: 'Las Vegas Aces', pos: 'C', jersey: '22', height: '6-4', college: 'South Carolina', ppg: 26.9, rpg: 11.9, apg: 2.3, spg: 1.8, bpg: 2.6, fgPct: 51.8, threePct: 31.7, ftPct: 84.4, gp: 38, mpg: 34.4 },
  { id: 'p-2', name: 'Napheesa Collier', teamAbbr: 'MIN', teamName: 'Minnesota Lynx', pos: 'F', jersey: '24', height: '6-1', college: 'UConn', ppg: 20.4, rpg: 9.7, apg: 3.4, spg: 1.9, bpg: 1.4, fgPct: 49.2, threePct: 35.1, ftPct: 80.4, gp: 37, mpg: 34.7 },
  { id: 'p-3', name: 'Breanna Stewart', teamAbbr: 'NYL', teamName: 'New York Liberty', pos: 'F', jersey: '30', height: '6-4', college: 'UConn', ppg: 20.4, rpg: 8.5, apg: 3.5, spg: 1.7, bpg: 1.3, fgPct: 45.8, threePct: 34.2, ftPct: 84.5, gp: 38, mpg: 32.9 },
  { id: 'p-4', name: 'Caitlin Clark', teamAbbr: 'IND', teamName: 'Indiana Fever', pos: 'G', jersey: '22', height: '6-0', college: 'Iowa', ppg: 19.2, rpg: 5.7, apg: 8.4, spg: 1.3, bpg: 0.7, fgPct: 41.7, threePct: 34.4, ftPct: 90.6, gp: 40, mpg: 35.4 },
  { id: 'p-5', name: 'Sabrina Ionescu', teamAbbr: 'NYL', teamName: 'New York Liberty', pos: 'G', jersey: '20', height: '5-11', college: 'Oregon', ppg: 18.2, rpg: 4.4, apg: 6.2, spg: 1.0, bpg: 0.3, fgPct: 41.5, threePct: 36.8, ftPct: 89.8, gp: 38, mpg: 32.1 },
  { id: 'p-6', name: 'Arike Ogunbowale', teamAbbr: 'DAL', teamName: 'Dallas Wings', pos: 'G', jersey: '24', height: '5-8', college: 'Notre Dame', ppg: 22.2, rpg: 4.6, apg: 5.1, spg: 2.1, bpg: 0.3, fgPct: 38.8, threePct: 34.6, ftPct: 92.1, gp: 38, mpg: 37.9 }
];

const GAMES = [
  { id: 'g-1', date: 'Nov 5, 2026', timeET: '7:30 PM ET', status: 'FINAL', awayAbbr: 'MIN', homeAbbr: 'NYL', awayScore: 78, homeScore: 81, venue: 'Barclays Center, Brooklyn, NY', broadcast: 'ESPN' },
  { id: 'g-2', date: 'Nov 5, 2026', timeET: '9:00 PM ET', status: 'FINAL', awayAbbr: 'IND', homeAbbr: 'LVA', awayScore: 86, homeScore: 92, venue: 'Michelob ULTRA Arena, Las Vegas, NV', broadcast: 'ION' },
  { id: 'g-3', date: 'Nov 6, 2026', timeET: '7:00 PM ET', status: 'UPCOMING', awayAbbr: 'SEA', homeAbbr: 'CON', awayScore: null, homeScore: null, venue: 'Mohegan Sun Arena, Uncasville, CT', broadcast: 'CBS Sports Network' },
  { id: 'g-4', date: 'Nov 6, 2026', timeET: '10:00 PM ET', status: 'UPCOMING', awayAbbr: 'PHX', homeAbbr: 'GSV', awayScore: null, homeScore: null, venue: 'Chase Center, San Francisco, CA', broadcast: 'Prime Video' }
];

const ARTICLES = [
  {
    id: 'a-1',
    title: 'Liberty and Lynx Showcase Championship-Caliber Half-Court Execution in Barclays Showdown',
    category: 'Game Recaps',
    author: 'Maya Henderson • Senior WNBA Beat Writer',
    publishedAt: 'Nov 5, 2026 • 1:45 PM ET',
    excerpt: 'New York and Minnesota traded defensive adjustments across four quarters in Brooklyn, highlighting how versatility at the four and five spots defines the WNBA title picture.'
  },
  {
    id: 'a-2',
    title: 'How Pace-and-Space Shooting Volume Is Redefining WNBA Offensive Efficiency Numbers',
    category: 'Tactical Analysis',
    author: 'Jordan Vance • Analytics & Film Editor',
    publishedAt: 'Nov 5, 2026 • 11:20 AM ET',
    excerpt: 'Early-clock three-point attempts and drag-screen actions have pushed offensive ratings to historic highs while stretching traditional drop coverage.'
  },
  {
    id: 'a-3',
    title: 'Front-Office Cap Sheet Outlook: Key Free Agency Priorities and Expansion Roster Strategy',
    category: 'Trade & Free Agency',
    author: 'Marcus Sterling • Cap & Business Insider',
    publishedAt: 'Nov 4, 2026 • 2:10 PM ET',
    excerpt: 'With Golden State establishing its Western Conference rotation, general managers are balancing core designations with flexible contracts.'
  }
];

export default function PublicPortal({ initialTab = 'home' }: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  // NOTE: Notice there is NO Admin button in the public navigation bar.
  // Regular visitors only see public sports & news routes.
  // Administrators access the dashboard directly via /login or /admin.
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'news', label: 'Latest News' },
    { id: 'scores', label: 'Live Scores' },
    { id: 'standings', label: 'Standings' },
    { id: 'players', label: 'Players' },
    { id: 'teams', label: 'Teams' },
    { id: 'stats', label: 'Statistics' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'about', label: 'About' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-hoops-navy text-slate-100">
      {/* Breaking News Ticker */}
      <div className="bg-hoops-orange text-white text-xs font-semibold py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto whitespace-nowrap">
          <span className="bg-slate-950 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">Breaking</span>
          <span>Liberty edge Lynx 81-78 at Barclays Center • WNBA announces updated primetime national broadcast windows (ET)</span>
        </div>
      </div>

      {/* Main Public Header (No Admin Link Visible to Public Visitors) */}
      <header className="bg-hoops-charcoal border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => setActiveTab('home')} className="text-left">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              WNBA <span className="text-hoops-orange">HOOPS</span> NEWS
            </div>
            <p className="text-xs text-slate-400">Your Daily Source for Women&apos;s Basketball.</p>
          </button>

          <div className="w-full sm:w-72">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, players, teams..."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-hoops-orange"
            />
          </div>
        </div>

        <nav className="bg-slate-900/90 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-hoops-orange text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Game Center Strip */}
        {(activeTab === 'home' || activeTab === 'scores' || activeTab === 'schedule') && (
          <section className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-wide text-hoops-orange">WNBA Game Center &amp; Schedule (America/New_York ET)</h2>
              <span className="text-xs text-slate-400">Verified SportsDataProvider</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GAMES.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                    <span className="text-hoops-orange">{g.status}</span>
                    <span>{g.date} • {g.timeET}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>{g.awayAbbr}</span>
                    <span>{g.awayScore ?? '—'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>{g.homeAbbr}</span>
                    <span>{g.homeScore ?? '—'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    {g.venue} ({g.broadcast})
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* News Section */}
        {(activeTab === 'home' || activeTab === 'news') && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-wide">Latest WNBA News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARTICLES.filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())).map((art) => (
                <article key={art.id} className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded bg-hoops-orange/20 text-hoops-orange text-xs font-bold uppercase">{art.category}</span>
                    <h3 className="text-xl font-bold text-white leading-snug">{art.title}</h3>
                    <p className="text-sm text-slate-300">{art.excerpt}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
                    <span>{art.author}</span>
                    <span>{art.publishedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Standings Section */}
        {(activeTab === 'home' || activeTab === 'standings' || activeTab === 'teams') && (
          <section className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-wide">WNBA Standings &amp; Franchises</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-3">Conference</th>
                    <th className="py-3 px-3">Arena</th>
                    <th className="py-3 px-3 text-right">W</th>
                    <th className="py-3 px-3 text-right">L</th>
                    <th className="py-3 px-3 text-center">Home</th>
                    <th className="py-3 px-3 text-center">Away</th>
                    <th className="py-3 px-3 text-center">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {TEAMS.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-white">{t.name} ({t.abbr})</td>
                      <td className="py-3 px-3">{t.conference}</td>
                      <td className="py-3 px-3 text-slate-400">{t.arena}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-hoops-orange">{t.wins}</td>
                      <td className="py-3 px-3 text-right font-mono">{t.losses}</td>
                      <td className="py-3 px-3 text-center font-mono">{t.homeRec}</td>
                      <td className="py-3 px-3 text-center font-mono">{t.awayRec}</td>
                      <td className="py-3 px-3 text-center font-bold">{t.streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Players & Statistics Section */}
        {(activeTab === 'home' || activeTab === 'players' || activeTab === 'stats') && (
          <section className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-wide">WNBA Player Statistical Leaders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-3">Player</th>
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-3">Pos</th>
                    <th className="py-3 px-3 text-right">PPG</th>
                    <th className="py-3 px-3 text-right">RPG</th>
                    <th className="py-3 px-3 text-right">APG</th>
                    <th className="py-3 px-3 text-right">FG%</th>
                    <th className="py-3 px-3 text-right">3P%</th>
                    <th className="py-3 px-3 text-right">FT%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {PLAYERS.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-sans font-bold text-white">{p.name}</td>
                      <td className="py-3 px-3 font-sans">{p.teamAbbr}</td>
                      <td className="py-3 px-3 font-sans text-slate-400">{p.pos}</td>
                      <td className="py-3 px-3 text-right font-bold text-hoops-orange">{p.ppg.toFixed(1)}</td>
                      <td className="py-3 px-3 text-right">{p.rpg.toFixed(1)}</td>
                      <td className="py-3 px-3 text-right">{p.apg.toFixed(1)}</td>
                      <td className="py-3 px-3 text-right">{p.fgPct.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right">{p.threePct.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right">{p.ftPct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* About Section */}
        {activeTab === 'about' && (
          <section className="bg-hoops-charcoal border border-slate-800 rounded-2xl p-6 space-y-3">
            <h2 className="text-2xl font-bold uppercase text-hoops-orange">About WNBA Hoops News</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              WNBA Hoops News is an independent American women&apos;s basketball news and statistics portal. All AI-assisted drafts require mandatory human editor verification before publication.
            </p>
          </section>
        )}

        {/* Newsletter Opt-In */}
        <section className="bg-slate-900 border border-hoops-orange/40 rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-xl font-bold uppercase">Subscribe to the Daily WNBA Shootaround Briefing</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNewsletterMsg('Thank you for subscribing to WNBA Hoops News!');
            }}
            className="max-w-md mx-auto flex gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
            />
            <button type="submit" className="px-5 py-2 rounded-lg bg-hoops-orange text-white text-sm font-bold">
              Subscribe
            </button>
          </form>
          {newsletterMsg && <p className="text-xs text-emerald-400 font-semibold">{newsletterMsg}</p>}
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © 2026 WNBA Hoops News • Your Daily Source for Women&apos;s Basketball.
      </footer>
    </div>
  );
}
