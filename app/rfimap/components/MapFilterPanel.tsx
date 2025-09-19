"use client";

// Map Filter Panel - Collapsible filtering interface for map markers
// Features: type-based filtering, individual facility toggles, bulk actions

import { useMemo, useState } from "react";
import type { SelectedPinZ, MapFilterStateZ } from "@/lib/content/schema";
import { Filter, ChevronDown } from "lucide-react";

export type MapFilterPanelProps = {
  markers: SelectedPinZ[];
  value?: MapFilterStateZ;
  onChange?: (next: MapFilterStateZ) => void;
  initiallyOpen?: boolean;
};

// Human-readable labels for facility types
const TYPE_LABELS: Record<string, string> = {
  airport: "Airports",
  port: "Ports",
  warehouse: "Warehouses",
  facility: "Facilities"
};

export default function MapFilterPanel({ markers, value, onChange, initiallyOpen = true }: MapFilterPanelProps) {
  // Panel visibility state (show/hide entire filter panel)
  const [open, setOpen] = useState(initiallyOpen);

  // Track which facility type groups are expanded
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Group markers by facility type for organized display
  const grouped = useMemo(() => {
    const byType = new Map<string, SelectedPinZ[]>();
    for (const m of markers) {
      if (!byType.has(m.type)) byType.set(m.type, []);
      byType.get(m.type)!.push(m);
    }
    return Array.from(byType.entries()).map(([type, items]) => ({ type, items }));
  }, [markers]);

  // Default filter state: all types and facilities enabled
  const defaultState: MapFilterStateZ = useMemo(() => {
    const typeDefaults = Object.fromEntries(grouped.map((g) => [g.type, true]));
    const idDefaults = Object.fromEntries(markers.map((m) => [m.id, true]));
    return { types: typeDefaults, ids: idDefaults };
  }, [grouped, markers]);

  // Use provided state or fall back to defaults
  const state = value ?? defaultState;

  // Filter state manipulation functions
  const setTypeChecked = (type: string, checked: boolean) => {
    onChange?.({ ...state, types: { ...state.types, [type]: checked } });
  };

  const setIdChecked = (id: string, checked: boolean) => {
    onChange?.({ ...state, ids: { ...state.ids, [id]: checked } });
  };

  // UI state manipulation functions
  const toggleGroup = (type: string) => setOpenGroups((g) => ({ ...g, [type]: !g[type] }));

  // Bulk actions for efficient filter management
  const setAllTypes = (checked: boolean) => {
    const next = Object.fromEntries(Object.keys(state.types).map((k) => [k, checked]));
    onChange?.({ ...state, types: next });
  };

  const setAllInGroup = (type: string, checked: boolean) => {
    const ids = grouped.find((g) => g.type === type)?.items.map((m) => m.id) ?? [];
    const nextIds = { ...state.ids };
    for (const id of ids) nextIds[id] = checked;
    onChange?.({ ...state, ids: nextIds });
  };

  return (
    {/* Collapsible filter panel with slide animation */}
    <aside
      className={`transition-all duration-300 ${
        open ? "translate-x-0" : "-translate-x-[calc(100%+16px)]"
      } absolute top-24 left-6 z-40 w-80 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[#e3dcc9] bg-white/95 shadow-md backdrop-blur-sm`}
    >
      {/* Filter panel header with controls */}
      <div className="flex items-center justify-between border-b border-[#e3dcc9] p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#2e2f25]">
          <Filter className="h-4 w-4 text-[#4b5a2a]" /> Filters
        </div>

        {/* Header controls: bulk actions and panel toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => setAllTypes(true)} className="underline hover:text-[#1b1c16]">All</button>
          <button onClick={() => setAllTypes(false)} className="underline hover:text-[#1b1c16]">None</button>
          <button
            aria-label={open ? "Hide filters" : "Show filters"}
            onClick={() => setOpen((v) => !v)}
            className="ml-2 rounded-full border border-[#d7d1c3] px-2 py-1 text-[#2e2f25] hover:bg-[#faf9f5]"
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Scrollable filter groups container */}
      <div className="max-h-[calc(100%-2.75rem)] overflow-y-auto p-2">
        {grouped.map(({ type, items }) => {
          const expanded = openGroups[type] ?? false;
          const typeChecked = state.types[type] ?? true;
          const checkedCount = items.filter((m) => state.ids[m.id] ?? true).length;

          return (
            {/* Individual facility type group */}
            <div key={type} className="mb-2 rounded-lg border border-[#e3dcc9]">
              {/* Group header with expand/collapse and type checkbox */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  {/* Expand/collapse button */}
                  <button
                    onClick={() => toggleGroup(type)}
                    aria-label={expanded ? `Collapse ${type}` : `Expand ${type}`}
                    className={`transition ${expanded ? "rotate-180" : ""}`}
                  >
                    <ChevronDown className="h-4 w-4 text-[#4b5a2a]" />
                  </button>

                  {/* Type-level checkbox and label */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={typeChecked}
                      onChange={(e) => setTypeChecked(type, e.target.checked)}
                      className="h-4 w-4 rounded border-[#d7d1c3] text-[#4b5a2a] focus:ring-[#4b5a2a]"
                    />
                    <span className="text-sm text-[#2e2f25]">{TYPE_LABELS[type] ?? type}</span>
                  </label>
                </div>

                {/* Group controls: count and bulk actions */}
                <div className="flex items-center gap-2 text-xs text-[#6f705f]">
                  <span>
                    {checkedCount}/{items.length}
                  </span>
                  <button onClick={() => setAllInGroup(type, true)} className="underline hover:text-[#1b1c16]">All</button>
                  <button onClick={() => setAllInGroup(type, false)} className="underline hover:text-[#1b1c16]">None</button>
                </div>
              </div>

              {/* Expandable individual facility list */}
              {expanded && (
                <div className="space-y-2 px-3 pb-3">
                  {items.map((m) => (
                    <label key={m.id} className="flex cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Individual facility checkbox */}
                        <input
                          type="checkbox"
                          checked={state.ids[m.id] ?? true}
                          onChange={(e) => setIdChecked(m.id, e.target.checked)}
                          className="h-4 w-4 rounded border-[#d7d1c3] text-[#4b5a2a] focus:ring-[#4b5a2a]"
                        />
                        {/* Facility name */}
                        <span className="text-sm text-[#2e2f25]">{m.data?.title ?? m.id}</span>
                      </div>
                      {/* Facility type badge */}
                      <span className="text-xs text-[#6f705f]">{TYPE_LABELS[m.type] ?? m.type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
