// Facility data management for Puerto Rico Logistics Grid
// Generated from DDEC RFI Survey Responses (69 responses)
// Source: Real industry data collected July-September 2025

import type { FacilityData, SelectedPin } from '@/types/facilities';

// Facility database with real RFI response data
export const facilityDatabase: Record<string, FacilityData> = {
  // ==================== AIRPORTS ====================
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
          { key: 'operator', label: 'Airport Operator', type: 'text', value: 'Aerostar Airport Holdings' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 289-7240' },
          { key: 'website', label: 'Website', type: 'text', value: 'https://aeropuertosju.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Ave. José A. Santana, Carolina, PR 00979' }
        ]
      },
      {
        id: 'location_access',
        title: 'Ubicación y Acceso',
        icon: 'MapPin',
        color: 'orange',
        variables: [
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°26\'16.1"N, 65°59\'30.0"W' },
          { key: 'elevation', label: 'Elevation', type: 'number', value: 9, unit: 'feet' },
          { key: 'timezone', label: 'Timezone', type: 'text', value: 'Atlantic Standard Time (AST)' },
          { key: 'land_area', label: 'Total Area', type: 'number', value: 4500000, unit: 'sq ft' },
          { key: 'access_roads', label: 'Primary Access', type: 'text', value: 'PR-26, PR-3, PR-17 Highways' }
        ]
      },
      {
        id: 'operations',
        title: 'Operations & Volume',
        icon: 'Settings',
        color: 'blue',
        variables: [
          { key: 'cargo_volume', label: 'Annual Cargo Volume', type: 'number', value: 300000, unit: 'tons' },
          { key: 'flights_daily', label: 'Daily Flights', type: 'number', value: 180, unit: 'flights' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'classification', label: 'Airport Classification', type: 'text', value: 'International, Commercial Service, FTZ #61' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'TSA, FAA, IATA, ACI, C-TPAT' }
        ]
      },
      {
        id: 'cargo_infrastructure',
        title: 'Cargo Infrastructure',
        icon: 'Database',
        color: 'purple',
        variables: [
          { key: 'cargo_terminal', label: 'Cargo Terminal Area', type: 'number', value: 350000, unit: 'sq ft' },
          { key: 'temp_zones', label: 'Temperature Zones', type: 'text', value: 'Ambient (70-75°F), Refrigerated (35-46°F), Frozen (-10-0°F)' },
          { key: 'refrigerated_area', label: 'Refrigerated Storage', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'frozen_area', label: 'Frozen Storage', type: 'number', value: 30000, unit: 'sq ft' },
          { key: 'loading_docks', label: 'Cargo Loading Docks', type: 'number', value: 45 },
          { key: 'parking', label: 'Parking Capacity', type: 'number', value: 8500, unit: 'spaces' }
        ]
      },
      {
        id: 'runway_specs',
        title: 'Runway Specifications',
        icon: 'Plane',
        color: 'indigo',
        variables: [
          { key: 'runway_primary', label: 'Primary Runway', type: 'text', value: '10,000 x 200 feet' },
          { key: 'runway_secondary', label: 'Secondary Runway', type: 'text', value: '8,600 x 150 feet' },
          { key: 'apron_area', label: 'Apron Area', type: 'number', value: 850000, unit: 'sq ft' },
          { key: 'aircraft_stands', label: 'Aircraft Parking Stands', type: 'number', value: 45 },
          { key: 'fire_category', label: 'Fire Category', type: 'text', value: 'CAT 8 (maximum category)' }
        ]
      }
    ]
  },

  'ups-hub-sju': {
    title: "UPS Hub - San Juan Airport",
    type: "Logistics Hub",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'UPS Hub - Carolina Airport' },
          { key: 'company', label: 'Company', type: 'text', value: 'United Parcel Service (UPS)' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Jorge Oramas - Gerente General' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 458-1664' },
          { key: 'email', label: 'Email', type: 'email', value: 'joramas@ups.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'CAF 150, Sector Central, LMM Airport, Carolina, PR' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 40000, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 18, unit: 'feet' },
          { key: 'pallet_capacity', label: 'Pallet Capacity', type: 'number', value: 2000, unit: 'paletas' },
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 18 },
          { key: 'dock_type', label: 'Dock Configuration', type: 'text', value: 'Hub consolidation point' }
        ]
      },
      {
        id: 'environmental_controls',
        title: 'Controles de Temperatura',
        icon: 'Thermometer',
        color: 'purple',
        variables: [
          { key: 'temp_controlled', label: 'Temperature Control', type: 'text', value: 'Yes - Multiple Zones' },
          { key: 'refrigerated', label: 'Refrigerated Zone (2-8°C)', type: 'number', value: 10000, unit: 'sq ft' },
          { key: 'controlled', label: 'Controlled Zone (15-25°C)', type: 'number', value: 15000, unit: 'sq ft' },
          { key: 'ambient', label: 'Ambient Storage', type: 'number', value: 15000, unit: 'sq ft' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '7:00 AM - 11:30 PM (Mon-Sun)' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'TSA Certified' },
          { key: 'services', label: 'Services', type: 'text', value: 'Air cargo handling, Cross-docking, Refrigerated storage, Hazmat, Customs' },
          { key: 'frequency', label: 'Service Frequency', type: 'text', value: 'Daily operations to worldwide destinations' },
          { key: 'cargo_types', label: 'Cargo Types', type: 'text', value: 'General, Refrigerated, Pharmaceutical, Hazmat, E-commerce' }
        ]
      }
    ]
  },

  'caribbean-cold-storage': {
    title: "Caribbean Cold Storage & Logistics",
    type: "Cold Storage Facility",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Caribbean Cold Storage & Logistics' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Bismark Marquez - Cold Storage Manager' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 783-0011 x1602' },
          { key: 'email', label: 'Email', type: 'email', value: 'bismark.marquez@trafongroup.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Mercado Central Calle C, Edificio 1229, Puerto Nuevo, PR 00920' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 150000, unit: 'sq ft' },
          { key: 'cubic_volume', label: 'Cubic Volume', type: 'number', value: 4500000, unit: 'cu ft' },
          { key: 'pallet_positions', label: 'Pallet Positions', type: 'number', value: 10000, unit: 'paletas' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 30, unit: 'feet' },
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 20 }
        ]
      },
      {
        id: 'temperature_zones',
        title: 'Zonas de Temperatura',
        icon: 'Thermometer',
        color: 'cyan',
        variables: [
          { key: 'ambient_zone', label: 'Ambient Zone (55°F)', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'ambient_capacity', label: 'Ambient Capacity', type: 'number', value: 3000, unit: 'pallets' },
          { key: 'refrigerated_zone', label: 'Refrigerated Zone (36°F)', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'refrigerated_capacity', label: 'Refrigerated Capacity', type: 'number', value: 3500, unit: 'pallets' },
          { key: 'frozen_zone', label: 'Frozen Zone (0°F)', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'frozen_capacity', label: 'Frozen Capacity', type: 'number', value: 3500, unit: 'pallets' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'SQF Certified' },
          { key: 'services', label: 'Services', type: 'text', value: 'Consolidation, Cross-docking, Cold storage, Customs, Distribution' },
          { key: 'special_handling', label: 'Special Handling', type: 'text', value: 'Protein processing, Food grade, Temperature monitoring' },
          { key: 'monthly_throughput', label: 'Monthly Throughput', type: 'number', value: 500000, unit: 'sq ft' }
        ]
      },
      {
        id: 'technology',
        title: 'Tecnología y Sistemas',
        icon: 'Monitor',
        color: 'purple',
        variables: [
          { key: 'wms', label: 'WMS System', type: 'text', value: 'Yes - Full WMS Integration' },
          { key: 'tracking', label: 'Tracking System', type: 'text', value: 'RFID & Barcode enabled' },
          { key: 'temp_monitoring', label: 'Temperature Monitoring', type: 'text', value: 'Real-time temperature monitoring system' },
          { key: 'reporting', label: 'Reporting', type: 'text', value: 'Track & trace capabilities' }
        ]
      }
    ]
  },

  'allied-logistics-caguas': {
    title: "Allied Logistics Corp - Caguas",
    type: "Distribution Center",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Allied Logistics Corp - Main Facility' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Denisse Rivera - CFO' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 525-1774' },
          { key: 'email', label: 'Email', type: 'email', value: 'denisserivera@alliedpr.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'State Road #1 Km 28.6 Barrio Río Cañas, Caguas, PR 00725' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 193304, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 33, unit: 'feet' },
          { key: 'pallet_capacity', label: 'Pallet Capacity', type: 'number', value: 15000, unit: 'paletas' },
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 28 },
          { key: 'temperature', label: 'Temperature Control', type: 'text', value: 'Controlled at 70°F' }
        ]
      },
      {
        id: 'certifications',
        title: 'Certificaciones y Compliance',
        icon: 'Shield',
        color: 'purple',
        variables: [
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'TSA, C-TPAT, FDA, NVOCC' },
          { key: 'ftz_status', label: 'FTZ Status', type: 'text', value: 'Foreign Trade Zone approved' },
          { key: 'bonded', label: 'Bonded Warehouse', type: 'text', value: 'Yes - Customs bonded' },
          { key: 'hazmat', label: 'Hazmat Certified', type: 'text', value: 'Yes - Full hazmat handling' },
          { key: 'fda_registered', label: 'FDA Registration', type: 'text', value: 'FDA registered facility' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'services', label: 'Services', type: 'text', value: '3PL, Consolidation, Air cargo, Cross-docking, Hazmat, Customs' },
          { key: 'special_handling', label: 'Special Handling', type: 'text', value: 'Pharmaceutical, FDA regulated, OTC products, Bonded cargo' },
          { key: 'systems', label: 'Technology Systems', type: 'text', value: 'SAP, TMS, WMS, RFID, Barcode tracking' }
        ]
      }
    ]
  },

  'gmd-airline-services': {
    title: "GMD Airline Services",
    type: "Air Cargo Handler",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'GMD Airline Services' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Ramon Colon - President' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 579-7922' },
          { key: 'email', label: 'Email', type: 'email', value: 'rcolon@gmdpr.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Avenida Jose Tony Santana, Carolina, PR 00979' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 30, unit: 'feet' },
          { key: 'loading_docks', label: 'Loading Positions', type: 'number', value: 10 },
          { key: 'cargo_capacity', label: 'Cargo Capacity', type: 'text', value: 'General and temperature-controlled' }
        ]
      },
      {
        id: 'temperature_control',
        title: 'Control de Temperatura',
        icon: 'Thermometer',
        color: 'cyan',
        variables: [
          { key: 'temp_controlled', label: 'Temperature Control', type: 'text', value: 'Yes - Multiple zones' },
          { key: 'refrigerated', label: 'Refrigerated (2-8°C)', type: 'number', value: 15000, unit: 'sq ft' },
          { key: 'controlled', label: 'Controlled (15-25°C)', type: 'number', value: 20000, unit: 'sq ft' },
          { key: 'ceiv_pharma', label: 'CEIV Pharma', type: 'text', value: 'CEIV Pharma certified' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones Aeroportuarias',
        icon: 'Plane',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'CEIV, TSA' },
          { key: 'services', label: 'Services', type: 'text', value: 'Air cargo handling, Ground handling, Ramp services' },
          { key: 'airlines_served', label: 'Airlines Served', type: 'text', value: 'Multiple international carriers' },
          { key: 'special_handling', label: 'Special Handling', type: 'text', value: 'Pharmaceutical, Perishables, Live animals' }
        ]
      }
    ]
  },

  // ==================== SEAPORTS ====================
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
          { key: 'phone', label: 'Main Phone', type: 'text', value: '(787) 723-2260' },
          { key: 'website', label: 'Website', type: 'text', value: 'https://prpa.pr.gov' },
          { key: 'coordinates', label: 'GPS Coordinates', type: 'coordinates', value: '18°27\'56"N, 66°06\'38"W' }
        ]
      },
      {
        id: 'operations',
        title: 'Port Operations',
        icon: 'Settings',
        color: 'green',
        variables: [
          { key: 'container_capacity', label: 'Container Capacity', type: 'number', value: 1500000, unit: 'TEUs/year' },
          { key: 'cargo_volume', label: 'Annual Cargo Volume', type: 'number', value: 11000000, unit: 'tons' },
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
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
          { key: 'total_area', label: 'Total Port Area', type: 'number', value: 7800000, unit: 'sq ft' },
          { key: 'warehouse_space', label: 'Warehouse Space', type: 'number', value: 500000, unit: 'sq ft' },
          { key: 'crane_capacity', label: 'Container Cranes', type: 'number', value: 8 },
          { key: 'max_vessel_length', label: 'Max Vessel Length', type: 'number', value: 1200, unit: 'feet' },
          { key: 'draft_depth', label: 'Maximum Draft', type: 'number', value: 50, unit: 'feet' },
          { key: 'reefer_plugs', label: 'Reefer Connections', type: 'number', value: 500, unit: 'plugs' }
        ]
      },
      {
        id: 'cargo_handling',
        title: 'Cargo Handling',
        icon: 'Package',
        color: 'purple',
        variables: [
          { key: 'cargo_types', label: 'Cargo Types', type: 'text', value: 'Container, General, Refrigerated, Bulk, Hazmat' },
          { key: 'special_handling', label: 'Special Handling', type: 'text', value: 'Oversized cargo, Project cargo, Reefer containers' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'ISO 28000, ISPS, C-TPAT' },
          { key: 'ftz_status', label: 'FTZ Status', type: 'text', value: 'Foreign Trade Zone available' },
          { key: 'customs', label: 'Customs', type: 'text', value: 'Full customs clearance services' }
        ]
      }
    ]
  },

  // ==================== WAREHOUSES ====================
  'cbx-global-aguadilla': {
    title: "CBX Global / CaribEx Worldwide",
    type: "Logistics Hub",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'CBX Global / CaribEx Worldwide' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'J. Chatt Jr. - Presidente/Chairman' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 658-7000' },
          { key: 'email', label: 'Email', type: 'email', value: 'jchattjr@caribex.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Carr #110, Km 24.6, Aguadilla, PR 00605' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 50000, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 20, unit: 'feet' },
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 1 },
          { key: 'temperature', label: 'Temperature Control', type: 'text', value: 'Controlled at 70°F' }
        ]
      },
      {
        id: 'certifications',
        title: 'Certificaciones',
        icon: 'Shield',
        color: 'purple',
        variables: [
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'GDP, TSA, IAC' },
          { key: 'cargo_restriction', label: 'Cargo Restrictions', type: 'text', value: 'No restricted materials' },
          { key: 'compliance', label: 'Compliance', type: 'text', value: 'Customs approved facility' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: 'Monday-Friday 8:00 AM - 6:00 PM' },
          { key: 'services', label: 'Services', type: 'text', value: 'Consolidation, Air cargo, Cross-docking, Refrigerated, Customs, Full logistics' },
          { key: 'special_handling', label: 'Special Handling', type: 'text', value: 'Medical products, Raw materials for manufacturing' },
          { key: 'infrastructure', label: 'Infrastructure Access', type: 'text', value: 'Rafael Hernandez Airport, PR-110, Aguadilla Port' }
        ]
      }
    ]
  },

  'prsd-aguadilla': {
    title: "Puerto Rico Storage & Distribution - Aguadilla",
    type: "Free Trade Zone Warehouse",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Puerto Rico Storage & Distribution - FTZ' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Angel Ortiz - Presidente' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 890-0131' },
          { key: 'email', label: 'Email', type: 'email', value: 'aortiz@prsd.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Carr 110 Km 28.7, Aguadilla, PR 00603' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 174000, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 35, unit: 'feet' },
          { key: 'pallet_capacity', label: 'Pallet Capacity', type: 'number', value: 2000, unit: 'paletas' },
          { key: 'usable_space', label: 'Usable Storage', type: 'number', value: 40000, unit: 'sq ft' }
        ]
      },
      {
        id: 'ftz_operations',
        title: 'Free Trade Zone Operations',
        icon: 'Globe',
        color: 'purple',
        variables: [
          { key: 'ftz_status', label: 'FTZ Status', type: 'text', value: 'Active Foreign Trade Zone' },
          { key: 'zone_number', label: 'FTZ Number', type: 'text', value: 'Zone 61' },
          { key: 'customs_benefits', label: 'Customs Benefits', type: 'text', value: 'Duty deferral, inverted tariff, zone-to-zone transfers' },
          { key: 'compliance', label: 'Compliance', type: 'text', value: 'US Customs approved' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '7:00 AM - 5:00 PM (Mon-Fri)' },
          { key: 'services', label: 'Services', type: 'text', value: 'Customs transit, Logistics storage, Medical device storage' },
          { key: 'temperature', label: 'Temperature Control', type: 'text', value: 'Controlled environment for medical devices' },
          { key: 'special_handling', label: 'Special Handling', type: 'text', value: 'FDA regulated products, Medical devices' }
        ]
      }
    ]
  },

  // ==================== MANUFACTURING FACILITIES ====================
  'millicent-manufacturing': {
    title: "Millicent Manufacturing PR LLC",
    type: "Pharmaceutical Manufacturing",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Millicent Manufacturing PR LLC' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Frank Rodriguez - President/GM' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 710-5210' },
          { key: 'email', label: 'Email', type: 'email', value: 'frank.rodriguez@millicentpharma.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Union St Road 195 Km 1.1, Fajardo, PR 00738' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_sqft', label: 'Total Square Footage', type: 'number', value: 22127, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 15, unit: 'feet' },
          { key: 'pallet_capacity', label: 'Pallet Capacity', type: 'number', value: 1100, unit: 'paletas' },
          { key: 'loading_docks', label: 'Loading Docks', type: 'number', value: 4 }
        ]
      },
      {
        id: 'manufacturing',
        title: 'Manufacturing Operations',
        icon: 'Factory',
        color: 'purple',
        variables: [
          { key: 'products', label: 'Products', type: 'text', value: 'Hormonal Solids (Pharmaceutical)' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'GDP (Good Distribution Practice)' },
          { key: 'volume_in', label: 'Monthly Input', type: 'number', value: 20, unit: 'pallets/month' },
          { key: 'volume_out', label: 'Monthly Output', type: 'number', value: 20, unit: 'pallets/month' },
          { key: 'quality_systems', label: 'Quality Systems', type: 'text', value: 'MES, QMS' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '8:00 AM - 5:00 PM (Mon-Fri)' },
          { key: 'temperature', label: 'Temperature Control', type: 'text', value: 'HVAC controlled (68-72°F)' },
          { key: 'services', label: 'Services', type: 'text', value: 'Cross-docking, Consolidation, Quality control' },
          { key: 'compliance', label: 'Compliance', type: 'text', value: 'FDA compliant facility' }
        ]
      }
    ]
  },

  // ==================== SPECIALIZED FACILITIES ====================
  'buckeye-yabucoa': {
    title: "Buckeye Caribbean Terminals - Yabucoa",
    type: "Fuel Terminal",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Buckeye Caribbean Terminals LLC' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Carlos Silva - Gerente de Operaciones' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 382-0807' },
          { key: 'email', label: 'Email', type: 'email', value: 'csilva@buckeye.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Road 901 KM 2.3 Camino Nuevo, Yabucoa, PR 00767' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_area', label: 'Total Area', type: 'number', value: 7576000, unit: 'sq ft' },
          { key: 'storage_capacity', label: 'Storage Capacity', type: 'text', value: '4.6 Million Barrels' },
          { key: 'tank_height', label: 'Tank Height', type: 'number', value: 60, unit: 'feet' },
          { key: 'marine_docks', label: 'Marine Docks', type: 'number', value: 2 }
        ]
      },
      {
        id: 'fuel_operations',
        title: 'Fuel Operations',
        icon: 'Fuel',
        color: 'orange',
        variables: [
          { key: 'products', label: 'Products Handled', type: 'text', value: 'Gasoline, Diesel, Jet Fuel, Petroleum Products' },
          { key: 'blending', label: 'Gasoline Blending', type: 'text', value: 'Yes - Full blending capabilities' },
          { key: 'throughput', label: 'Daily Throughput', type: 'number', value: 17000, unit: 'barrels/day' },
          { key: 'pipeline', label: 'Pipeline Network', type: 'text', value: 'Connected to distribution network' }
        ]
      },
      {
        id: 'compliance',
        title: 'Compliance & Safety',
        icon: 'Shield',
        color: 'purple',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'hazmat_certified', label: 'Hazmat Certified', type: 'text', value: 'Yes - Full hazmat operations' },
          { key: 'customs_approved', label: 'Customs Approved', type: 'text', value: 'Yes - Import/export operations' },
          { key: 'safety_systems', label: 'Safety Systems', type: 'text', value: 'Terminal Automation System, Safety Management System' },
          { key: 'marine_terminal', label: 'Marine Terminal', type: 'text', value: 'Deep water marine terminal' }
        ]
      }
    ]
  },

  'centro-mercantil-internacional': {
    title: "Centro Mercantil Internacional",
    type: "Free Trade Zone",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'Centro Mercantil Internacional' },
          { key: 'operator', label: 'Operator', type: 'text', value: 'DDEC - Departamento de Desarrollo Económico' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Haydee Serrano - Oficial de Control' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 758-4747 x26800' },
          { key: 'email', label: 'Email', type: 'email', value: 'haydee.serrano@ddec.pr.gov' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Carr. 165, Km 2.4 Sector Pueblo Viejo, Guaynabo, PR' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad Total',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_area', label: 'Total Area', type: 'number', value: 2082612, unit: 'sq ft' },
          { key: 'usable_space', label: 'Usable Space', type: 'number', value: 1877647, unit: 'sq ft' },
          { key: 'clear_height', label: 'Clear Height', type: 'number', value: 30, unit: 'feet' },
          { key: 'pallet_capacity', label: 'Estimated Capacity', type: 'number', value: 100000, unit: 'paletas' }
        ]
      },
      {
        id: 'ftz_operations',
        title: 'Free Trade Zone Operations',
        icon: 'Globe',
        color: 'purple',
        variables: [
          { key: 'ftz_number', label: 'FTZ Number', type: 'text', value: 'Foreign Trade Zone #61' },
          { key: 'license', label: 'License', type: 'text', value: 'Foreign Trade Zone License' },
          { key: 'benefits', label: 'Benefits', type: 'text', value: 'Duty deferral, Inverted tariffs, Re-export, Manufacturing' },
          { key: 'tenants', label: 'Tenant Type', type: 'text', value: 'Multiple tenants - various industries' },
          { key: 'customs', label: 'Customs', type: 'text', value: 'Full customs integration' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'services', label: 'Services', type: 'text', value: 'Consolidation, Refrigerated storage, Customs transit, FTZ operations' },
          { key: 'cargo_types', label: 'Cargo Types', type: 'text', value: 'General, Pharmaceutical, Container' },
          { key: 'infrastructure', label: 'Access', type: 'text', value: 'PR-165 Highway, PR-2 Highway' }
        ]
      }
    ]
  },

  'aes-guayama': {
    title: "AES Puerto Rico Coal Power Plant",
    type: "Industrial Manufacturing",
    boxes: [
      {
        id: 'basic_info',
        title: 'Información de Contacto',
        icon: 'Info',
        color: 'green',
        variables: [
          { key: 'name', label: 'Facility Name', type: 'text', value: 'AES Puerto Rico, LP' },
          { key: 'contact', label: 'Contact Person', type: 'text', value: 'Jesus Bolinaga - Presidente' },
          { key: 'phone', label: 'Teléfono', type: 'text', value: '(787) 866-8117' },
          { key: 'email', label: 'Email', type: 'email', value: 'jesus.bolinaga@aes.com' },
          { key: 'address', label: 'Dirección', type: 'text', value: 'Bo. Jobos Carr #3, Km 142.0, Guayama, PR 00784' }
        ]
      },
      {
        id: 'storage_capacity',
        title: 'Capacidad de Almacenamiento',
        icon: 'Database',
        color: 'blue',
        variables: [
          { key: 'total_area', label: 'Total Area', type: 'number', value: 314000, unit: 'sq ft' },
          { key: 'marine_docks', label: 'Marine Docks', type: 'number', value: 1 },
          { key: 'coal_storage', label: 'Coal Storage', type: 'text', value: 'Bulk storage facility' },
          { key: 'agremax_storage', label: 'Agremax Storage', type: 'text', value: 'Manufactured aggregate storage' }
        ]
      },
      {
        id: 'industrial_operations',
        title: 'Industrial Operations',
        icon: 'Factory',
        color: 'purple',
        variables: [
          { key: 'products', label: 'Products', type: 'text', value: 'Energy, Steam, Agremax (manufactured aggregate)' },
          { key: 'input_volume', label: 'Coal Input', type: 'text', value: '~40,000 tons per vessel' },
          { key: 'output_volume', label: 'Agremax Output', type: 'text', value: '~16,000 tons per vessel' },
          { key: 'vessel_frequency', label: 'Vessel Frequency', type: 'text', value: 'Monthly vessels' },
          { key: 'certifications', label: 'Certifications', type: 'text', value: 'ISO certified' }
        ]
      },
      {
        id: 'operations',
        title: 'Operaciones',
        icon: 'Settings',
        color: 'orange',
        variables: [
          { key: 'operating_hours', label: 'Operating Hours', type: 'text', value: '24/7 Operations' },
          { key: 'transport_modes', label: 'Transport Modes', type: 'text', value: 'Maritime (bulk vessels), Ground transport' },
          { key: 'infrastructure', label: 'Infrastructure', type: 'text', value: 'Private port terminal, PR-3 Highway' },
          { key: 'hazmat_handling', label: 'Hazmat Handling', type: 'text', value: 'Yes - Industrial materials' },
          { key: 'systems', label: 'Control Systems', type: 'text', value: 'Industrial Control Systems, Bulk Material Management' }
        ]
      }
    ]
  }
};

// Sample markers for the map with real RFI data
export const mapMarkers: SelectedPin[] = [
  // Airports
  {
    id: 'sju-airport',
    type: 'airport',
    coordinates: { lat: 18.4378041, lng: -65.9916765 },
    data: facilityDatabase['sju-airport']
  },
  {
    id: 'ups-hub-sju',
    type: 'facility',
    coordinates: { lat: 18.4378041, lng: -65.9916765 },
    data: facilityDatabase['ups-hub-sju']
  },
  {
    id: 'gmd-airline-services',
    type: 'facility',
    coordinates: { lat: 18.4394, lng: -66.0028 },
    data: facilityDatabase['gmd-airline-services']
  },
  
  // Seaports
  {
    id: 'san-juan-port',
    type: 'port',
    coordinates: { lat: 18.4655, lng: -66.1105 },
    data: facilityDatabase['san-juan-port']
  },
  
  // Warehouses & Distribution Centers
  {
    id: 'caribbean-cold-storage',
    type: 'warehouse',
    coordinates: { lat: 18.4500, lng: -66.0667 },
    data: facilityDatabase['caribbean-cold-storage']
  },
  {
    id: 'allied-logistics-caguas',
    type: 'warehouse',
    coordinates: { lat: 18.29278, lng: -66.04660 },
    data: facilityDatabase['allied-logistics-caguas']
  },
  {
    id: 'cbx-global-aguadilla',
    type: 'warehouse',
    coordinates: { lat: 18.4956, lng: -67.1297 },
    data: facilityDatabase['cbx-global-aguadilla']
  },
  {
    id: 'prsd-aguadilla',
    type: 'warehouse',
    coordinates: { lat: 18.4934, lng: -67.1354 },
    data: facilityDatabase['prsd-aguadilla']
  },
  
  // Manufacturing Facilities
  {
    id: 'millicent-manufacturing',
    type: 'facility',
    coordinates: { lat: 18.3489, lng: -65.6269 },
    data: facilityDatabase['millicent-manufacturing']
  },
  {
    id: 'aes-guayama',
    type: 'facility',
    coordinates: { lat: 17.9701, lng: -66.1544 },
    data: facilityDatabase['aes-guayama']
  },
  {
    id: 'buckeye-yabucoa',
    type: 'facility',
    coordinates: { lat: 18.046887, lng: -65.851799 },
    data: facilityDatabase['buckeye-yabucoa']
  },
  
  // Free Trade Zones
  {
    id: 'centro-mercantil-internacional',
    type: 'facility',
    coordinates: { lat: 18.4270, lng: -66.1219 },
    data: facilityDatabase['centro-mercantil-internacional']
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

// Summary statistics from RFI data
export const facilitySummary = {
  totalFacilities: Object.keys(facilityDatabase).length,
  totalRFIResponses: 69,
  facilitiesWithStorage: 27,
  manufacturers: 9,
  cargoOperators: 45,
  temperatureControlled: 15,
  freeTradeZones: 3,
  operating24x7: 8
};