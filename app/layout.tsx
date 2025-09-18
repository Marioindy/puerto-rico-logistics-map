import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
    <body className={${inter.variable}  bg-slate-950 text-slate-100 antialiased}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          {children}
        </main>
        <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Puerto Rico Department of Economic Development &amp; Commerce.
        </footer>
      </div>
    </body>
  </html>
);

export default RootLayout;
