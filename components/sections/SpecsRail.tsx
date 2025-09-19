import type { SpecsRailContent } from "@/types/content";
import Link from "next/link";

export default function SpecsRail({ imageUrl, links }: SpecsRailContent) {
  return (
    <section id="specs" className="mx-auto w-full max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-[40px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Specs backdrop" className="h-full w-full object-cover" />
        <div className="absolute left-1/2 top-8 flex w-full max-w-xl -translate-x-1/2 items-center justify-between rounded-full bg-[#768652]/90 px-8 py-4 text-sm font-medium text-[#f4f1e3] shadow-lg">
          {links.map((l) => (
            <Link key={l.href} className="opacity-90 transition hover:opacity-100" href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

