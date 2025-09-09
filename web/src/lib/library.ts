export type LibraryItem = {
  id: string;
  title: string;
  url?: string;
  tags?: string[];
  chapters?: number;
  addedAt: number;
};

const KEY = "kurumi_library";

export function loadLibrary(): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as LibraryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveLibrary(items: LibraryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

export function addToLibrary(item: LibraryItem) {
  const cur = loadLibrary();
  const exists = cur.find((x) => x.id === item.id);
  const next = exists ? cur.map((x) => (x.id === item.id ? { ...x, ...item } : x)) : [item, ...cur];
  saveLibrary(next);
}
