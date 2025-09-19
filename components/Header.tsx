import Link from "next/link";
import { NavigationItem } from "@/types/navigation";

const navItems: NavigationItem[] = [
  { href: "#benefits", label: "Benefits" },
  { href: "#specs", label: "Specifications" },
  { href: "#how", label: "How-to" },
  { href: "#contact", label: "Contact Us" }
];

const Header = () => (
  <header className="sticky top-0 z-30 border-b border-transparent bg-[#f8f7f3]/95 backdrop-blur">
    <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Area
      </Link>
      <nav className="hidden items-center gap-10 text-sm text-[#333333] md:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition hover:text-[#4b5a2a]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        href="#contact"
        className="hidden rounded-full bg-[#4b5a2a] px-6 py-2 text-sm font-semibold text-[#f5f1e3] shadow-sm transition hover:bg-[#3e4d21] md:inline-flex"
      >
        Learn More ?
      </Link>
      <button className="inline-flex items-center gap-2 rounded-full border border-[#dcd6c5] px-4 py-2 text-sm font-medium text-[#333333] md:hidden">
        Menu
      </button>
    </div>
  </header>
);

export default Header;
