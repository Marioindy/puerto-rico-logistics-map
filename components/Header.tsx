import Link from "next/link";
import { NavigationItem } from "@/types/navigation";

const navItems: NavigationItem[] = [
  { href: "/", label: "Overview" },
  { href: "/tracking", label: "Tracking" },
  { href: "/docs", label: "Docs", isExternal: false, disabled: true }
];

const Header = () => (
  <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
    <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-blue-600">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          PR
        </span>
        Puerto Rico Logistics Grid
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-disabled={item.disabled}
            className={`transition hover:text-blue-600 ${
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
