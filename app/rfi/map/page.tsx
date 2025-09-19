import dynamic from "next/dynamic";

// Barrel example: when you extract RFI workspace into components/pages,
// this route can import that single component. For now it proxies to /rfi.
const RFIHomePage = dynamic(() => import("../page").then((m) => m.default), {
  ssr: false
});

export default function RFIMapPage() {
  return <RFIHomePage />;
}
