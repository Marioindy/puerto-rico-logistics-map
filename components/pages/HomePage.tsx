import Hero from "@/components/sections/Hero";
import RFIPreview from "@/components/sections/RFIPreview";
import Benefits from "@/components/sections/Benefits";
import SpecsRail from "@/components/sections/SpecsRail";
import CTA from "@/components/sections/CTA";
import Contact from "@/components/sections/Contact";
import { getHomeContent } from "@/lib/content/loaders";

export default async function HomePage() {
  const c = await getHomeContent();
  return (
    <div className="flex flex-col gap-24 pb-24">
      <Hero {...c.hero} />
      <RFIPreview {...c.rfiPreview} />
      <Benefits {...c.benefits} />
      <SpecsRail {...c.specs} />
      <CTA {...c.how} />
      <Contact {...c.contact} />
    </div>
  );
}

