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

type GoogleMapsNamespace = typeof google.maps;

interface GoogleWindow extends Window {
  google?: {
    maps?: GoogleMapsNamespace;
  };
}

const getGoogleMaps = (): GoogleMapsNamespace | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const candidate = window as GoogleWindow;
  return candidate.google?.maps;
};

export default function RfiMap({ markers }: { markers: MarkerData[] }) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const markerObjsRef = useRef<google.maps.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const googleMaps = getGoogleMaps();
    if (!googleMaps) {
      console.warn("Google Maps JS API not loaded yet");
      return;
    }

    mapRef.current = new googleMaps.Map(mapDivRef.current, {
      center: { lat: 18.2208, lng: -66.5901 }, // Puerto Rico
      zoom: 8,
      mapTypeControl: false,
    });
    infoRef.current = new googleMaps.InfoWindow();
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const googleMaps = getGoogleMaps();
    const map = mapRef.current;
    if (!googleMaps || !map) return;

    // Clear previous markers
    markerObjsRef.current.forEach((marker) => marker.setMap(null));
    markerObjsRef.current = [];

    if (!markers?.length) return;

    const bounds = new googleMaps.LatLngBounds();

    markers.forEach((markerData) => {
      const marker = new googleMaps.Marker({
        position: markerData.position,
        map,
        title: markerData.name,
      });
      markerObjsRef.current.push(marker);
      bounds.extend(markerData.position);

      const html = buildInfoHtml(markerData);
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

function buildInfoHtml(marker: MarkerData) {
  const rows: string[] = [];
  if (marker.category) rows.push(`<div><strong>Category:</strong> ${escapeHtml(marker.category)}</div>`);
  if (marker.address) rows.push(`<div><strong>Address:</strong> ${escapeHtml(marker.address)}</div>`);
  if (marker.phone) rows.push(`<div><strong>Phone:</strong> ${escapeHtml(marker.phone)}</div>`);
  if (marker.website)
    rows.push(
      `<div><strong>Website:</strong> <a href="${encodeURI(marker.website)}" target="_blank" rel="noreferrer">${escapeHtml(
        marker.website
      )}</a></div>`
    );
  if (marker.description) rows.push(`<div style="margin-top:6px">${escapeHtml(marker.description)}</div>`);
  if (marker.tags?.length) rows.push(`<div style="margin-top:6px"><strong>Tags:</strong> ${marker.tags.map(escapeHtml).join(", ")}</div>`);
  return `<div style="max-width:260px"><div style="font-weight:600;margin-bottom:4px">${escapeHtml(marker.name)}</div>${rows.join(
    ""
  )}</div>`;
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}
