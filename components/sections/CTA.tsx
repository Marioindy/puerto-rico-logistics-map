import Link from "next/link";
import type { CTAContent } from "@/types/content";

export default function CTA({ title, body, cta }: CTAContent) {
  return (
    <section id="how" className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 text-center">
      <h2 className="text-4xl font-serif font-semibold text-[#101010] md:text-5xl">{title}</h2>
      <p className="max-w-2xl text-base text-[#44453d]">{body}</p>
      <Link href={cta.href} className="inline-flex items-center justify-center rounded-full bg-[#4b5a2a] px-10 py-3 text-sm font-semibold text-[#f6f4ea] transition hover:bg-[#3f4b22]">
        {cta.label}
      </Link>
    </section>
  );
}
