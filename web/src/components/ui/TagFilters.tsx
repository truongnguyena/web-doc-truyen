"use client";

import { useSearchStore } from "@/store/search";

const TAGS = ["Tu tiên", "Kiếm hiệp", "Huyền huyễn", "Hài hước", "Phiêu lưu"];

export default function TagFilters() {
  const { selectedTags, setSelectedTags } = useSearchStore();

  function toggle(tag: string) {
    const set = new Set(selectedTags);
    if (set.has(tag)) set.delete(tag); else set.add(tag);
    setSelectedTags(Array.from(set));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((t) => {
        const active = selectedTags.includes(t);
        return (
          <button
            key={t}
            onClick={() => toggle(t)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              active
                ? "text-white border-white/20 bg-white/10"
                : "text-white/80 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
