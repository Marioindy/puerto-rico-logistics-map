"use client";

import React, { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { getAllMarkers } from '@/lib/facilityData';
import type { SelectedPin } from '@/types/facilities';

const containerStyle = {
  width: "100%",
  height: "100%"
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ weight: "2.00" }]
    },
    {
      featureType: "all",
      elementType: "geometry.stroke",
      stylers: [{ color: "#9c9c9c" }]
    },
    {
      featureType: "all",
      elementType: "labels.text",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ color: "#f2f2f2" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }]
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#eeeeee" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7b7b7b" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#46bcec" }, { visibility: "on" }]
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#c8d7d4" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#070707" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }]
    }
  ]
};

const libraries: ("core" | "geometry" | "places" | "visualization")[] = ["core", "geometry", "places", "visualization"];


export interface InteractiveMapProps {
  apiKey?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: SelectedPin) => void;
}

const fallbackCenter = { lat: 18.2208, lng: -66.5901 }; // Center of Puerto Rico
const fallbackZoom = 9;
const loaderId = "google-maps-interactive";

const LoadingState = () => (
  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-400">
    <span>Loading Puerto Rico Logistics Grid...</span>
  </div>
);

const ErrorState = () => (
  <div className="flex h-full w-full items-center justify-center bg-red-950/40 text-red-200">
    <span>Unable to load Google Maps SDK.</span>
  </div>
);

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  apiKey,
  center = fallbackCenter,
  zoom = fallbackZoom,
  onMarkerClick
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Get markers from data service
  const markers = getAllMarkers();

  const googleMapsApiKey = apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey!,
    id: loaderId,
    libraries: libraries
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const handleMarkerClick = useCallback((marker: SelectedPin) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
    if (map) {
      map.panTo(marker.coordinates);
      map.setZoom(12);
    }
  }, [map, onMarkerClick]);

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
      options={mapOptions as google.maps.MapOptions}
      onLoad={onMapLoad}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.coordinates}
          onClick={() => handleMarkerClick(marker)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: marker.type === 'airport' ? '#3B82F6' :
                      marker.type === 'port' ? '#10B981' :
                      marker.type === 'warehouse' ? '#F59E0B' : '#6B7280',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }}
          title={marker.data?.title}
        />
      ))}
    </GoogleMap>
  );
};

export default InteractiveMap;