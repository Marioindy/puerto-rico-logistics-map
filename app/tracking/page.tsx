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
    <div className="min-h-screen bg-white text-[#1b1c16] relative">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-[#e3dcc9] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4b5a2a]">Dashboard</p>
              <h1 className="text-lg font-semibold text-[#1b1c16]">RFI Map — Tracking</h1>
            </div>
          </div>
        </header>

        {/* Mobile Map */}
        <div className="h-[50vh]">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-[#6f705f]">Loading...</div>}>
            <InteractiveMap onMarkerClick={setSelectedPin} />
          </Suspense>
        </div>

        {/* Mobile Controls */}
        <div className="h-[50vh] overflow-y-auto bg-[#faf9f5]">
          {selectedPin ? (
            <div className="bg-white">
              <FacilityInfoPanel
                selectedPin={selectedPin}
                onClose={() => setSelectedPin(null)}
                isVisible={true}
              />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a7a38f]" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#d7d1c3] rounded-md text-sm text-[#1b1c16] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4b5a2a]"
                />
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg border border-[#e3dcc9] p-4">
                <h3 className="text-sm font-semibold text-[#2e2f25] mb-3">Filters</h3>
                <div className="space-y-2">
                  {filterCategories.map((category) => (
                    <label key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFilters[category.id] || false}
                          onChange={() => toggleFilter(category.id)}
                          className="w-4 h-4 text-[#4b5a2a] bg-white border-[#d7d1c3] rounded focus:ring-[#4b5a2a]"
                        />
                        <span className="text-sm text-[#2e2f25]">{category.name}</span>
                      </div>
                      <span className="text-xs text-[#6f705f]">({category.count})</span>
                    </label>
                  ))}
                </div>
                {Object.values(selectedFilters).some(Boolean) && (
                  <button
                    onClick={() => setSelectedFilters({})}
                    className="mt-3 text-xs text-[#4b5a2a] hover:text-[#3f4b22] underline"
                  >
                    Clear all filters
                  </button>
                )}
                <div className="text-xs text-[#6f705f] mt-3">
                  Showing {filteredMarkers.length} of {allMarkers.length} facilities
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg border border-[#e3dcc9] p-4">
                <h3 className="text-sm font-semibold text-[#2e2f25] mb-3">Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  {operationalStats.map((stat) => (
                    <div key={stat.title} className="bg-[#faf9f5] rounded-lg p-3">
                      <div className="text-xs font-medium text-[#2e2f25]">{stat.title}</div>
                      <div className="text-lg font-bold text-[#4b5a2a]">{stat.count}</div>
                      <div className="text-xs text-[#6f705f]">{stat.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-screen relative">
        {/* Header - Floating on top */}
        <header className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-[#e3dcc9] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4b5a2a]">Dashboard</p>
              <h1 className="text-xl font-semibold text-[#1b1c16]">Puerto Rico Logistics Grid</h1>
            </div>
            <p className="text-sm text-[#4d4e40] max-w-md">
              Interactive facility tracking and monitoring - Click markers for details
            </p>
          </div>
        </header>

        {/* Map with Right Panel Space */}
        <div className="h-full pt-20 pr-[420px]">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-[#6f705f]">Loading logistics grid...</div>}>
            <InteractiveMap onMarkerClick={setSelectedPin} />
          </Suspense>
        </div>

        {/* Floating Left Filter Panel */}
        <aside className="absolute top-24 left-6 w-80 max-h-[calc(100vh-8rem)] bg-white/95 backdrop-blur-sm border border-[#e3dcc9] rounded-xl shadow-md z-40 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-[#4d4e40]" />
              <h2 className="text-sm font-semibold uppercase text-[#2e2f25]">Filters</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a7a38f]" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#d7d1c3] rounded-md text-sm text-[#1b1c16] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4b5a2a] focus:border-[#4b5a2a]"
              />
            </div>

            <div className="space-y-3 mb-6">
              {filterCategories.map((category) => (
                <label key={category.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedFilters[category.id] || false}
                      onChange={() => toggleFilter(category.id)}
                      className="w-4 h-4 text-[#4b5a2a] bg-white border-[#d7d1c3] rounded focus:ring-[#4b5a2a]"
                    />
                    <span className="text-sm text-[#2e2f25] group-hover:text-[#1b1c16]">{category.name}</span>
                  </div>
                  <span className="text-xs text-[#6f705f]">({category.count})</span>
                </label>
              ))}
            </div>

            {Object.values(selectedFilters).some(Boolean) && (
              <button
                onClick={() => setSelectedFilters({})}
                className="mb-4 text-xs text-[#4b5a2a] hover:text-[#3f4b22] underline"
              >
                Clear all filters
              </button>
            )}

            <div className="text-xs text-[#6f705f]">
              Showing {filteredMarkers.length} of {allMarkers.length} facilities
            </div>
          </div>
        </aside>

        {/* Right Information Panel - Always Visible */}
        <aside className="absolute top-24 right-6 w-96 max-h-[calc(100vh-8rem)] bg-white border border-[#e3dcc9] rounded-xl shadow-md z-40 overflow-hidden">
          {selectedPin ? (
            <FacilityInfoPanel
              selectedPin={selectedPin}
              onClose={() => setSelectedPin(null)}
              isVisible={true}
            />
          ) : (
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <div className="p-4 border-b border-[#e3dcc9]">
                <h2 className="text-lg font-semibold text-[#1b1c16]">Facility Information</h2>
                <p className="text-sm text-[#4d4e40]">Select a facility on the map to view details</p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#f1efe6] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#a7a38f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-[#1b1c16] mb-2">No Facility Selected</h3>
                    <p className="text-sm text-[#6f705f] mb-6">Click on any marker on the map to view detailed facility information and operational data.</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="border-t border-[#e3dcc9] pt-4">
                    <h4 className="text-sm font-semibold uppercase text-[#2e2f25] mb-4">System Overview</h4>
                    <div className="space-y-3">
                      {operationalStats.map((stat) => (
                        <div key={stat.title} className="rounded-lg border border-[#e3dcc9] bg-[#faf9f5] p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-medium text-[#2e2f25]">{stat.title}</h5>
                            <span className="text-sm font-bold text-[#4b5a2a]">{stat.count}</span>
                          </div>
                          <p className="text-xs text-[#6f705f]">Status: {stat.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TrackingPage;

