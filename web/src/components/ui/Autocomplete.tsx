"use client";

import { useMemo } from "react";
import { useSearchStore } from "@/store/search";

type AutocompleteProps = {
  corpus: string[];
  onPick?: (val: string) => void;
};

export default function Autocomplete({ corpus, onPick }: AutocompleteProps) {
  const { searchQuery, setSearchQuery } = useSearchStore();

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    const uniq = Array.from(new Set(corpus));
    return uniq.filter((x) => x.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, corpus]);

  if (!suggestions.length) return null;

  return (
    <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-white/10 backdrop-blur-md">
      {suggestions.map((s) => (
        <button
          key={s}
          className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
          onClick={() => {
            setSearchQuery(s);
            onPick?.(s);
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
