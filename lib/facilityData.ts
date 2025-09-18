// Facility data management for Puerto Rico Logistics Grid
// This will eventually be replaced with Convex queries

import type { FacilityData, SelectedPin } from '@/types/facilities';

// Sample facility data - replace with Convex queries in production
export const facilityDatabase: Record<string, FacilityData> = {
  'sju-airport': {
    title: "Luis Muñoz Marín International Airport",
    type: "International Airport",
    boxes: [
      {
        id: 'basic_info',
        title: 'Basic Information',
        icon: 'Info',
        color: 'blue',
        variables: [
          { key: 'name', label: 'Official Name', type: 'text', value: 'Luis Muñoz Marín International Airport' },
          { key: 'iata', label: 'IATA Code', type: 'text', value: 'SJU' },
          { key: 'icao', label: 'ICAO Code', type: 'text', value: 'TJSJ' },
          { key: 'phone', label: 'Main Phone', type: 'text', value: '+1-787-289-7240' },
          { key: 'email', label: 'Email', type: 'email', value: 'aeropuertosju@aerostar.aero' },
          { key: 'address', label: 'Address', type: 'text', value: 'Isla Verde, Carolina, Puerto Rico 00979' },
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°26\'21.837"N, 066°00\'07.6800"W' }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: 'Settings',
        color: 'green',
        variables: [
          { key: 'passengers_annual', label: 'Annual Passengers', type: 'number', value: 13247382, unit: 'passengers' },
          { key: 'flights_daily', label: 'Daily Flights', type: 'number', value: 180, unit: 'flights' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7' },
          { key: 'ranking_us', label: 'US Ranking', type: 'text', value: '39th busiest in US territories' },
          { key: 'ranking_caribbean', label: 'Caribbean Ranking', type: 'text', value: 'Busiest airport in the Caribbean' }
        ]
      },
      {
        id: 'infrastructure',
        title: 'Infrastructure',
        icon: 'Database',
        color: 'purple',
        variables: [
          { key: 'runway_main', label: 'Main Runway 08/26', type: 'text', value: '10,400 x 193 feet' },
          { key: 'surface', label: 'Runway Surface', type: 'text', value: 'Asphalt/Concrete' },
          { key: 'gates_total', label: 'Total Gates', type: 'number', value: 29 },
          { key: 'terminals', label: 'Terminal Configuration', type: 'text', value: 'Single terminal with 4 interconnected concourses' },
          { key: 'fire_category', label: 'Fire Category', type: 'text', value: 'CAT 8 (maximum category)' }
        ]
      }
    ]
  },
  'san-juan-port': {
    title: "Port of San Juan",
    type: "Commercial Deep Water Port",
    boxes: [
      {
        id: 'port_info',
        title: 'Port Information',
        icon: 'Info',
        color: 'blue',
        variables: [
          { key: 'name', label: 'Official Name', type: 'text', value: 'Port of San Juan' },
          { key: 'type', label: 'Port Type', type: 'text', value: 'Commercial Deep Water Port' },
          { key: 'authority', label: 'Port Authority', type: 'text', value: 'Puerto Rico Ports Authority' },
          { key: 'phone', label: 'Main Phone', type: 'text', value: '+1-787-722-2002' },
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°27\'52"N, 066°06\'21"W' }
        ]
      },
      {
        id: 'operations',
        title: 'Port Operations',
        icon: 'Settings',
        color: 'green',
        variables: [
          { key: 'container_capacity', label: 'Container Capacity', type: 'number', value: 1500000, unit: 'TEU/year' },
          { key: 'cargo_volume', label: 'Annual Cargo Volume', type: 'number', value: 11000000, unit: 'tons' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7' },
          { key: 'berths', label: 'Number of Berths', type: 'number', value: 16 },
          { key: 'ranking', label: 'Caribbean Ranking', type: 'text', value: 'Largest port in the Caribbean' }
        ]
      },
      {
        id: 'facilities',
        title: 'Port Facilities',
        icon: 'Database',
        color: 'orange',
        variables: [
          { key: 'warehouse_space', label: 'Warehouse Space', type: 'number', value: 500000, unit: 'sq ft' },
          { key: 'crane_capacity', label: 'Container Cranes', type: 'number', value: 8 },
          { key: 'max_vessel_length', label: 'Max Vessel Length', type: 'number', value: 1200, unit: 'feet' },
          { key: 'draft_depth', label: 'Maximum Draft', type: 'number', value: 50, unit: 'feet' },
          { key: 'rail_connection', label: 'Rail Connection', type: 'text', value: 'Connected to island rail network' }
        ]
      }
    ]
  },
  'aguadilla-airport': {
    title: "Rafael Hernández Airport",
    type: "Regional Airport",
    boxes: [
      {
        id: 'basic_info',
        title: 'Basic Information',
        icon: 'Info',
        color: 'blue',
        variables: [
          { key: 'name', label: 'Official Name', type: 'text', value: 'Rafael Hernández Airport' },
          { key: 'iata', label: 'IATA Code', type: 'text', value: 'BQN' },
          { key: 'icao', label: 'ICAO Code', type: 'text', value: 'TJBQ' },
          { key: 'phone', label: 'Main Phone', type: 'text', value: '+1-787-891-2286' },
          { key: 'address', label: 'Address', type: 'text', value: 'Aguadilla, Puerto Rico 00603' },
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°29\'28"N, 067°07\'44"W' }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: 'Settings',
        color: 'green',
        variables: [
          { key: 'passengers_annual', label: 'Annual Passengers', type: 'number', value: 1500000, unit: 'passengers' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '6:00 AM - 10:00 PM' },
          { key: 'runway_length', label: 'Runway Length', type: 'number', value: 11700, unit: 'feet' },
          { key: 'primary_use', label: 'Primary Use', type: 'text', value: 'Commercial and cargo operations' }
        ]
      }
    ]
  }
};

// Sample markers for the map
export const mapMarkers: SelectedPin[] = [
  {
    id: 'sju-airport',
    type: 'airport',
    coordinates: { lat: 18.4394, lng: -66.0021 },
    data: facilityDatabase['sju-airport']
  },
  {
    id: 'san-juan-port',
    type: 'port',
    coordinates: { lat: 18.4644, lng: -66.1057 },
    data: facilityDatabase['san-juan-port']
  },
  {
    id: 'aguadilla-airport',
    type: 'airport',
    coordinates: { lat: 18.4947, lng: -67.1294 },
    data: facilityDatabase['aguadilla-airport']
  }
];

// Helper functions
export const getFacilityById = (id: string): FacilityData | undefined => {
  return facilityDatabase[id];
};

export const getAllMarkers = (): SelectedPin[] => {
  return mapMarkers;
};

export const getMarkersByType = (type: 'airport' | 'port' | 'warehouse' | 'facility'): SelectedPin[] => {
  return mapMarkers.filter(marker => marker.type === type);
};