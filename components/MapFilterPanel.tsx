"use client";

import { useMemo, useState } from "react";
import type { SelectedPin } from "@/types/facilities";
import { Filter } from "lucide-react";

export type MapFilterState = {
  types: Record<string, boolean>;
  ids: Record<string, boolean>;
};

export type MapFilterPanelProps = {
  markers: SelectedPin[];
  value?: MapFilterState;
  onChange?: (next: MapFilterState) => void;
  initiallyOpen?: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  airport: "Airports",
  port: "Ports",
  warehouse: "Warehouses",
  facility: "Facilities"
};

function computeTypeCounts(markers: SelectedPin[]) {
  const counts: Record<string, number> = {};
  for (const m of markers) counts[m.type] = (counts[m.type] ?? 0) + 1;
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

export default function MapFilterPanel({ markers, value, onChange, initiallyOpen = true }: MapFilterPanelProps) {
  const [open, setOpen] = useState(initiallyOpen);

  const typeCounts = useMemo(() => computeTypeCounts(markers), [markers]);

  const internal = useMemo<MapFilterState>(() => {
    const typesFromData = Array.from(new Set(markers.map((m) => m.type)));
    const baseTypes: Record<string, boolean> = Object.fromEntries(typesFromData.map((t) => [t, true]));
    const baseIds: Record<string, boolean> = Object.fromEntries(markers.map((m) => [m.id, true]));
    return { types: baseTypes, ids: baseIds };
  }, [markers]);

  const state = value ?? internal;

  const toggleType = (type: string) => {
    const next: MapFilterState = {
      ...state,
      types: { ...state.types, [type]: !state.types[type] }
    };
    onChange?.(next);
  };

  const toggleId = (id: string) => {
    const next: MapFilterState = {
      ...state,
      ids: { ...state.ids, [id]: !state.ids[id] }
    };
    onChange?.(next);
  };

  const selectAllTypes = (valueAll: boolean) => {
    const nextTypes = Object.fromEntries(Object.keys(state.types).map((k) => [k, valueAll]));
    onChange?.({ ...state, types: nextTypes });
  };

  const selectAllIds = (valueAll: boolean) => {
    const nextIds = Object.fromEntries(Object.keys(state.ids).map((k) => [k, valueAll]));
    onChange?.({ ...state, ids: nextIds });
  };

  return (
    <aside
      className={`transition-all duration-300 ${
        open ? "translate-x-0" : "-translate-x-[calc(100%+16px)]"
      } absolute top-24 left-6 z-40 w-80 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[#e3dcc9] bg-white/95 shadow-md backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between border-b border-[#e3dcc9] p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#2e2f25]">
          <Filter className="h-4 w-4 text-[#4b5a2a]" /> Filters
        </div>
        <button
          aria-label={open ? "Hide filters" : "Show filters"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-[#d7d1c3] px-2 py-1 text-xs text-[#2e2f25] hover:bg-[#faf9f5]"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {/* Types */}
      <div className="max-h-[45%] overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-[#4d4e40]">
          <span className="font-semibold uppercase tracking-wider text-[#6f705f]">Categories</span>
          <div className="space-x-2">
            <button onClick={() => selectAllTypes(true)} className="underline hover:text-[#1b1c16]">All</button>
            <button onClick={() => selectAllTypes(false)} className="underline hover:text-[#1b1c16]">None</button>
          </div>
        </div>
        <div className="space-y-2">
          {typeCounts.map(({ type, count }) => (
            <label key={type} className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={state.types[type] ?? true}
                  onChange={() => toggleType(type)}
                  className="h-4 w-4 rounded border-[#d7d1c3] text-[#4b5a2a] focus:ring-[#4b5a2a]"
                />
                <span className="text-sm text-[#2e2f25]">{TYPE_LABELS[type] ?? type}</span>
              </div>
              <span className="text-xs text-[#6f705f]">({count})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e3dcc9]" />

      {/* Items */}
      <div className="max-h-[55%] overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-[#4d4e40]">
          <span className="font-semibold uppercase tracking-wider text-[#6f705f]">Facilities</span>
          <div className="space-x-2">
            <button onClick={() => selectAllIds(true)} className="underline hover:text-[#1b1c16]">All</button>
            <button onClick={() => selectAllIds(false)} className="underline hover:text-[#1b1c16]">None</button>
          </div>
        </div>
        <div className="space-y-2">
          {markers.map((m) => (
            <label key={m.id} className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={state.ids[m.id] ?? true}
                  onChange={() => toggleId(m.id)}
                  className="h-4 w-4 rounded border-[#d7d1c3] text-[#4b5a2a] focus:ring-[#4b5a2a]"
                />
                <span className="text-sm text-[#2e2f25]">{m.data?.title ?? m.id}</span>
              </div>
              <span className="text-xs text-[#6f705f]">{TYPE_LABELS[m.type] ?? m.type}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
