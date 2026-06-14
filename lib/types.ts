// Core data model for Nibble feed logs.

export type FeedType = "breast" | "pumped" | "formula" | "wet_diaper" | "soiled_diaper";

export interface Feed {
  id: string;
  /** ISO 8601 timestamp of when the feed started. */
  startedAt: string;
  type: FeedType;
  /** Amount in ounces (formula/pumped). Optional for breast. */
  amountOz?: number;
  /** Duration in minutes (breast/solids). */
  durationMin?: number;
  /** Left / right / both — for breastfeeding. */
  side?: "left" | "right" | "both";
  notes?: string;
}

export type NewFeed = Omit<Feed, "id">;
