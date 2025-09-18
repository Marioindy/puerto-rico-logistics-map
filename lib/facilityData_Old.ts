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
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Official Name', type: 'text', value: 'Luis Muñoz Marín International Airport' },
          { key: 'iata', label: 'IATA Code', type: 'text', value: 'SJU' },
          { key: 'icao', label: 'ICAO Code', type: 'text', value: 'TJSJ' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 555-0123' },
          { key: 'email', label: 'Email', type: 'email', value: 'info@airport.pr.gov' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Carr. 26, Carolina, PR 00979' }
        ]
      },
      {
        id: 'location_access',
        title: 'Ubicación y Acceso',
        icon: 'MapPin',
        color: 'orange',
        variables: [
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°26\'21.837"N, 066°00\'07.6800"W' },
          { key: 'elevation', label: 'Elevation', type: 'number', value: 9, unit: 'feet' },
          { key: 'timezone', label: 'Timezone', type: 'text', value: 'Atlantic Standard Time (AST)' },
          { key: 'land_area', label: 'Land Area', type: 'number', value: 1800, unit: 'acres' },
          { key: 'access_roads', label: 'Primary Access', type: 'text', value: 'Highway 26, Highway 37' }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: 'Settings',
        color: 'blue',
        variables: [
          { key: 'passengers_annual', label: 'Annual Passengers', type: 'number', value: 13247382, unit: 'passengers' },
          { key: 'flights_daily', label: 'Daily Flights', type: 'number', value: 180, unit: 'flights' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7' },
          { key: 'classification', label: 'Airport Classification', type: 'text', value: 'International, Commercial Service' },
          { key: 'ranking_caribbean', label: 'Caribbean Ranking', type: 'text', value: 'Busiest airport in the Caribbean' }
        ]
      },
      {
        id: 'infrastructure',
        title: 'Características Físicas',
        icon: 'Database',
        color: 'purple',
        variables: [
          { key: 'runway_08_26', label: 'Runway 08/26', type: 'text', value: '10,400 x 193 feet, Asphalt/Concrete' },
          { key: 'runway_10_28', label: 'Runway 10/28', type: 'text', value: '8,600 x 150 feet, Asphalt' },
          { key: 'load_capacity', label: 'Runway Load Capacity', type: 'text', value: 'PCN 80/F/A/X/T' },
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
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Official Name', type: 'text', value: 'Rafael Hernández Airport' },
          { key: 'iata', label: 'IATA Code', type: 'text', value: 'BQN' },
          { key: 'icao', label: 'ICAO Code', type: 'text', value: 'TJBQ' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 891-2286' },
          { key: 'email', label: 'Email', type: 'email', value: 'info@bqnairport.pr.gov' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Aguadilla, Puerto Rico 00603' }
        ]
      },
      {
        id: 'location_access',
        title: 'Ubicación y Acceso',
        icon: 'MapPin',
        color: 'orange',
        variables: [
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°29\'28"N, 067°07\'44"W' },
          { key: 'elevation', label: 'Elevation', type: 'number', value: 237, unit: 'feet' },
          { key: 'timezone', label: 'Timezone', type: 'text', value: 'Atlantic Standard Time (AST)' },
          { key: 'access_roads', label: 'Primary Access', type: 'text', value: 'Highway 107, Highway 2' }
        ]
      },
      {
        id: 'operations',
        title: 'Operations',
        icon: 'Settings',
        color: 'blue',
        variables: [
          { key: 'passengers_annual', label: 'Annual Passengers', type: 'number', value: 1500000, unit: 'passengers' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '6:00 AM - 10:00 PM' },
          { key: 'classification', label: 'Airport Classification', type: 'text', value: 'Regional, Commercial Service' },
          { key: 'primary_use', label: 'Primary Use', type: 'text', value: 'Commercial and cargo operations' }
        ]
      },
      {
        id: 'infrastructure',
        title: 'Características Físicas',
        icon: 'Database',
        color: 'purple',
        variables: [
          { key: 'runway_08_26', label: 'Runway 08/26', type: 'text', value: '11,700 x 150 feet, Asphalt' },
          { key: 'load_capacity', label: 'Runway Load Capacity', type: 'text', value: 'PCN 65/F/A/X/T' },
          { key: 'gates_total', label: 'Total Gates', type: 'number', value: 8 },
          { key: 'terminals', label: 'Terminal Configuration', type: 'text', value: 'Single terminal building' },
          { key: 'fire_category', label: 'Fire Category', type: 'text', value: 'CAT 6' }
        ]
      }
    ]
  },
  'warehouse-bayamon': {
    title: "Bayamón Logistics Center",
    type: "Class A Warehouse",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Bayamón Logistics Center' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 555-0199' },
          { key: 'email', label: 'Email', type: 'email', value: 'operations@bayamonlogistics.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Industrial Park Rd, Bayamón, PR 00956' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 500000, unit: 'sq ft' },
          { key: 'cubic_volume', label: 'Cubic Volume', type: 'number', value: 12500000, unit: 'cu ft' },
          { key: 'pallet_positions', label: 'Pallet Positions', type: 'number', value: 25000, unit: 'paletas' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 32, unit: 'feet' },
          { key: 'max_stack_height', label: 'Max Stack Height', type: 'number', value: 5, unit: 'pallets high' },
          { key: 'storage_density', label: 'Storage Density', type: 'number', value: 50, unit: 'pallets/1000 sq ft' }
        ]
      },
      {
        id: 'environmental_controls',
        title: 'Controles Ambientales',
        icon: 'Settings',
        color: 'purple',
        variables: [
          { key: 'room_temp_area', label: 'Room Temperature Storage', type: 'number', value: 400000, unit: 'sq ft' },
          { key: 'chilled_area', label: 'Chilled Storage (2-8°C)', type: 'number', value: 75000, unit: 'sq ft' },
          { key: 'frozen_area', label: 'Frozen Storage (-18°C)', type: 'number', value: 25000, unit: 'sq ft' },
          { key: 'humidity_control', label: 'Humidity Control', type: 'text', value: 'Available in all zones' },
          { key: 'temp_mapping', label: 'Temperature Mapping', type: 'text', value: 'Validated and certified' }
        ]
      },
      {
        id: 'infrastructure',
        title: 'Infraestructura',
        icon: 'Monitor',
        color: 'orange',
        variables: [
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 48 },
          { key: 'dock_levelers', label: 'Dock Levelers', type: 'text', value: 'Hydraulic dock levelers' },
          { key: 'floor_specs', label: 'Floor Specifications', type: 'text', value: '6-inch reinforced concrete, 250 PSI' },
          { key: 'aisle_width', label: 'Aisle Width', type: 'number', value: 12, unit: 'feet' },
          { key: 'sprinkler_system', label: 'Fire Protection', type: 'text', value: 'ESFR sprinkler system' }
        ]
      }
    ]
  },
  'warehouse-ponce': {
    title: "Ponce Distribution Hub",
    type: "Class B Warehouse",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Ponce Distribution Hub' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 555-0287' },
          { key: 'email', label: 'Email', type: 'email', value: 'hub@poncedistribution.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Carr. 14, Ponce, PR 00717' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 250000, unit: 'sq ft' },
          { key: 'cubic_volume', label: 'Cubic Volume', type: 'number', value: 6250000, unit: 'cu ft' },
          { key: 'pallet_positions', label: 'Pallet Positions', type: 'number', value: 12500, unit: 'paletas' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 28, unit: 'feet' },
          { key: 'max_stack_height', label: 'Max Stack Height', type: 'number', value: 4, unit: 'pallets high' }
        ]
      },
      {
        id: 'environmental_controls',
        title: 'Controles Ambientales',
        icon: 'Settings',
        color: 'purple',
        variables: [
          { key: 'room_temp_area', label: 'Room Temperature Storage', type: 'number', value: 200000, unit: 'sq ft' },
          { key: 'chilled_area', label: 'Chilled Storage (2-8°C)', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'humidity_control', label: 'Humidity Control', type: 'text', value: 'Available in chilled areas' },
          { key: 'energy_efficiency', label: 'Energy Efficiency', type: 'text', value: 'LEED Silver certified' }
        ]
      },
      {
        id: 'infrastructure',
        title: 'Infraestructura',
        icon: 'Monitor',
        color: 'orange',
        variables: [
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 24 },
          { key: 'dock_levelers', label: 'Dock Levelers', type: 'text', value: 'Manual dock levelers' },
          { key: 'floor_specs', label: 'Floor Specifications', type: 'text', value: '5-inch concrete, 200 PSI' },
          { key: 'aisle_width', label: 'Aisle Width', type: 'number', value: 10, unit: 'feet' },
          { key: 'sprinkler_system', label: 'Fire Protection', type: 'text', value: 'Standard sprinkler system' }
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
  },
  {
    id: 'warehouse-bayamon',
    type: 'warehouse',
    coordinates: { lat: 18.3984, lng: -66.1552 },
    data: facilityDatabase['warehouse-bayamon']
  },
  {
    id: 'warehouse-ponce',
    type: 'warehouse',
    coordinates: { lat: 18.0111, lng: -66.6140 },
    data: facilityDatabase['warehouse-ponce']
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