// components/RfiMap.tsx
"use client";

import { useEffect, useRef } from "react";

export type MarkerData = {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  tags?: string[];
};

export default function RfiMap({ markers }: { markers: MarkerData[] }) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const markerObjsRef = useRef<google.maps.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const g = (window as any).google?.maps;
    if (!g) {
      console.warn("Google Maps JS API not loaded yet");
      return;
    }
    mapRef.current = new g.Map(mapDivRef.current, {
      center: { lat: 18.2208, lng: -66.5901 }, // Puerto Rico
      zoom: 8,
      mapTypeControl: false,
    });
    infoRef.current = new g.InfoWindow();
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const g = (window as any).google?.maps;
    const map = mapRef.current;
    if (!g || !map) return;

    // Clear previous markers
    markerObjsRef.current.forEach((m) => m.setMap(null));
    markerObjsRef.current = [];

    if (!markers?.length) return;

    const bounds = new g.LatLngBounds();

    markers.forEach((m) => {
      const marker = new g.Marker({
        position: m.position,
        map,
        title: m.name,
      });
      markerObjsRef.current.push(marker);
      bounds.extend(m.position);

      const html = buildInfoHtml(m);
      marker.addListener("click", () => {
        infoRef.current!.setContent(html);
        infoRef.current!.open({ anchor: marker, map });
      });
    });

    // Fit bounds (or set a nice zoom if only one point)
    if (markers.length === 1) {
      map.setCenter(markers[0].position);
      map.setZoom(12);
    } else {
      map.fitBounds(bounds, 64);
    }
  }, [markers]);

  return <div ref={mapDivRef} className="w-full h-[70vh] rounded-xl shadow" />;
}

function buildInfoHtml(m: MarkerData) {
  const rows: string[] = [];
  if (m.category) rows.push(`<div><strong>Category:</strong> ${escapeHtml(m.category)}</div>`);
  if (m.address) rows.push(`<div><strong>Address:</strong> ${escapeHtml(m.address)}</div>`);
  if (m.phone) rows.push(`<div><strong>Phone:</strong> ${escapeHtml(m.phone)}</div>`);
  if (m.website)
    rows.push(
      `<div><strong>Website:</strong> <a href="${encodeURI(m.website)}" target="_blank" rel="noreferrer">${escapeHtml(
        m.website
      )}</a></div>`
    );
  if (m.description) rows.push(`<div style="margin-top:6px">${escapeHtml(m.description)}</div>`);
  if (m.tags?.length) rows.push(`<div style="margin-top:6px"><strong>Tags:</strong> ${m.tags.map(escapeHtml).join(", ")}</div>`);
  return `<div style="max-width:260px"><div style="font-weight:600;margin-bottom:4px">${escapeHtml(m.name)}</div>${rows.join(
    ""
  )}</div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

