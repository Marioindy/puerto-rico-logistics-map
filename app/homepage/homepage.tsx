import Hero from "./components/Hero";
import RFIPreview from "./components/RFIPreview";
import Benefits from "./components/Benefits";
import SpecsRail from "./components/SpecsRail";
import CTA from "./components/CTA";
import Contact from "./components/Contact";
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


