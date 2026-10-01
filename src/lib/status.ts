export const entryStatuses = ["draft", "unlisted", "published"] as const;
export type EntryStatus = (typeof entryStatuses)[number];

export const isListed = (status: EntryStatus, dev: boolean): boolean =>
  dev || status === "published";

export const isRoutable = (status: EntryStatus, dev: boolean): boolean =>
  dev || status !== "draft";
