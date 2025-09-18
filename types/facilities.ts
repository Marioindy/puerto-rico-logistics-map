// Facility data types for the Puerto Rico Logistics Grid

export interface FacilityVariable {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'coordinates' | 'nested';
  value?: string | number;
  unit?: string;
  unitCategory?: 'distance' | 'area' | 'time' | 'capacity' | 'volume' | 'power' | 'percentage';
  icon?: string;
  color?: string;
  subVariables?: FacilityVariable[];
}

export interface FacilityBox {
  id: string;
  title: string;
  icon: string;
  color: string;
  variables: FacilityVariable[];
}

export interface FacilityData {
  title: string;
  type: string;
  boxes: FacilityBox[];
}

export interface FacilitiesMap {
  [facilityId: string]: FacilityData;
}

export interface SelectedPin {
  id: string;
  type: 'airport' | 'port' | 'warehouse' | 'facility';
  coordinates: {
    lat: number;
    lng: number;
  };
  data?: FacilityData;
}