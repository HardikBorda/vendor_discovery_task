/**
 * Barrel re-export for the database service.
 * All route files import from "@/lib/db" — this file forwards to the actual implementation.
 */
export {
  initDb,
  saveShortlist,
  getShortlists,
  getShortlistById,
  checkDbHealth,
  getDbMetadata,
} from "./services/db";

export type { ShortlistRow } from "./services/db";
