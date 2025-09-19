import Link from "next/link";
import type { ContactContent } from "@/types/content";

export default function Contact({ title, email, phone }: ContactContent) {
  return (
    <section id="contact" className="mx-auto w-full max-w-5xl px-6">
      <div className="rounded-3xl border border-[#d7d1c3] bg-white p-8 shadow-md md:p-12">
        <h3 className="font-serif text-3xl font-semibold text-[#1a1a1a]">{title}</h3>
        <p className="mt-4 text-sm text-[#4d4e40] md:text-base">
          Drop us a line at <Link className="font-medium text-[#4b5a2a]" href={`mailto:${email}`}>{email}</Link>
          {" "}or call {phone}. We�ll share a tailored walkthrough of the dashboards powering Puerto Rico�s logistics network.
        </p>
      </div>
    </section>
  );
}

