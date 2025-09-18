import Link from "next/link";
import { NavigationItem } from "@/types/navigation";

const navItems: NavigationItem[] = [
  { href: "/", label: "Overview" },
  { href: "/(dashboard)/tracking", label: "Tracking" },
  { href: "/docs", label: "Docs", isExternal: false, disabled: true }
];

const Header = () => (
  <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
    <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-sky-300">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-200">
          PR
        </span>
        Puerto Rico Logistics Grid
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-disabled={item.disabled}
            className={`transition hover:text-sky-200 ${
              item.disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  </header>
);

export default Header;
