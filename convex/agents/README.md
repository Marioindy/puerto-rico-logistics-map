# Convex Agents

This directory contains the Convex backend implementation for both AI agents: Fabiola (public) and Jaynette (admin).

## Directory Structure

```
convex/agents/
├── README.md              # This file
├── fabiola.ts             # Fabiola agent and tools
├── jaynette.ts            # Jaynette agent and tools
└── shared/
    └── helpers.ts         # Shared utility functions
```

## Agent Overview

### Fabiola (fabiola.ts)
**Purpose:** Public-facing logistics assistant
**Model:** Claude 3 Haiku
**Access:** Read-only

**Tools:**
- `search_facilities` - Find facilities by name, type, or region
- `get_facility_details` - Get complete facility information
- `get_nearby_facilities` - Find facilities near coordinates
- `get_statistics` - Get system analytics

### Jaynette (jaynette.ts)
**Purpose:** Administrative database management
**Model:** Claude 3.5 Sonnet
**Access:** Full (create, update, delete)

**Tools:**
- `create_facility` - Create new facilities with validation
- `update_facility` - Modify existing facilities
- `delete_facility` - Remove facilities (with cascade)
- `bulk_import` - Import multiple facilities
- `generate_report` - Generate analytics reports

## Tool Architecture

All tools follow a consistent pattern:

```typescript
export const toolName = createTool({
  description: "Natural language description for LLM",
  args: z.object({
    // Zod schema for type-safe inputs
    param: z.string().describe("Parameter description"),
  }),
  handler: async (ctx, args) => {
    try {
      // 1. Validate inputs
      // 2. Perform operation
      // 3. Return standardized result
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(error);
    }
  },
});
```

### Benefits of This Pattern

✅ **Type Safety** - Zod validates all inputs
✅ **Consistency** - All tools return same result format
✅ **Error Handling** - Centralized error responses
✅ **Documentation** - Descriptions help LLM use tools correctly
✅ **Testability** - Easy to unit test individual tools

## Shared Utilities (shared/helpers.ts)

Modular helper functions used across both agents:

### Geographic Utilities
- `calculateDistance(coord1, coord2)` - Haversine distance calculation
- `validateCoordinates(coords, fieldName)` - Puerto Rico bounds validation
- `isValidPuertoRicoCoordinates(coords)` - Boolean validation
- `formatDistance(km)` - Format distance for display

### Data Validation
- `isValidFacilityType(type)` - Type guard for facility types
- `isValidRegion(region)` - Type guard for regions
- `sanitizeSearchInput(input)` - Clean user input
- `validateRequiredFields(obj, fields)` - Ensure required fields present

### Data Manipulation
- `groupBy(array, key)` - Group array items by key
- `countBy(array, key)` - Count items by key
- `generateSecureToken(length)` - Cryptographic token generation

### Result Helpers
- `createSuccessResult(data, metadata?)` - Standard success response
- `createErrorResult(error)` - Standard error response

### Security
- `validateAdminKey(key)` - Validate ADMIN_SECRET_KEY
- `isExpired(timestamp)` - Check if timestamp has passed

## Usage Examples

### Fabiola Tool Usage

```typescript
// Search for warehouses
const result = await searchFacilitiesTool.handler(ctx, {
  type: "warehouse",
  region: "north",
  activeOnly: true,
});

// Result format:
{
  success: true,
  data: {
    facilities: [...],
    total: 10,
    shown: 10
  }
}
```

### Jaynette Tool Usage

```typescript
// Create a facility
const result = await createFacilityTool.handler(ctx, {
  name: "New Warehouse",
  type: "warehouse",
  coordinates: { lat: 18.4, lng: -66.0 },
  description: "Modern storage facility",
  region: "central",
});

// Result format:
{
  success: true,
  data: {
    facilityId: "j123...",
    name: "New Warehouse",
    type: "warehouse",
    message: "Facility created successfully"
  }
}
```

## Error Handling

All tools return consistent error format:

```typescript
{
  success: false,
  error: "Error message here"
}
```

Common errors:
- **Validation Errors** - Invalid coordinates, types, or required fields
- **Duplicate Errors** - Facility name already exists
- **Not Found Errors** - Facility ID doesn't exist
- **Permission Errors** - Invalid admin key
- **Session Errors** - Expired or invalid session token

## Tool Integration with Agent

Tools are exported as collections for easy integration:

```typescript
// From fabiola.ts
export const fabiolaTools = {
  search_facilities: searchFacilitiesTool,
  get_facility_details: getFacilityDetailsTool,
  get_nearby_facilities: getNearbyFacilitiesTool,
  get_statistics: getStatisticsTool,
};

// From jaynette.ts
export const jaynetteTools = {
  create_facility: createFacilityTool,
  update_facility: updateFacilityTool,
  delete_facility: deleteFacilityTool,
  bulk_import: bulkImportTool,
  generate_report: generateReportTool,
};
```

Usage in Agent initialization:

```typescript
import { Agent } from "@convex-dev/agent";
import { fabiolaTools } from "./fabiola";

const fabiolaAgent = new Agent(components.agent, {
  name: "Fabiola",
  tools: fabiolaTools,
  // ... other config
});
```

## Testing Tools

Tools can be tested individually:

```typescript
import { searchFacilitiesTool } from "./fabiola";

// Mock context
const mockCtx = {
  runQuery: async (query, args) => { /* mock implementation */ },
};

// Test tool
const result = await searchFacilitiesTool.handler(mockCtx, {
  type: "warehouse",
});

expect(result.success).toBe(true);
expect(result.data.facilities).toBeDefined();
```

## Adding New Tools

To add a new tool:

1. **Create Tool Definition**
```typescript
export const newTool = createTool({
  description: "What the tool does",
  args: z.object({
    param: z.string().describe("Parameter description"),
  }),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

2. **Add to Tools Collection**
```typescript
export const fabiolaTools = {
  // ... existing tools
  new_tool: newTool,
};
```

3. **Document in TOOLS.md**
Update `agents/docs/TOOLS.md` with tool documentation

4. **Test Tool**
Add unit tests for the new tool

## Performance Considerations

- **Query Optimization** - Use indexes for common query patterns
- **Result Limiting** - Limit search results to prevent overwhelming responses
- **Lazy Loading** - Only load detailed data when explicitly requested
- **Caching** - Convex automatically caches query results

## Security Checklist

✅ All admin tools validate `ADMIN_SECRET_KEY`
✅ All coordinates validated against Puerto Rico bounds
✅ User input sanitized before database operations
✅ Session tokens validated before admin operations
✅ Duplicate checking prevents data corruption
✅ Error messages don't leak sensitive information

## Maintenance

When updating tools:
1. Update tool definition in respective file
2. Update shared helpers if adding reusable logic
3. Update TOOLS.md documentation
4. Run type checking: `pnpm run typecheck`
5. Test changes thoroughly

## Related Documentation

- [Agent Architecture](../../agents/docs/ARCHITECTURE.md)
- [Tools Reference](../../agents/docs/TOOLS.md)
- [Security Model](../../agents/docs/SECURITY.md)
- [Deployment Guide](../../agents/docs/DEPLOYMENT.md)

---

**Last Updated:** 2025-10-03
**Maintainer:** Development Team
