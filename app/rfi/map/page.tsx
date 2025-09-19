import dynamic from "next/dynamic";

const RFIHomePage = dynamic(() => import("../page").then(m => m.default), { ssr: false });

export default function RFIMapPage() {
  return <RFIHomePage />;
}
