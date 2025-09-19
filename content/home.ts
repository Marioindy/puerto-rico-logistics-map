import type { HomeContent } from "@/types/content";

export const homeContent: HomeContent = {
  hero: {
    title: "Browse everything.",
    body:
      "RFI Map turns complex logistics data into immersive, shareable stories. Discover the trends that matter, align your teams, and take action with confidence across every region.",
    primary: { label: "Learn More ?", href: "#benefits" },
    secondary: { label: "Contact Us", href: "#contact" }
  },
  logos: ["Logio", "Logopix", "Northwind", "Logotype", "Logogrid"],
  rfiPreview: {
    title: "RFI Map Preview",
    cta: { label: "Open Full Map ?", href: "/rfimap" },
    zoom: 8
  },
  benefits: {
    title: "See the Big Picture",
    body:
      "RFI Map turns your data into clear, vibrant visuals that reveal exactly what is happening in each region, so you can plan smarter, react faster, and keep stakeholders aligned.",
    items: [
      "Spot trends in seconds: no more digging through numbers.",
      "Bring everyone onto the same page with easy-to-share dashboards.",
      "Make presentations pop with rich visuals and interactive layers.",
      "Get a clear snapshot of your entire operation, anytime."
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
  },
  specs: {
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    links: [
      { label: "Benefits", href: "#benefits" },
      { label: "Specifications", href: "#specs" },
      { label: "How-to", href: "#how" },
      { label: "Contact Us", href: "#contact" }
    ]
  },
  how: {
    title: "Connect with us",
    body:
      "Schedule a quick call to discover how RFI Map transforms your regional logistics data into a powerful advantage for your teams on the ground and in the boardroom.",
    cta: { label: "Learn More ?", href: "#contact" }
  },
  contact: {
    title: "Let�s build the grid together",
    email: "team@rfi-map.local",
    phone: "+1 (787) 555-0199"
  }
};


