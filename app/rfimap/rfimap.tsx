// app/rfimap/rfimap.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import FacilityInfoPanel from "./components/FacilityInfoPanel";
import FabiolaChat from "@/agents/components/FabiolaChat";
import type { SelectedPinZ } from "@/lib/content/schema";

export default function RfiMapPage() {
  const [type, setType] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [selectedPin, setSelectedPin] = useState<SelectedPinZ | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  // Query geoLocales with full details (boxes and variables)
  const geoLocales = useQuery(api.geoLocales.listWithDetails, {
    type,
    region,
    search,
    activeOnly: true,
  });

  const handleMarkerClick = (marker: SelectedPinZ) => {
    setSelectedPin(marker);
    setIsPanelVisible(true);
  };

  const handleClosePanel = () => {
    setIsPanelVisible(false);
    setSelectedPin(null);
  };

  return (
    <div className="flex h-screen">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Filters */}
        <div className="flex items-center gap-2 p-4 bg-white border-b">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Search facilities..."
            onChange={(e) => setSearch(e.target.value || undefined)}
          />
          <select
            className="border rounded px-3 py-2"
            onChange={(e) => setType(e.target.value || undefined)}
            defaultValue=""
          >
            <option value="">All types</option>
            <option value="port">Port</option>
            <option value="airport">Airport</option>
            <option value="warehouse">Warehouse</option>
            <option value="facility">Facility</option>
          </select>
          <select
            className="border rounded px-3 py-2"
            onChange={(e) => setRegion(e.target.value || undefined)}
            defaultValue=""
          >
            <option value="">All regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="central">Central</option>
          </select>
        </div>

        {/* Map */}
        <div className="flex-1">
          <InteractiveMap
            markers={geoLocales ?? []}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </div>

      {/* Facility Info Panel */}
      {isPanelVisible && (
        <div className="w-96 border-l border-gray-200 bg-white overflow-hidden">
          <FacilityInfoPanel
            selectedPin={selectedPin}
            onClose={handleClosePanel}
            isVisible={isPanelVisible}
          />
        </div>
      )}

      {/* Fabiola Chat Widget */}
      <FabiolaChat />
    </div>
  );
}
//
