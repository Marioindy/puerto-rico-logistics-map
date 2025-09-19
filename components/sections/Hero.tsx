import Link from "next/link";
import type { HeroContent } from "@/types/content";

export default function Hero({ title, body, primary, secondary }: HeroContent) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 pt-24 text-center">
        <h1 className="max-w-4xl text-balance font-serif text-5xl font-semibold leading-tight tracking-tight text-[#111111] sm:text-6xl md:text-7xl">
          {title}
        </h1>
        <p className="max-w-2xl text-pretty text-base text-[#44453d] md:text-lg">{body}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={primary.href} className="inline-flex items-center justify-center rounded-full bg-[#4b5a2a] px-6 py-3 text-sm font-semibold text-[#f6f4ea] transition hover:bg-[#3f4b22]">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="inline-flex items-center justify-center rounded-full border border-[#d9d2bf] px-6 py-3 text-sm font-semibold text-[#3b3b2f] transition hover:border-[#4b5a2a]">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
