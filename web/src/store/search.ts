import { create } from "zustand";

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

type SearchState = {
  searchQuery: string;
  debouncedQuery: string;
  selectedTags: string[];
  setSearchQuery: (q: string) => void;
  setSelectedTags: (tags: string[]) => void;
};

export const useSearchStore = create<SearchState>((set, get) => {
  const setDebounced = debounce((q: string) => set({ debouncedQuery: q }), 200);
  return {
    searchQuery: "",
    debouncedQuery: "",
    selectedTags: [],
    setSearchQuery: (q) => {
      set({ searchQuery: q });
      setDebounced(q);
    },
    setSelectedTags: (tags) => set({ selectedTags: tags }),
  };
});
