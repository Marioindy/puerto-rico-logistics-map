"use client";

import InteractiveMap from "@/components/InteractiveMap";
import FacilityInfoPanel from "@/components/FacilityInfoPanel";
import { Suspense, useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { getAllMarkers } from "@/lib/facilityData";
import type { SelectedPin } from "@/types/facilities";

const TrackingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({});
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);

  const allMarkers = getAllMarkers();

  const filterCategories = useMemo(() => {
    const typeMap = new Map<string, number>();
    allMarkers.forEach(marker => {
      const type = marker.type;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries()).map(([type, count]) => ({
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
      count
    }));
  }, [allMarkers]);

  const filteredMarkers = useMemo(() => {
    let filtered = allMarkers;

    if (searchTerm) {
      filtered = filtered.filter(marker =>
        marker.data?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        marker.data?.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const activeFilters = Object.entries(selectedFilters)
      .filter(([, isActive]) => isActive)
      .map(([type]) => type);

    if (activeFilters.length > 0) {
      filtered = filtered.filter(marker => activeFilters.includes(marker.type));
    }

    return filtered;
  }, [allMarkers, searchTerm, selectedFilters]);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  const operationalStats = useMemo(() => {
    const stats = allMarkers.reduce((acc, marker) => {
      const type = marker.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { title: "Airport Operations", count: stats.airport || 0, status: "Active" },
      { title: "Port Activities", count: stats.port || 0, status: "Operational" },
      { title: "Warehouse Facilities", count: stats.warehouse || 0, status: "Available" },
      { title: "Other Facilities", count: stats.facility || 0, status: "Active" }
    ];
  }, [allMarkers]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-widest text-sky-400">Dashboard</p>
          <h1 className="text-3xl font-semibold text-white">Puerto Rico Logistics Grid</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Interactive map displaying airports, ports, and logistics facilities across Puerto Rico.
            Click on pins to view detailed facility information and operational data.
          </p>
        </header>

        <div className={`grid gap-4 ${selectedPin ? 'lg:grid-cols-[280px_1fr_400px]' : 'lg:grid-cols-[280px_1fr]'}`}>
          {/* Left Filter Panel */}
          <aside className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold uppercase text-slate-300">Filters</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-3">
              {filterCategories.map((category) => (
                <label key={category.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedFilters[category.id] || false}
                      onChange={() => toggleFilter(category.id)}
                      className="w-4 h-4 text-sky-600 bg-slate-900 border-slate-600 rounded focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-slate-200">{category.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">({category.count})</span>
                </label>
              ))}
            </div>

            {Object.values(selectedFilters).some(Boolean) && (
              <button
                onClick={() => setSelectedFilters({})}
                className="mt-4 text-xs text-sky-400 hover:text-sky-300 underline"
              >
                Clear all filters
              </button>
            )}

            <div className="mt-6 text-xs text-slate-500">
              Showing {filteredMarkers.length} of {allMarkers.length} facilities
            </div>

            {/* Facility Statistics - Only show when no facility is selected */}
            {!selectedPin && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-semibold uppercase text-slate-300 mb-4">Facility Statistics</h3>
                <div className="space-y-3">
                  {operationalStats.map((stat) => (
                    <div key={stat.title} className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-medium text-slate-200">{stat.title}</h4>
                        <span className="text-sm font-bold text-sky-400">{stat.count}</span>
                      </div>
                      <p className="text-xs text-slate-400">Status: {stat.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main Map Area - Now takes up most of the screen */}
          <section className="flex h-[calc(100vh-12rem)] flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase text-slate-300">Puerto Rico Logistics Map</h2>
                <p className="text-xs text-slate-500">Interactive facility tracking and monitoring - Click markers for details</p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-lg">
              <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-500">Loading logistics grid...</div>}>
                <div className="w-full h-full">
                  <InteractiveMap onMarkerClick={setSelectedPin} />
                </div>
              </Suspense>
            </div>
          </section>

          {/* Right Facility Information Panel - Only show when a facility is selected */}
          {selectedPin && (
            <aside className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
              <FacilityInfoPanel
                selectedPin={selectedPin}
                onClose={() => setSelectedPin(null)}
                isVisible={true}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;