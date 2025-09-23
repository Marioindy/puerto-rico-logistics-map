import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const seedSampleGeoLocales = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleData = [
      {
        geoLocale: {
          name: "Luis Muñoz Marín International Airport",
          coordinates: { lat: 18.4394, lng: -66.0012 },
          type: "airport",
          region: "San Juan",
          description: "Main international airport serving Puerto Rico",
          isActive: true
        },
        boxes: [
          {
            title: "Basic Information",
            icon: "Info",
            color: "blue",
            sortOrder: 1,
            variables: [
              {
                key: "iata_code",
                label: "IATA Code",
                type: "text" as const,
                value: "SJU"
              },
              {
                key: "icao_code",
                label: "ICAO Code",
                type: "text" as const,
                value: "TJSJ"
              },
              {
                key: "elevation",
                label: "Elevation",
                type: "number" as const,
                value: 9,
                unit: "ft",
                unitCategory: "distance" as const
              }
            ]
          },
          {
            title: "Operations",
            icon: "Settings",
            color: "green",
            sortOrder: 2,
            variables: [
              {
                key: "passengers_annual",
                label: "Annual Passengers",
                type: "number" as const,
                value: 9000000,
                unit: "passengers/year",
                unitCategory: "capacity" as const
              },
              {
                key: "operating_hours",
                label: "Operating Hours",
                type: "text" as const,
                value: "24/7"
              },
              {
                key: "cargo_capacity",
                label: "Cargo Capacity",
                type: "nested" as const,
                subVariables: [
                  {
                    key: "cargo_annual",
                    label: "Annual Cargo",
                    type: "number" as const,
                    value: 180000,
                    unit: "tons/year",
                    unitCategory: "capacity" as const
                  },
                  {
                    key: "cargo_area",
                    label: "Cargo Area",
                    type: "number" as const,
                    value: 75000,
                    unit: "sq ft",
                    unitCategory: "area" as const
                  }
                ]
              }
            ]
          },
          {
            title: "Infrastructure",
            icon: "Database",
            color: "orange",
            sortOrder: 3,
            variables: [
              {
                key: "runways",
                label: "Number of Runways",
                type: "number" as const,
                value: 2
              },
              {
                key: "terminals",
                label: "Number of Terminals",
                type: "number" as const,
                value: 5
              },
              {
                key: "gates",
                label: "Total Gates",
                type: "number" as const,
                value: 29
              }
            ]
          }
        ]
      },
      {
        geoLocale: {
          name: "Port of San Juan",
          coordinates: { lat: 18.4655, lng: -66.1057 },
          type: "port",
          region: "San Juan",
          description: "Main commercial port of Puerto Rico",
          isActive: true
        },
        boxes: [
          {
            title: "Port Information",
            icon: "MapPin",
            color: "cyan",
            sortOrder: 1,
            variables: [
              {
                key: "port_code",
                label: "Port Code",
                type: "text" as const,
                value: "PRSJU"
              },
              {
                key: "water_depth",
                label: "Water Depth",
                type: "number" as const,
                value: 36,
                unit: "ft",
                unitCategory: "distance" as const
              },
              {
                key: "total_area",
                label: "Total Area",
                type: "number" as const,
                value: 2431,
                unit: "acres",
                unitCategory: "area" as const
              }
            ]
          },
          {
            title: "Cargo Operations",
            icon: "Monitor",
            color: "green",
            sortOrder: 2,
            variables: [
              {
                key: "annual_cargo",
                label: "Annual Cargo",
                type: "number" as const,
                value: 10500000,
                unit: "tons/year",
                unitCategory: "capacity" as const
              },
              {
                key: "container_capacity",
                label: "Container Handling",
                type: "number" as const,
                value: 1800000,
                unit: "TEU/year",
                unitCategory: "capacity" as const
              },
              {
                key: "berths",
                label: "Number of Berths",
                type: "number" as const,
                value: 15
              }
            ]
          },
          {
            title: "Services",
            icon: "Eye",
            color: "purple",
            sortOrder: 3,
            variables: [
              {
                key: "services",
                label: "Available Services",
                type: "nested" as const,
                subVariables: [
                  {
                    key: "container_service",
                    label: "Container Service",
                    type: "text" as const,
                    value: "Available"
                  },
                  {
                    key: "bulk_cargo",
                    label: "Bulk Cargo",
                    type: "text" as const,
                    value: "Available"
                  },
                  {
                    key: "passenger_service",
                    label: "Passenger Service",
                    type: "text" as const,
                    value: "Available"
                  },
                  {
                    key: "fuel_service",
                    label: "Fuel Service",
                    type: "text" as const,
                    value: "Available"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        geoLocale: {
          name: "Caribbean Logistics Center",
          coordinates: { lat: 18.4092, lng: -66.0614 },
          type: "warehouse",
          region: "Carolina",
          description: "Major logistics and distribution facility",
          isActive: true
        },
        boxes: [
          {
            title: "Facility Details",
            icon: "Database",
            color: "gray",
            sortOrder: 1,
            variables: [
              {
                key: "facility_code",
                label: "Facility Code",
                type: "text" as const,
                value: "CLC-001"
              },
              {
                key: "total_area",
                label: "Total Area",
                type: "number" as const,
                value: 500000,
                unit: "sq ft",
                unitCategory: "area" as const
              },
              {
                key: "storage_capacity",
                label: "Storage Capacity",
                type: "number" as const,
                value: 45000,
                unit: "pallets",
                unitCategory: "capacity" as const
              }
            ]
          },
          {
            title: "Operations",
            icon: "Settings",
            color: "indigo",
            sortOrder: 2,
            variables: [
              {
                key: "operating_hours",
                label: "Operating Hours",
                type: "text" as const,
                value: "Mon-Fri 6AM-10PM"
              },
              {
                key: "temperature_controlled",
                label: "Temperature Controlled",
                type: "number" as const,
                value: 85,
                unit: "%",
                unitCategory: "percentage" as const
              },
              {
                key: "dock_doors",
                label: "Dock Doors",
                type: "number" as const,
                value: 24
              }
            ]
          }
        ]
      }
    ];

    const createdIds = [];

    for (const data of sampleData) {
      const geoLocaleId = await ctx.db.insert("geoLocales", data.geoLocale);

      for (const boxData of data.boxes) {
        const boxId = await ctx.db.insert("facilityBoxes", {
          geoLocaleId,
          title: boxData.title,
          icon: boxData.icon,
          color: boxData.color,
          sortOrder: boxData.sortOrder
        });

        for (const variableData of boxData.variables) {
          const variableId = await ctx.db.insert("facilityVariables", {
            boxId,
            key: variableData.key,
            label: variableData.label,
            type: variableData.type,
            value: "value" in variableData ? variableData.value : undefined,
            unit: "unit" in variableData ? variableData.unit : undefined,
            unitCategory: "unitCategory" in variableData ? variableData.unitCategory : undefined,
            sortOrder: 0
          });

          if ("subVariables" in variableData && variableData.subVariables) {
            for (const subVarData of variableData.subVariables) {
              await ctx.db.insert("facilityVariables", {
                boxId,
                key: subVarData.key,
                label: subVarData.label,
                type: subVarData.type,
                value: subVarData.value,
                unit: "unit" in subVarData ? subVarData.unit : undefined,
                unitCategory: "unitCategory" in subVarData ? subVarData.unitCategory : undefined,
                parentVariableId: variableId,
                sortOrder: 0
              });
            }
          }
        }
      }

      createdIds.push(geoLocaleId);
    }

    return {
      message: `Successfully seeded ${createdIds.length} GeoLocales`,
      geoLocaleIds: createdIds
    };
  }
});

export const clearAllGeoLocales = mutation({
  args: {},
  handler: async (ctx) => {
    const variables = await ctx.db.query("facilityVariables").collect();
    for (const variable of variables) {
      await ctx.db.delete(variable._id);
    }

    const boxes = await ctx.db.query("facilityBoxes").collect();
    for (const box of boxes) {
      await ctx.db.delete(box._id);
    }

    const geoLocales = await ctx.db.query("geoLocales").collect();
    for (const geoLocale of geoLocales) {
      await ctx.db.delete(geoLocale._id);
    }

    return {
      message: "Successfully cleared all GeoLocales data",
      deletedCounts: {
        variables: variables.length,
        boxes: boxes.length,
        geoLocales: geoLocales.length
      }
    };
  }
});