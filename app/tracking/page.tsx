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
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Main Layout - Map takes full screen */}
      <div className="h-screen relative">
        {/* Header - Floating on top */}
        <header className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-600">Dashboard</p>
              <h1 className="text-xl font-semibold text-gray-900">Puerto Rico Logistics Grid</h1>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Interactive facility tracking and monitoring - Click markers for details
            </p>
          </div>
        </header>

        {/* Full-Screen Map */}
        <div className="h-full pt-20">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-gray-500">Loading logistics grid...</div>}>
            <InteractiveMap onMarkerClick={setSelectedPin} />
          </Suspense>
        </div>

        {/* Floating Left Filter Panel */}
        <aside className="absolute top-24 left-6 w-80 max-h-[calc(100vh-8rem)] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-600" />
              <h2 className="text-sm font-semibold uppercase text-gray-700">Filters</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </label>
              ))}
            </div>

            {Object.values(selectedFilters).some(Boolean) && (
              <button
                onClick={() => setSelectedFilters({})}
                className="mb-4 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            )}

            <div className="text-xs text-gray-500 mb-6">
              Showing {filteredMarkers.length} of {allMarkers.length} facilities
            </div>

            {/* Facility Statistics - Only show when no facility is selected */}
            {!selectedPin && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold uppercase text-gray-700 mb-4">Facility Statistics</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {operationalStats.map((stat) => (
                    <div key={stat.title} className="rounded-lg border border-gray-200 bg-white p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-medium text-gray-700">{stat.title}</h4>
                        <span className="text-sm font-bold text-blue-600">{stat.count}</span>
                      </div>
                      <p className="text-xs text-gray-500">Status: {stat.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Facility Information Panel - Main layer component */}
        {selectedPin && (
          <aside className="absolute top-24 right-6 w-96 max-h-[calc(100vh-8rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-40 overflow-hidden">
            <FacilityInfoPanel
              selectedPin={selectedPin}
              onClose={() => setSelectedPin(null)}
              isVisible={true}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;