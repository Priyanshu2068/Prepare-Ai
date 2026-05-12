import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const practiceItems = [
  { label: 'Topic-wise MCQs', href: '/select' },
  { label: 'Random Quiz', href: '/quiz' },
  { label: 'Timed Quiz', href: '/quiz?mode=timed' },
  { label: 'Previous Year Questions', href: '/select?mode=pyq' },
  { label: 'Mock Tests', href: '/select?mode=mock' },
];

const subjectItems = [
  { label: 'DBMS', href: '/quiz?subjects=DBMS', available: true },
  { label: 'OS', href: '/quiz?subjects=OS', available: true },
  { label: 'CN', href: '/quiz?subjects=CN', available: true },
  { label: 'Java', href: '/quiz?subjects=Java', available: true },
  { label: 'JavaScript', available: false },
  { label: 'DSA', available: false },
  { label: 'Aptitude', available: false },
];

const adminItems = [
  { label: 'Overview', href: '/admin?tab=Overview' },
  { label: 'Users', href: '/admin?tab=Users' },
  { label: 'Subjects', href: '/admin?tab=Subjects' },
  { label: 'Questions', href: '/admin?tab=Questions' },
  { label: 'Quiz Controls', href: '/admin?tab=Quiz%20Controls' },
];

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getStats } = useSession();
  const [openMenu, setOpenMenu] = useState(null);
  const [search, setSearch] = useState('');
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const shouldUseLight = savedTheme === 'light';
    setIsLight(shouldUseLight);
    document.documentElement.classList.toggle('light', shouldUseLight);
  }, []);

  const stats = getStats();
  const isAdmin = user?.role === 'admin';
  const accuracy = stats?.averageScore ?? 0;
  const completedQuizzes = stats?.totalQuizzes ?? 0;
  const weakTopics = stats?.weakTopics ?? [];
  const xp = completedQuizzes * 100 + accuracy * 5;
  const rank = xp >= 1200 ? 'Pro' : xp >= 600 ? 'Rising' : 'Starter';
  const displayName = user?.name || 'Learner';
  const initials = (displayName || 'L')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const goTo = (href) => {
    setOpenMenu(null);
    router.push(href);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    goTo(isAdmin ? `/admin?search=${encodeURIComponent(query)}` : `/select?search=${encodeURIComponent(query)}`);
  };

  const toggleTheme = () => {
    const nextIsLight = !isLight;
    setIsLight(nextIsLight);
    document.documentElement.classList.toggle('light', nextIsLight);
    localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
  };

  const handleLogout = () => {
    if (!user) {
      goTo('/login');
      return;
    }
    logout();
    setOpenMenu(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 text-white">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center min-w-0">
          <button
            onClick={() => goTo('/')}
            className="text-xl font-bold flex-shrink-0"
          >
            Prepare<span className="text-blue-500">.ai</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 lg:gap-6 flex-1">
          <button
            onClick={() => setOpenMenu(openMenu === 'mobile' ? null : 'mobile')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-950/70 text-gray-300 transition hover:border-blue-500 hover:text-white md:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>

          <div className="hidden md:flex items-center justify-end gap-4 lg:gap-6">
            {isAdmin ? (
              adminItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => goTo(item.href)}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white transition"
                >
                  {item.label}
                </button>
              ))
            ) : (
              <>
            <Dropdown
              label="Practice"
              name="practice"
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <div className="w-56 rounded-lg border border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
                {practiceItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => goTo(item.href)}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Dropdown>

            <Dropdown
              label="Subjects"
              name="subjects"
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <div className="w-52 rounded-lg border border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
                {subjectItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => item.available && goTo(item.href)}
                    disabled={!item.available}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                      item.available
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <span>{item.label}</span>
                    {!item.available && <span className="text-[10px] uppercase tracking-wide">Soon</span>}
                  </button>
                ))}
              </div>
            </Dropdown>

            <Dropdown
              label="Progress"
              name="progress"
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
            >
              <div className="w-80 rounded-lg border border-gray-800 bg-gray-900 shadow-xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <ProgressMetric label="Accuracy" value={`${accuracy}%`} tone="text-green-400" />
                  <ProgressMetric label="Streak" value={`${completedQuizzes} quiz${completedQuizzes === 1 ? '' : 'zes'}`} tone="text-yellow-400" />
                  <ProgressMetric label="Completed Quizzes" value={completedQuizzes} tone="text-blue-400" />
                  <ProgressMetric label="Rank / XP" value={`${rank} / ${xp} XP`} tone="text-purple-400" />
                </div>
                <div className="mt-3 rounded-lg bg-gray-950 border border-gray-800 p-3">
                  <p className="text-xs text-gray-500 mb-2">Weak Topics</p>
                  {weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {weakTopics.slice(0, 4).map(topic => (
                        <span key={topic.topic} className="text-xs bg-red-950 text-red-300 border border-red-900 px-2 py-1 rounded">
                          {topic.topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No weak topics yet</p>
                  )}
                </div>
              </div>
            </Dropdown>
              </>
            )}
          </div>

          <form onSubmit={handleSearch} className="hidden lg:block w-full max-w-xs">
            <label className="relative block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isAdmin ? 'Search admin records' : 'Search subjects or topics'}
                className="w-full rounded-full border border-gray-800 bg-gray-950/80 py-2 pl-10 pr-4 text-sm text-gray-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </form>

          <button
            onClick={toggleTheme}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-950/70 text-gray-300 hover:border-blue-500 hover:text-white transition"
            aria-label="Toggle dark and light mode"
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>

          <div className="relative group flex-shrink-0">
            <button
              onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center transition"
              aria-label="Profile menu"
            >
              {initials || 'U'}
            </button>
            <div className="absolute right-0 top-full mt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
              <div className="rounded bg-gray-800 border border-gray-700 px-3 py-1 text-xs text-gray-200 whitespace-nowrap">
                Hello, {displayName}
              </div>
            </div>
            {openMenu === 'profile' && (
              <div
                onMouseLeave={() => setOpenMenu(null)}
                className="absolute right-0 top-full mt-12 w-44 rounded-lg border border-gray-800 bg-gray-900 shadow-xl overflow-hidden"
              >
              <button
                onClick={() => goTo(user ? (isAdmin ? '/admin' : '/dashboard') : '/login')}
                className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition"
                >
                  {user ? 'Logout' : 'Login'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {openMenu === 'mobile' && (
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <label className="relative block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isAdmin ? 'Search admin records' : 'Search subjects or topics'}
                className="w-full rounded-full border border-gray-800 bg-gray-950/80 py-2 pl-10 pr-4 text-sm text-gray-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </form>

          <div className="grid gap-2">
            {(isAdmin ? adminItems : [...practiceItems.slice(0, 3), { label: 'Subjects', href: '/select' }, { label: 'Progress', href: '/dashboard' }]).map(item => (
              <button
                key={item.label}
                onClick={() => goTo(item.href)}
                className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-3 text-left text-sm text-gray-300"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-3 text-left text-sm text-gray-300"
            >
              {isLight ? 'Use dark mode' : 'Use light mode'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Dropdown({ label, name, openMenu, setOpenMenu, children }) {
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(name)}
    >
      <button
        onClick={() => setOpenMenu(openMenu === name ? null : name)}
        className="px-3 py-2 text-sm text-gray-300 hover:text-white transition"
      >
        {label}
      </button>
      {openMenu === name && (
        <div
          onMouseLeave={() => setOpenMenu(null)}
          className="absolute left-0 top-full mt-2"
        >
          {children}
        </div>
      )}
    </div>
  );
}

function ProgressMetric({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-gray-950 border border-gray-800 p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
