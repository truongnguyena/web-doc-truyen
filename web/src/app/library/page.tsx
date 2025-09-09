"use client";

import { useEffect, useState } from "react";
import { LibraryItem, loadLibrary } from "@/lib/library";
import Link from "next/link";

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  useEffect(() => { setItems(loadLibrary()); }, []);

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-serif text-2xl text-white/90">Thư viện</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white/90">{it.title}</div>
            <div className="text-white/60 text-xs">Chương: {it.chapters ?? 0}</div>
            <div className="mt-3 flex gap-2">
              <Link href={`/manga/${it.id}`} prefetch={false} className="px-3 py-2 rounded-lg border border-white/15 text-white/90 hover:bg-white/10">Mở truyện</Link>
              <Link href={`/manga/${it.id}/chapter/1`} prefetch={false} className="px-3 py-2 rounded-lg bg-[var(--primary-2)]/80 hover:bg-[var(--primary-2)] text-white/95">Đọc chương 1</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
