/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_geoLocales_mutations from "../functions/geoLocales/mutations.js";
import type * as functions_geoLocales_queries from "../functions/geoLocales/queries.js";
import type * as functions_geoLocales_seedData from "../functions/geoLocales/seedData.js";
import type * as functions_index from "../functions/index.js";
import type * as functions_logistics_tracking from "../functions/logistics/tracking.js";
import type * as validators from "../validators.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/geoLocales/mutations": typeof functions_geoLocales_mutations;
  "functions/geoLocales/queries": typeof functions_geoLocales_queries;
  "functions/geoLocales/seedData": typeof functions_geoLocales_seedData;
  "functions/index": typeof functions_index;
  "functions/logistics/tracking": typeof functions_logistics_tracking;
  validators: typeof validators;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
