import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const subjects = [
  { title: 'DBMS', detail: 'Joins, indexes, transactions', accent: 'from-blue-500 to-cyan-400', href: '/quiz?subjects=DBMS' },
  { title: 'OS', detail: 'Scheduling, memory, deadlocks', accent: 'from-emerald-500 to-lime-400', href: '/quiz?subjects=OS' },
  { title: 'CN', detail: 'TCP/IP, routing, security', accent: 'from-violet-500 to-fuchsia-400', href: '/quiz?subjects=CN' },
  { title: 'Java', detail: 'OOP, collections, threads', accent: 'from-orange-500 to-amber-300', href: '/quiz?subjects=Java' },
  { title: 'JavaScript', detail: 'Runtime, async, browser APIs', accent: 'from-yellow-400 to-orange-400', href: '/select?subject=JavaScript' },
  { title: 'DSA', detail: 'Arrays, trees, graphs, DP', accent: 'from-rose-500 to-pink-400', href: '/select?subject=DSA' },
  { title: 'Aptitude', detail: 'Quant, logic, reasoning', accent: 'from-teal-500 to-sky-400', href: '/select?subject=Aptitude' },
];

const practiceFeatures = [
  'Topic-wise MCQs',
  'Timed quizzes',
  'Mock tests',
  'Random MCQs',
];

const progressStats = [
  { label: 'Accuracy', value: '82%', bar: 82, tone: 'from-emerald-400 to-lime-300' },
  { label: 'Streak', value: '7 days', bar: 70, tone: 'from-amber-400 to-orange-300' },
  { label: 'Weak Topics', value: '4', bar: 38, tone: 'from-rose-400 to-red-300' },
  { label: 'Completed Quizzes', value: '24', bar: 76, tone: 'from-blue-400 to-cyan-300' },
  { label: 'Rank / XP', value: 'Rising / 1840 XP', bar: 64, tone: 'from-violet-400 to-fuchsia-300' },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const goTo = (href) => {
    router.push(href);
  };

  const startPracticing = () => {
    router.push(user ? '/select' : '/login?next=/select');
  };

  return (
    <div className="home-shell min-h-screen overflow-hidden bg-gray-950 text-white">
      <Navbar />

      <main>
        <section className="relative min-h-[calc(100vh-65px)] px-6 py-16 sm:py-20 lg:py-24">
          <FloatingBackground />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-rise">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200 shadow-lg shadow-blue-950/30 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Interview-ready MCQ preparation
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                Prepare<span className="text-blue-400">.ai</span>
                <span className="block bg-gradient-to-r from-white via-blue-100 to-emerald-200 bg-clip-text text-transparent">
                  Practice smarter. Learn faster.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                Build technical confidence with focused MCQs, subject-wise practice, timed quizzes,
                and progress insights that show exactly where to improve next.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={startPracticing}
                  className="rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-950/50 transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Start Practicing
                </button>
                <button
                  onClick={() => document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full border border-gray-700 bg-white/5 px-7 py-3 text-sm font-semibold text-gray-100 backdrop-blur transition hover:-translate-y-0.5 hover:border-gray-500 hover:bg-white/10"
                >
                  Explore Subjects
                </button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                <HeroStat value="10K+" label="MCQs" />
                <HeroStat value="7" label="Subjects" />
                <HeroStat value="24/7" label="Practice" />
              </div>
            </div>

            <div className="animate-rise-delayed">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
                <div className="rounded-3xl border border-gray-800 bg-gray-950/80 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Today&apos;s plan</p>
                      <h2 className="text-xl font-bold">Crack 30 MCQs</h2>
                    </div>
                    <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                      +120 XP
                    </div>
                  </div>

                  <div className="space-y-3">
                    {practiceFeatures.map((feature, index) => (
                      <div key={feature} className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/80 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-300">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-100">{feature}</p>
                          <div className="mt-2 h-2 rounded-full bg-gray-800">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                              style={{ width: `${62 + index * 8}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionShell id="practice">
          <FeaturePanel
            eyebrow="Practice"
            title="Choose the way you want to train"
            description="Move from topic-wise MCQs to timed quizzes, mock tests, and random practice sessions designed to keep recall sharp."
            button="Go to Practice"
            href="/select"
            visual={<PracticeVisual />}
          />
        </SectionShell>

        <SectionShell id="subjects">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Subjects</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Master the core interview stack</h2>
              <p className="mt-3 max-w-2xl text-gray-400">
                Pick a subject, start with a focused set, and keep your revision loop moving.
              </p>
            </div>
            <button
              onClick={() => goTo('/select')}
              className="w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition hover:-translate-y-0.5 hover:bg-blue-100"
            >
              Explore Subjects
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map(subject => (
              <button
                key={subject.title}
                onClick={() => goTo(subject.href)}
                className="group rounded-2xl border border-gray-800 bg-gray-900/70 p-5 text-left shadow-xl shadow-gray-950/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:bg-gray-900"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.accent} text-lg font-black text-white shadow-lg`}>
                  {subject.title.slice(0, 2)}
                </div>
                <h3 className="text-lg font-bold text-white">{subject.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{subject.detail}</p>
                <p className="mt-5 text-sm font-semibold text-blue-300 opacity-0 transition group-hover:opacity-100">
                  Start subject practice
                </p>
              </button>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="progress">
          <FeaturePanel
            eyebrow="Progress"
            title="See what is improving and what needs attention"
            description="Track accuracy, streaks, weak topics, completed quizzes, and XP in one dashboard-style view built for consistent study."
            button="View Progress"
            href="/dashboard"
            reverse
            visual={<ProgressVisual />}
          />
        </SectionShell>
      </main>
    </div>
  );
}

function SectionShell({ id, children }) {
  return (
    <section id={id} className="relative px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function FeaturePanel({ eyebrow, title, description, button, href, visual, reverse = false }) {
  const router = useRouter();

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className={reverse ? 'lg:order-2' : ''}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-xl text-gray-400 leading-7">{description}</p>
        <button
          onClick={() => router.push(href)}
          className="mt-7 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          {button}
        </button>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
    </div>
  );
}

function PracticeVisual() {
  return (
    <div className="rounded-[28px] border border-gray-800 bg-gray-900/70 p-5 shadow-2xl shadow-gray-950/40 backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2">
        {practiceFeatures.map((item, index) => (
          <div key={item} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5 transition hover:-translate-y-1 hover:border-blue-500/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-300">
              0{index + 1}
            </div>
            <h3 className="font-bold">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Short, focused sessions that build speed without turning revision into guesswork.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressVisual() {
  return (
    <div className="rounded-[28px] border border-gray-800 bg-gray-900/70 p-5 shadow-2xl shadow-gray-950/40 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Learning dashboard</p>
          <h3 className="text-xl font-bold">Weekly snapshot</h3>
        </div>
        <CircularStat value="82" />
      </div>
      <div className="space-y-4">
        {progressStats.map(stat => (
          <div key={stat.label} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-sm font-semibold text-white">{stat.value}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-800">
              <div className={`h-full rounded-full bg-gradient-to-r ${stat.tone}`} style={{ width: `${stat.bar}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircularStat({ value }) {
  return (
    <div className="relative h-20 w-20 rounded-full conic-stat">
      <div className="absolute inset-2 flex items-center justify-center rounded-full bg-gray-950">
        <span className="text-lg font-black text-emerald-300">{value}%</span>
      </div>
    </div>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

function FloatingBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute right-8 top-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-10 left-8 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />
    </div>
  );
}
