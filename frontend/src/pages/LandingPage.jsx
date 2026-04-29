import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Sparkles, ShieldCheck, Wand2 } from 'lucide-react';

const features = [
  {
    title: 'Optimization',
    description: 'Turn rough instructions into cleaner, sharper prompts with guided refinement.',
    icon: Wand2,
    accent: 'linear-gradient(135deg, rgba(59, 130, 246, 0.24), rgba(14, 165, 233, 0.12))',
  },
  {
    title: 'Benchmarking',
    description: 'Compare prompt variants against consistent evaluation signals before you ship.',
    icon: BarChart3,
    accent: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(34, 197, 94, 0.12))',
  },
  {
    title: 'Scoring',
    description: 'See quality, structure, and readiness scores in a format that is easy to act on.',
    icon: ShieldCheck,
    accent: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22), rgba(245, 158, 11, 0.12))',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] rounded-b-[3rem] opacity-90 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.34), transparent 32%), radial-gradient(circle at 80% 15%, rgba(168, 85, 247, 0.32), transparent 30%), linear-gradient(135deg, rgba(15, 23, 42, 0.05), rgba(14, 165, 233, 0.06))',
          }}
        />

        <header className="flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#ffffff',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--text-muted)' }}>
                PromptForge AI
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Refine prompts with clarity and signal
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() => navigate('/login-password')}
              className="rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--border-main)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              }}
            >
              Sign Up
            </button>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-16 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <section className="space-y-8 animate-fade-in" style={{ animationDelay: '80ms' }}>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-sm"
              style={{
                borderColor: 'var(--border-main)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #22c55e, #14b8a6)' }}
              />
              Prompt intelligence for product teams, builders, and creators
            </div>

            <div className="space-y-5">
              <h1
                className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Refine Your Ideas into Perfect AI Prompts
              </h1>
              <p className="max-w-2xl text-lg leading-8 sm:text-xl" style={{ color: 'var(--text-secondary)' }}>
                Shape rough thoughts into structured, benchmarkable prompts with feedback that helps you optimize faster and score with confidence.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/login-password')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}
              >
                Login
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-base font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--border-main)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              >
                Sign Up
              </button>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              {[
                ['Instant', 'prompt refinement'],
                ['Smart', 'quality scoring'],
                ['Fast', 'benchmark comparisons'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border p-4 shadow-sm"
                  style={{
                    borderColor: 'var(--border-main)',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{label}</div>
                  <div className="mt-1 text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-in lg:pl-8" style={{ animationDelay: '160ms' }}>
            <div
              className="relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl"
              style={{
                borderColor: 'var(--border-main)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div
                className="absolute right-0 top-0 h-56 w-56 rounded-full blur-3xl"
                style={{ background: 'rgba(59, 130, 246, 0.14)' }}
              />
              <div className="relative space-y-5">
                <div className="rounded-3xl border p-5" style={{ borderColor: 'var(--border-light)', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(124, 58, 237, 0.12))' }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                    Why teams use PromptForge
                  </p>
                  <h2 className="mt-3 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    One place to optimize, test, and score every prompt.
                  </h2>
                  <p className="mt-3 leading-7" style={{ color: 'var(--text-secondary)' }}>
                    Reduce guesswork with a workflow that turns prompt writing into a repeatable system instead of a one-off craft.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
                    Features
                  </p>
                  <div className="mt-4 grid gap-4">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <article
                          key={feature.title}
                          className="rounded-3xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                          style={{
                            borderColor: 'var(--border-main)',
                            background: feature.accent,
                            animationDelay: `${120 + index * 80}ms`,
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                              <Icon size={22} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                {feature.title}
                              </h3>
                              <p className="mt-2 leading-7" style={{ color: 'var(--text-secondary)' }}>
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}