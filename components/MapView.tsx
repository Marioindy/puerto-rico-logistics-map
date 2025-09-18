"use client";

import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import type { ReactNode } from "react";

const containerStyle = {
  width: "100%",
  height: "100%"
};

const mapOptions = {
  disableDefaultUI: true,
  styles: []
};

const libraries: ("core" | "geometry" | "places" | "visualization")[] = ["core", "geometry", "places", "visualization"];

export type MapViewProps = {
  apiKey?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onMapLoad?: (map: google.maps.Map) => void;
  children?: ReactNode;
};

const fallbackCenter = { lat: 18.2208, lng: -66.5901 };
const fallbackZoom = 8;
const loaderId = "google-maps-primary";

const LoadingState = () => (
  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-400">
    <span>Loading geospatial grid...</span>
  </div>
);

const ErrorState = () => (
  <div className="flex h-full w-full items-center justify-center bg-red-950/40 text-red-200">
    <span>Unable to load Google Maps SDK.</span>
  </div>
);

export const MapView = ({
  apiKey,
  center = fallbackCenter,
  zoom = fallbackZoom,
  minZoom,
  maxZoom,
  onMapLoad,
  children
}: MapViewProps) => {
  const googleMapsApiKey = apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey!,
    id: loaderId,
    libraries: libraries
  });

  if (!googleMapsApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-red-500/40 bg-red-950/20 px-6 text-center text-sm text-red-200">
        Provide the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable to render the map.
      </div>
    );
  }

  if (loadError) {
    return <ErrorState />;
  }

  if (!isLoaded) {
    return <LoadingState />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{ ...mapOptions, minZoom, maxZoom } as google.maps.MapOptions}
      onLoad={onMapLoad}
    >
      {children}
    </GoogleMap>
  );
};

export default MapView;
