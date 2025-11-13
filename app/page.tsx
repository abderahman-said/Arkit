"use client";
import Image from "next/image";
import { useSettings } from "./providers/SettingsProvider";
import { SettingsPanel } from "./components/SettingsPanel";
import React from "react";

export default function Home() {
  const { settings, setSettings } = useSettings();
  const [open, setOpen] = React.useState(true);

  // URL hash sync: load once on mount
  React.useEffect(() => {
    try {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const decoded = JSON.parse(decodeURIComponent(atob(hash)));
      if (decoded && typeof decoded === "object") {
        setSettings({ ...settings, ...decoded });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL hash sync: update on settings change (debounced)
  React.useEffect(() => {
    const id = setTimeout(() => {
      try {
        const json = JSON.stringify(settings);
        const h = btoa(encodeURIComponent(json));
        history.replaceState(null, "", `#${h}`);
      } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [settings]);

  // Keyboard shortcut: Ctrl/Cmd+K to toggle drawer
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex min-h-screen w-full flex-col gap-6 p-[var(--space-6)] ui-container" style={{ maxWidth: settings.containerLayout === "boxed" ? "var(--container-width)" : "100%" }}>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md" style={{ backgroundColor: "var(--primary)" }} />
            <h1 className="text-scale-xl font-semibold tracking-tight">Configurable UI System</h1>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Runtime Design System Playground</div>
        </header>

        {/* Floating toggle and Drawer */}
        <PanelToggle open={open} onToggle={() => setOpen((v) => !v)} />
        <Drawer open={open} onClose={() => setOpen(false)}>
          <SettingsPanel />
        </Drawer>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="ui-card rounded-xl border border-zinc-200/70 bg-white p-[var(--space-4)] dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-scale-lg font-medium">Buttons</h3>
            <div className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
              <button className="rounded-md px-4 py-2 text-white" style={{ backgroundColor: "var(--primary)" }}>Primary</button>
              <button className="rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-700">Secondary</button>
              <button className="rounded-full px-4 py-2 text-white" style={{ backgroundColor: "var(--primary)" }}>Pill</button>
            </div>
          </div>
          <div className="ui-card rounded-xl border border-zinc-200/70 bg-white p-[var(--space-4)] dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-scale-lg font-medium">Typography</h3>
            <p className="text-scale mt-[var(--space-3)] text-zinc-600 dark:text-zinc-400">
              Tailwind utilities are scaled by CSS custom properties so you can feel the settings take effect immediately.
            </p>
            <p className="text-scale-lg mt-[var(--space-3)] font-medium">Heading S</p>
            <p className="text-scale-xl mt-[var(--space-2)] font-semibold">Heading M</p>
          </div>
          <div className="ui-card rounded-xl border border-zinc-200/70 bg-white p-[var(--space-4)] dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-scale-lg font-medium">Cards</h3>
            <div className="mt-[var(--space-3)] grid grid-cols-1 gap-[var(--space-3)]">
              <div className="rounded-xl border border-zinc-200 p-[var(--space-3)] dark:border-zinc-800">
                <div className="mb-[var(--space-2)] h-3 w-24 rounded" style={{ backgroundColor: "var(--primary)", opacity: 0.3 }} />
                <p className="text-scale text-zinc-700 dark:text-zinc-300">Adaptive border radius and spacing driven by your settings.</p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-[var(--space-3)] dark:border-zinc-800">
                <div className="mb-[var(--space-2)] h-3 w-16 rounded" style={{ backgroundColor: "var(--primary)", opacity: 0.25 }} />
                <p className="text-scale text-zinc-700 dark:text-zinc-300">Try switching between boxed and fluid layouts.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="ui-card rounded-xl border border-zinc-200/70 bg-white p-[var(--space-4)] dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-scale-lg font-medium">Alerts</h3>
            <div className="mt-[var(--space-3)] space-y-[var(--space-3)]">
              <div className="alert alert-success">Success: Tokens for success color in action.</div>
              <div className="alert alert-warning">Warning: Adjust warning token to see changes.</div>
            </div>
          </div>
          <div className="ui-card rounded-xl border border-zinc-200/70 bg-white p-[var(--space-4)] dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-scale-lg font-medium">Badges</h3>
            <div className="mt-[var(--space-3)] flex flex-wrap gap-[var(--space-2)]">
              <span className="badge badge-neutral">Neutral</span>
              <span className="badge" style={{ color: "var(--primary)" }}>Primary</span>
              <span className="badge" style={{ color: "var(--success)" }}>Success</span>
              <span className="badge" style={{ color: "var(--warning)" }}>Warning</span>
        </div>
        </div>
        </section>

        <section className="ui-card rounded-xl border border-zinc-200/70 bg-white p-[var(--space-4)] dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-scale-lg font-medium">Grid Preview</h3>
          <p className="text-scale mt-[var(--space-2)] text-zinc-600 dark:text-zinc-400">
            Columns: {settings.gridColumns}, Gutter: {settings.gridGutter}px
          </p>
          <div className="grid-preview mt-[var(--space-3)]">
            {Array.from({ length: settings.gridColumns }).map((_, i) => (
              <div key={i} className="grid-cell" />
            ))}
          </div>
        </section>

        <footer className="mt-auto py-[var(--space-4)] text-center text-sm text-zinc-500 dark:text-zinc-500">
          Saved automatically to localStorage
        </footer>
      </main>
    </div>
  );
}

function PanelToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-900 shadow-lg hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      aria-label="Toggle settings"
      title="Toggle settings"
    >
      {open ? "✖" : "⚙️"}
    </button>
  );
}

function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={`fixed inset-y-0 right-0 z-30 w-full max-w-md transform border-l border-zinc-200 bg-white p-4 shadow-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="absolute inset-0 -left-[100vw]" aria-hidden onClick={onClose} />
      {children}
    </div>
  );
}
