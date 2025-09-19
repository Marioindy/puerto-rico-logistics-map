import type { BenefitsContent } from "@/types/content";

export default function Benefits({ title, body, items, imageUrl }: BenefitsContent) {
  return (
    <section id="benefits" className="border-y border-[#ded8c8] bg-[#faf9f5] py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-6 md:grid-cols-[1.25fr_1fr] md:items-center">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-serif font-semibold text-[#101010] md:text-5xl">{title}</h2>
            <p className="max-w-xl text-base text-[#434334]">{body}</p>
          </div>
          <ol className="flex flex-col divide-y divide-[#e5dece] border-y border-[#e5dece]">
            {items.map((benefit, index) => (
              <li key={benefit} className="flex items-start gap-6 py-5 text-sm text-[#2f2f25] md:text-base">
                <span className="font-mono text-xs font-medium text-[#8a8a76] md:text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-[#d7d1c3] bg-[#f3e9d6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Benefits visual" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}
