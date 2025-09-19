import Image from "next/image";
import MapView from "@/components/MapView";

const brandLogos = [
  "Logio",
  "Logopix",
  "Northwind",
  "Logotype",
  "Logogrid"
];

const benefits = [
  "Spot trends in seconds: no more digging through numbers.",
  "Bring everyone onto the same page with easy-to-share dashboards.",
  "Make presentations pop with rich visuals and interactive layers.",
  "Get a clear snapshot of your entire operation, anytime."
];

const LandingPage = () => (
  <div className="flex flex-col gap-24 pb-24">
    <section className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 pt-24 text-center">
        <h1 className="max-w-4xl text-balance font-serif text-5xl font-semibold leading-tight tracking-tight text-[#111111] sm:text-6xl md:text-7xl">
          Browse everything.
        </h1>
        <p className="max-w-2xl text-pretty text-base text-[#44453d] md:text-lg">
          RFI Map turns complex logistics data into immersive, shareable stories. Discover the trends that matter, align your
          teams, and take action with confidence across every region.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#benefits"
            className="inline-flex items-center justify-center rounded-full bg-[#4b5a2a] px-6 py-3 text-sm font-semibold text-[#f6f4ea] transition hover:bg-[#3f4b22]"
          >
            Learn More &rarr;
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full border border-[#d9d2bf] px-6 py-3 text-sm font-semibold text-[#3b3b2f] transition hover:border-[#4b5a2a]"
          >
            Contact Us
          </a>
        </div>
        <div className="relative w-full max-w-5xl">
          <div className="absolute inset-y-10 left-[-8%] hidden w-1/3 rounded-3xl bg-[#a2b089]/70 md:block" aria-hidden />
          <div className="absolute inset-y-16 right-[-10%] hidden w-1/3 rounded-3xl bg-[#b7c3a0]/70 md:block" aria-hidden />
          <div className="relative overflow-hidden rounded-3xl border border-[#d6d1c2] bg-white shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=1400&q=80"
              alt="Analytics dashboard on a tablet showing upward trends"
              width={1400}
              height={840}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-8">
          <span className="text-xs uppercase tracking-[0.35em] text-[#7a7a66]">Trusted by</span>
          <div className="flex w-full flex-wrap items-center justify-center gap-10 text-sm text-[#555548] md:justify-between">
            {brandLogos.map((brand) => (
              <span key={brand} className="uppercase tracking-[0.3em] text-[#8c8c7a]">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>

    
    <section id="rfi-map" className="mx-auto w-full max-w-6xl px-6">
      <div className="rounded-[28px] border border-[#e3dcc9] bg-white p-4 shadow-md">
        <div className="flex items-center justify-between px-2 pt-2 pb-4">
          <h2 className="font-serif text-2xl md:text-3xl text-[#1a1a1a]">RFI Map Preview</h2>
          <a href="/tracking" className="inline-flex items-center rounded-full bg-[#4b5a2a] px-4 py-2 text-sm font-semibold text-[#f6f4ea] hover:bg-[#3f4b22]">Open Full Map &rarr;</a>
        </div>
        <div className="h-[420px] overflow-hidden rounded-2xl border border-[#e3dcc9] bg-[#faf9f5]">
          <MapView zoom={8} />
      </div>
        </div>
    </section>

    <section id="benefits" className="border-y border-[#ded8c8] bg-[#faf9f5] py-20">
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-6 md:grid-cols-[1.25fr_1fr] md:items-center">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl font-serif font-semibold text-[#101010] md:text-5xl">See the Big Picture</h2>
            <p className="max-w-xl text-base text-[#434334]">
              RFI Map turns your data into clear, vibrant visuals that reveal exactly what is happening in each region, so you can
              plan smarter, react faster, and keep stakeholders aligned.
            </p>
          </div>
          <ol className="flex flex-col divide-y divide-[#e5dece] border-y border-[#e5dece]">
            {benefits.map((benefit, index) => (
              <li key={benefit} className="flex items-start gap-6 py-5 text-sm text-[#2f2f25] md:text-base">
                <span className="font-mono text-xs font-medium text-[#8a8a76] md:text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ol>
          <a
            href="#specs"
            className="inline-flex w-max items-center gap-2 rounded-full bg-[#dfe8c9] px-6 py-3 text-sm font-semibold text-[#2f3818] transition hover:bg-[#d1ddba]"
          >
            Discover More &rarr;
          </a>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-[#d7d1c3] bg-[#f3e9d6]">
          <Image
            src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
            alt="Minimal cylinders representing analytics"
            width={1200}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>

    <section id="specs" className="mx-auto w-full max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-[40px]">
        <Image
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
          alt="Lush landscape"
          width={1600}
          height={900}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-1/2 top-8 flex w-full max-w-xl -translate-x-1/2 items-center justify-between rounded-full bg-[#768652]/90 px-8 py-4 text-sm font-medium text-[#f4f1e3] shadow-lg">
          <a className="opacity-90 hover:opacity-100" href="#benefits">
            Benefits
          </a>
          <a className="opacity-90 hover:opacity-100" href="#specs">
            Specifications
          </a>
          <a className="opacity-90 hover:opacity-100" href="#how">
            How-to
          </a>
          <a className="opacity-90 hover:opacity-100" href="#contact">
            Contact Us
          </a>
        </div>
      </div>
    </section>

    <section id="how" className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 text-center">
      <h2 className="text-4xl font-serif font-semibold text-[#101010] md:text-5xl">Connect with us</h2>
      <p className="max-w-2xl text-base text-[#44453d]">
        Schedule a quick call to discover how RFI Map transforms your regional logistics data into a powerful advantage for your
        teams on the ground and in the boardroom.
      </p>
      <a
        href="#contact"
        className="inline-flex items-center justify-center rounded-full bg-[#4b5a2a] px-10 py-3 text-sm font-semibold text-[#f6f4ea] transition hover:bg-[#3f4b22]"
      >
        Learn More &rarr;
      </a>
    </section>

    <section id="contact" className="mx-auto w-full max-w-5xl px-6">
      <div className="rounded-3xl border border-[#d7d1c3] bg-white p-8 shadow-md md:p-12">
        <h3 className="font-serif text-3xl font-semibold text-[#1a1a1a]">Let&rsquo;s build the grid together</h3>
        <p className="mt-4 text-sm text-[#4d4e40] md:text-base">
          Drop us a line at <a className="font-medium text-[#4b5a2a]" href="mailto:team@rfi-map.local">team@rfi-map.local</a>
          {' '}or call +1 (787) 555-0199. We&rsquo;ll share a tailored walkthrough of the dashboards powering Puerto Rico&rsquo;s logistics
          network.
        </p>
      </div>
    </section>
  </div>
);

export default LandingPage;











