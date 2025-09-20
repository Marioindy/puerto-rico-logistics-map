import type { RFIPreviewContent } from "@/types/content";
import MapView from "@/components/MapView";
import Link from "next/link";

export default function RFIPreview({ title, cta, zoom = 8 }: RFIPreviewContent) {
  return (
    <section id="rfi-map" className="mx-auto w-full max-w-6xl px-6">
      <div className="rounded-[28px] border border-[#e3dcc9] bg-white p-4 shadow-md">
        <div className="flex items-center justify-between px-2 pt-2 pb-4">
          <h2 className="font-serif text-2xl text-[#1a1a1a] md:text-3xl">{title}</h2>
          <Link href={cta.href} className="inline-flex items-center rounded-full bg-[#4b5a2a] px-4 py-2 text-sm font-semibold text-[#f6f4ea] hover:bg-[#3f4b22]">
            {cta.label}
          </Link>
        </div>
        <div className="h-[420px] overflow-hidden rounded-2xl border border-[#e3dcc9] bg-[#faf9f5]">
          <MapView zoom={zoom} />
        </div>
      </div>
    </section>
  );
}

