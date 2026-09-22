/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _scratchCheckInbox from "../_scratchCheckInbox.js";
import type * as claims from "../claims.js";
import type * as crawl from "../crawl.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as inbox from "../inbox.js";
import type * as settlements from "../settlements.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _scratchCheckInbox: typeof _scratchCheckInbox;
  claims: typeof claims;
  crawl: typeof crawl;
  email: typeof email;
  http: typeof http;
  inbox: typeof inbox;
  settlements: typeof settlements;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  firecrawl: import("@firecrawl/firecrawl-convex/_generated/component.js").ComponentApi<"firecrawl">;
  agentmail: import("@agentmail/convex/_generated/component.js").ComponentApi<"agentmail">;
  selfHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"selfHosting">;
};
