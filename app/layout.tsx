import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Playfair_Display
} from "next/font/google";
import Header from "@/components/Header";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: "Puerto Rico Logistics Grid",
    template: "%s | PR Logistics Grid"
  },
  description:
    "Operational dashboard scaffolding for Puerto Rico logistics coordination across agencies and partners.",
  metadataBase: new URL("https://puerto-rico-logistics-grid.local")
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body
      className={`${inter.variable} ${mono.variable} ${playfair.variable} bg-[#f8f7f3] text-[#1a1a1a] antialiased`}
    >
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-[color:var(--color-border)] bg-[#f3f1e8] py-10 text-center text-xs text-[#4b4b39]">
          &copy; {new Date().getFullYear()} Puerto Rico Department of Economic Development &amp; Commerce.
        </footer>
      </div>
    </body>
  </html>
);

export default RootLayout;

