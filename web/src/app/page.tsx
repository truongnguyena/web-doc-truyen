"use client";

import HeaderBar from "@/components/ui/HeaderBar";
import MangaCard from "@/components/manga/MangaCard";
import TagFilters from "@/components/ui/TagFilters";
import Autocomplete from "@/components/ui/Autocomplete";
import ParticlesLazy from "@/components/ui/ParticlesLazy";
import { useSearchStore } from "@/store/search";
import { useUserStore } from "@/store/user";

const MOCK = Array.from({ length: 20 }).map((_, i) => ({
  id: `m_${i+1}`,
  title: `Bộ truyện ${i+1}`,
  tags: ["Tu tiên", i % 3 === 0 ? "Kiếm hiệp" : i % 3 === 1 ? "Huyền huyễn" : "Phiêu lưu"],
  rating: 3.8 + (i % 5) * 0.3,
}));

function highlight(text: string, q: string) {
  const query = q.trim();
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  const before = text.slice(0, i);
  const match = text.slice(i, i + query.length);
  const after = text.slice(i + query.length);
  return (
    <>
      {before}
      <span className="bg-[var(--accent-gold)]/25 text-white px-0.5 rounded">{match}</span>
      {after}
    </>
  ) as any;
}

function scoreByPath(tags: string[] | undefined, rating: number, path: string) {
  let s = rating; // base: rating
  if (!tags?.length) return s;
  if (path === "Thanh Khí" && tags.includes("Tu tiên")) s += 0.6;
  if (path === "Huyết Khí" && tags.includes("Huyền huyễn")) s += 0.6;
  if (path === "Kim Nguyên" && tags.includes("Kiếm hiệp")) s += 0.6;
  return s;
}

export default function Home() {
  const { debouncedQuery, selectedTags } = useSearchStore();
  const { cultivationPath } = useUserStore();

  const corpus = [
    ...MOCK.map((m) => m.title),
    ...Array.from(new Set(MOCK.flatMap((m) => m.tags ?? []))),
  ];

  const filtered = MOCK.filter((m) => {
    const q = debouncedQuery.trim().toLowerCase();
    const matchQ = !q || m.title.toLowerCase().includes(q) || m.tags?.some((t) => t.toLowerCase().includes(q));
    const matchTags = !selectedTags.length || selectedTags.every((t) => m.tags?.includes(t));
    return matchQ && matchTags;
  })
    .map((m) => ({ ...m, _score: scoreByPath(m.tags, m.rating, cultivationPath) }))
    .sort((a, b) => b._score - a._score);

  return (
    <div className="min-h-dvh">
      <HeaderBar />

      <div className="p-6 md:p-10">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 glow-card p-8 md:p-12">
          <ParticlesLazy />
          <div className="relative">
            <h1 className="font-serif text-3xl md:text-5xl tracking-wide text-white/95">KurumiTruyen+</h1>
            <p className="mt-3 md:mt-4 max-w-2xl text-white/70">Ứng dụng web đọc truyện tranh phong cách tu tiên: cá nhân hóa, cấp độ, glow & particles.</p>
            <div className="mt-6 h-3 rounded-full bg-white/10">
              <div className="xp-gradient h-3 rounded-full w-2/3" />
            </div>
            <div className="mt-2 text-xs text-white/70">Đường tu luyện: {cultivationPath}</div>
          </div>
        </section>

        <section className="mt-8">
          <TagFilters />
        </section>

        <section className="relative mt-2 max-w-md">
          <Autocomplete corpus={corpus} />
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-white/90">Gợi ý theo cấp độ và sở thích</h2>
            <div className="text-white/70 text-sm">{filtered.length} kết quả</div>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {filtered.map((m) => (
              <div key={m.id}>
                <MangaCard manga={m} />
                <div className="mt-1 text-xs text-white/70">{highlight(m.title, debouncedQuery)}</div>
              </div>
            ))}
          </div>
        </section>
        </div>
    </div>
  );
}
