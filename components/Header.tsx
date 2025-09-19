import Link from "next/link";
import { NavigationItem } from "@/types/navigation";

const navItems: NavigationItem[] = [
  { href: "/#benefits", label: "RFI Map" },
  { href: "/#specs", label: "Specifications" },
  { href: "/#how", label: "Info" },
  { href: "/#contact", label: "Contact Us" }
];

const Header = () => (
  <header className="sticky top-0 z-30 border-b border-[#e3dcc9] bg-[#f8f7f3]/95 backdrop-blur">
    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
      <Link href="/#rfi-map" className="text-lg font-semibold tracking-tight text-[#1b1c16]">
        RFI Map
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-[#2e2f25] md:flex">
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
        href="/#benefits"
        className="hidden rounded-full bg-[#4b5a2a] px-5 py-2 text-sm font-semibold text-[#f6f4ea] shadow-sm transition hover:bg-[#3f4b22] md:inline-flex"
      >
        Learn More &rarr;
      </Link>
    </div>
  </header>
);

export default Header;


