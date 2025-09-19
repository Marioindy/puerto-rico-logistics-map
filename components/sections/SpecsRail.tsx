import type { SpecsRailContent } from "@/types/content";
import Link from "next/link";

export default function SpecsRail({ imageUrl, links }: SpecsRailContent) {
  return (
    <section id="specs" className="mx-auto w-full max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-[40px]">
        {/* Visual backdrop for the specs rail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Specifications visual" className="h-full w-full object-cover" />

        {/* Shortcut chips — not a site header; positioned near the bottom to avoid header confusion */}
        <nav
          aria-label="Specifications shortcuts"
          className="absolute left-1/2 bottom-6 flex w-full max-w-xl -translate-x-1/2 items-center justify-between rounded-full bg-[#768652]/90 px-6 py-3 text-xs font-medium text-[#f4f1e3] shadow-lg md:text-sm"
        >
          {links.map((l) => (
            <Link key={l.href} className="opacity-90 transition hover:opacity-100" href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
