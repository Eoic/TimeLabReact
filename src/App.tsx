import { useTheme } from './theme/useTheme';
import type { ThemeMode } from './theme/theme';

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'OLED', value: 'oled' },
];

const scheduleRows = [
  { label: 'Focus block', time: '09:30', state: 'Running' },
  { label: 'Review window', time: '13:00', state: 'Queued' },
  { label: 'Archive sync', time: '17:45', state: 'Ready' },
];

function App() {
  const { resolvedTheme, setThemeMode, themeMode } = useTheme();

  return (
    <main className="app-page px-4 py-4 sm:px-6 lg:px-8">
      <div className="app-shell mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col">
        <header className="app-header flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="dashboard-kicker">TimeLabReact</p>
            <h1 className="dashboard-title mt-1 text-2xl font-bold tracking-normal">
              Operations board
            </h1>
          </div>

          <div className="theme-switch" role="radiogroup" aria-label="Theme">
            {themeOptions.map((option) => (
              <button
                aria-checked={themeMode === option.value}
                className="theme-switch__option"
                data-active={themeMode === option.value}
                key={option.value}
                onClick={() => setThemeMode(option.value)}
                role="radio"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <section className="grid flex-1 gap-4 p-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="dashboard-card dashboard-card--primary">
            <div>
              <p className="dashboard-kicker">Current cycle</p>
              <h2
                className="dashboard-display mt-3 max-w-xl text-5xl font-black leading-none tracking-normal sm:text-7xl"
              >
                04:28:16
              </h2>
              <p className="dashboard-copy mt-4 max-w-2xl text-base leading-7">
                Active profile <span className="dashboard-pill">{themeMode}</span>{' '}
                is running on the{' '}
                <span className="dashboard-pill">{resolvedTheme}</span> canvas.
              </p>
            </div>

            <div className="dashboard-meter" aria-hidden="true">
              <span />
            </div>
          </article>

          <aside className="dashboard-card">
            <p className="dashboard-kicker">Theme state</p>
            <dl className="mt-6 grid gap-3">
              <div className="dashboard-stat">
                <dt>Selected</dt>
                <dd>{themeMode}</dd>
              </div>
              <div className="dashboard-stat">
                <dt>Resolved</dt>
                <dd>{resolvedTheme}</dd>
              </div>
              <div className="dashboard-stat">
                <dt>Contrast</dt>
                <dd>{resolvedTheme === 'oled' ? 'max' : 'standard'}</dd>
              </div>
            </dl>
          </aside>

          <section className="dashboard-card lg:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="dashboard-kicker">Today</p>
                <h2 className="mt-2 text-3xl font-black tracking-normal">
                  Lab schedule
                </h2>
              </div>
              <span className="dashboard-badge">Live feed</span>
            </div>

            <div className="mt-6 grid gap-3">
              {scheduleRows.map((row) => (
                <div className="dashboard-row" key={row.label}>
                  <span>{row.time}</span>
                  <strong>{row.label}</strong>
                  <em>{row.state}</em>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
