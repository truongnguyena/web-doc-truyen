type Manga = {
  id: string;
  title: string;
  tags?: string[];
  rating?: number;
  coverUrl?: string;
};

export default function MangaCard({ manga }: { manga: Manga }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="aspect-[3/4] bg-gradient-to-br from-[var(--primary-1)]/30 to-[var(--primary-3)]/20" />
      <div className="absolute inset-0 ring-0 group-hover:ring-2 ring-[var(--accent-gold)]/40 transition-all duration-300" />
      <div className="p-3">
        <div className="text-sm text-white/90 line-clamp-1">{manga.title}</div>
        <div className="text-xs text-white/60">{manga.tags?.slice(0,2).join(" · ") || "Tu tiên"} · {manga.rating ?? 4.8} ★</div>
      </div>
    </div>
  );
}
