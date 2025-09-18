import Link from "next/link";
import type { ReactNode } from "react";

const dashboardNav = [
  { label: "Tracking", href: "/(dashboard)/tracking" },
  { label: "Cargo manifests", href: "/(dashboard)/cargo", disabled: true },
  { label: "Field teams", href: "/(dashboard)/teams", disabled: true }
];

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-10">
    <aside className="hidden w-60 flex-shrink-0 flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:flex">
      <h2 className="text-xs font-semibold uppercase text-slate-400">Operations</h2>
      <nav className="flex flex-col gap-2 text-sm">
        {dashboardNav.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-disabled={link.disabled}
            className={ounded-md px-3 py-2 transition }
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
    <section className="flex-1 overflow-hidden">{children}</section>
  </div>
);

export default DashboardLayout;
