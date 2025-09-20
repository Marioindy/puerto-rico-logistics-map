# Puerto Rico Logistics Grid - Map Implementation

## Overview

This document describes the implementation of the interactive Google Maps integration with facility information panels for the Puerto Rico Logistics Grid project.

## Architecture

### Components Structure

```
components/
├── InteractiveMap.tsx       # Main map component with Google Maps integration
├── FacilityInfoPanel.tsx   # Right-side information panel for selected facilities
└── MapView.tsx             # Original basic map component (kept for reference)

types/
└── facilities.ts           # TypeScript interfaces for facility data

lib/
└── facilityData.ts         # Data service for facility information
```

### Key Features

1. **Interactive Google Maps**: Full-featured map with custom styling
2. **Facility Markers**: Color-coded pins for different facility types
3. **Dynamic Info Panel**: Right-side panel showing detailed facility information
4. **Responsive Design**: Mobile-friendly layout with proper breakpoints
5. **Type Safety**: Full TypeScript support with custom interfaces

## Components

### InteractiveMap Component

**Location**: `components/InteractiveMap.tsx`

Main interactive map component that:
- Renders Google Maps with custom styling
- Displays facility markers with color coding
- Handles marker click interactions
- Manages selected pin state
- Integrates with the facility info panel

**Props**:
- `apiKey?: string` - Google Maps API key (optional, uses env var)
- `center?: { lat: number; lng: number }` - Map center coordinates
- `zoom?: number` - Initial zoom level

### FacilityInfoPanel Component

**Location**: `components/FacilityInfoPanel.tsx`

Displays detailed facility information when a marker is selected:
- Expandable/collapsible sections
- Color-coded information boxes
- Icons for different data types
- Responsive layout for different screen sizes

**Props**:
- `selectedPin: SelectedPin | null` - Currently selected facility
- `onClose: () => void` - Callback to close the panel
- `isVisible: boolean` - Panel visibility state

## Data Management

### Facility Data Service

**Location**: `lib/facilityData.ts`

Centralized data management for facility information:
- Sample facility data (to be replaced with Convex queries)
- Helper functions for data retrieval
- Type-safe data structure

**Functions**:
- `getAllMarkers()` - Returns all facility markers
- `getFacilityById(id: string)` - Get specific facility data
- `getMarkersByType(type)` - Filter markers by facility type

### Type Definitions

**Location**: `types/facilities.ts`

TypeScript interfaces for:
- `FacilityVariable` - Individual data fields
- `FacilityBox` - Information sections
- `FacilityData` - Complete facility information
- `SelectedPin` - Map marker with facility data

## Google Maps Integration

### API Configuration

Google Maps API key is configured via environment variables:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Required for map rendering
- Key should have permissions for Maps JavaScript API

### Map Styling

Custom map style for better visibility:
- Clean, minimalist design
- Reduced UI elements for cleaner interface
- Custom colors for water, land, and roads
- POI (Points of Interest) disabled to reduce clutter

### Libraries Used

- `@react-google-maps/api` - React wrapper for Google Maps
- Required libraries: `["core", "geometry", "places", "visualization"]`

## Facility Types and Color Coding

| Type | Color | Description |
|------|-------|-------------|
| Airport | Blue (#3B82F6) | Airports and airfields |
| Port | Green (#10B981) | Commercial ports and harbors |
| Warehouse | Amber (#F59E0B) | Logistics and storage facilities |
| Facility | Gray (#6B7280) | General facilities |

## Environment Setup

### Required Environment Variables

Create or update `.env.local` with:

```bash
# Google Maps Integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Convex Backend
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)

## Current Sample Data

The system includes sample data for:

### Airports
- **Luis Muñoz Marín International (SJU)**: Main international airport
- **Rafael Hernández Airport (BQN)**: Regional airport in Aguadilla

### Ports
- **Port of San Juan**: Main commercial port

### Data Structure

Each facility includes:
- Basic information (name, codes, contact info)
- Operational data (capacity, hours, rankings)
- Infrastructure details (runways, terminals, equipment)

## Future Enhancements

### Planned Features

1. **Left Side Menu**: Filter controls for facility types
2. **Bottom Menu**: Google Places integration for additional services
3. **Real-time Data**: Integration with Convex backend
4. **Search Functionality**: Search by facility name or code
5. **Route Planning**: Directions between facilities
6. **Layer Controls**: Toggle different data overlays

### Integration Roadmap

1. **Phase 1**: Replace sample data with Convex queries
2. **Phase 2**: Add real-time operational status
3. **Phase 3**: Implement AWS Amplify notifications
4. **Phase 4**: Add advanced filtering and search
5. **Phase 5**: Integrate with external logistics APIs

## Development Guidelines

### Adding New Facilities

1. Add facility data to `lib/facilityData.ts`
2. Ensure proper typing with `FacilityData` interface
3. Include coordinates for map placement
4. Use appropriate facility type for color coding

### Modifying Data Structure

1. Update TypeScript interfaces in `types/facilities.ts`
2. Update sample data in `lib/facilityData.ts`
3. Modify components to handle new data fields
4. Test with various data combinations

### Custom Styling

Map styles can be modified in `InteractiveMap.tsx`:
- Edit the `mapOptions.styles` array
- Use [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/) for visual editing
- Test across different screen sizes and devices

## Troubleshooting

### Common Issues

1. **Map not loading**: Check Google Maps API key in environment variables
2. **Markers not appearing**: Verify coordinate format and data structure
3. **Panel not opening**: Check click handlers and state management
4. **Styling issues**: Verify Tailwind CSS classes and responsive breakpoints

### Debug Mode

The system includes error states and loading indicators:
- API key missing warning
- Map load error handling
- Fallback UI for offline scenarios

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Map loads only when needed via Suspense
2. **Marker Clustering**: Consider for large numbers of facilities
3. **Data Caching**: Cache facility data to reduce API calls
4. **Image Optimization**: Use optimized icons and images

### AWS Amplify Deployment

The application is configured for AWS Amplify hosting:
- Environment variables managed via Amplify Console
- Build process optimized for production
- CDN distribution for global performance

---

## Files Modified/Created

### New Files
- `components/InteractiveMap.tsx` - Main interactive map component
- `components/FacilityInfoPanel.tsx` - Facility information panel
- `types/facilities.ts` - TypeScript type definitions
- `lib/facilityData.ts` - Facility data service
- `.env.local.example` - Environment variable template
- `docs/MAP_IMPLEMENTATION.md` - This documentation

### Modified Files
- `app/(dashboard)/tracking/page.tsx` - Updated to use InteractiveMap
- `Claude.md` - Added project-specific configuration

### Original Files (Preserved)
- `modular-right-menu-dev.tsx` - Original development component (kept in root)
- `components/MapView.tsx` - Original basic map component