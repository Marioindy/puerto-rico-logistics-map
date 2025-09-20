export type CTA = {
  label: string;
  href: string;
};

export type HeroContent = {
  title: string;
  body: string;
  primary: CTA;
  secondary?: CTA;
};

export type RFIPreviewContent = {
  title: string;
  cta: CTA;
  zoom?: number;
};

export type BenefitsContent = {
  title: string;
  body: string;
  items: string[];
  imageUrl: string;
};

export type SpecsRailContent = {
  imageUrl: string;
  links: CTA[];
};

export type CTAContent = {
  title: string;
  body: string;
  cta: CTA;
};

export type ContactContent = {
  title: string;
  email: string;
  phone: string;
};

export type HomeContent = {
  hero: HeroContent;
  logos: string[];
  rfiPreview: RFIPreviewContent;
  benefits: BenefitsContent;
  specs: SpecsRailContent;
  how: CTAContent;
  contact: ContactContent;
};
