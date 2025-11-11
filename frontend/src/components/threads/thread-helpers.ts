export const THREADS_PER_PAGE = 10;

export const statusStyles: Record<string, string> = {
  open: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  locked:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/50 dark:bg-amber-500/10 dark:text-amber-300",
  archived:
    "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600/60 dark:bg-slate-800/60 dark:text-slate-300",
};

const PREVIEW_CHAR_LIMIT = 280;

export function buildPreview(text?: string | null) {
  if (!text) {
    return "";
  }
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized.length) {
    return "";
  }
  if (normalized.length <= PREVIEW_CHAR_LIMIT) {
    return normalized;
  }
  return `${normalized.slice(0, PREVIEW_CHAR_LIMIT).trimEnd()}…`;
}

