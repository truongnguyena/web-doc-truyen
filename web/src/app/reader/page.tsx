"use client";

import PageImage from "@/components/reader/PageImage";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import HeaderBar from "@/components/ui/HeaderBar";
import { useRef, useEffect, useState } from "react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useUserStore } from "@/store/user";
import Link from "next/link";

const PAGES = Array.from({ length: 12 }).map((_, i) => `https://picsum.photos/seed/manga_${i}/1080/1600`);

export default function ReaderPage() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { lastPage, setLastPage, bookmarks, toggleBookmark, notes, addNote } = useReadingProgress("reader_demo");
  const [noteText, setNoteText] = useState("");
  const addXp = useUserStore((s) => s.addXp);
  const [awarded, setAwarded] = useState<Set<number>>(new Set());

  useEffect(() => {
    const el = listRef.current;
    if (!el || !lastPage) return;
    const items = el.querySelectorAll<HTMLImageElement>("img");
    items[lastPage]?.scrollIntoView({ block: "start" });
  }, [lastPage]);

  function getCurrentIndex() {
    const el = listRef.current;
    if (!el) return 0;
    const items = el.querySelectorAll<HTMLImageElement>("img");
    const top = window.scrollY + window.innerHeight * 0.3;
    let targetIdx = 0;
    items.forEach((img, idx) => {
      const rect = img.getBoundingClientRect();
      if (rect.top + window.scrollY < top) targetIdx = idx;
    });
    return targetIdx;
  }

  function scrollToIndex(delta: number) {
    const el = listRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLImageElement>("img");
    const nextIdx = Math.max(0, Math.min(items.length - 1, getCurrentIndex() + delta));
    const nextImg = items[nextIdx];
    nextImg?.scrollIntoView({ behavior: "smooth", block: "start" });
    setLastPage(nextIdx);
  }

  useEffect(() => {
    let t: any;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const idx = getCurrentIndex();
        setLastPage(idx);
        if (!awarded.has(idx)) {
          setAwarded((s) => new Set(s).add(idx));
          addXp(1);
        }
      }, 150);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") scrollToIndex(1);
      if (e.key === "ArrowLeft") scrollToIndex(-1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [awarded]);

  const current = getCurrentIndex();

  return (
    <div className="min-h-dvh">
      <HeaderBar />

      <div className="p-4 md:p-8" ref={listRef}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-white/80 text-sm">
            <button onClick={() => toggleBookmark(current)} className="px-3 py-1.5 rounded-full border border-white/15 hover:bg-white/10">
              {bookmarks.includes(current) ? "Bỏ đánh dấu" : "Đánh dấu trang"}
            </button>
            <form onSubmit={(e) => { e.preventDefault(); if (noteText.trim()) { addNote(current, noteText.trim()); setNoteText(""); } }} className="flex items-center gap-2">
              <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Ghi chú nhanh..." className="h-9 w-56 rounded-lg bg-white/10 border border-white/10 px-3 text-white/90 placeholder:text-white/50" />
              <button type="submit" className="h-9 px-3 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15">Lưu</button>
            </form>
            <div className="ml-auto text-xs text-white/60">Trang hiện tại: {current + 1} / {PAGES.length}</div>
          </div>

          {PAGES.map((src, i) => (
            <div key={i} className="mb-4">
              <PageImage src={src} nextSrc={PAGES[i + 1]} alt={`Trang ${i + 1}`} index={i} />
            </div>
          ))}

          <div className="mt-6 flex items-center justify-between text-white/80 text-sm">
            <Link href="/manga/mg_demo/chapter/1" prefetch={false} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10">« Chương trước</Link>
            <Link href="/manga/mg_demo" prefetch={false} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10">Mục lục chương</Link>
            <Link href="/manga/mg_demo/chapter/2" prefetch={false} className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10">Chương sau »</Link>
          </div>

          {notes.length > 0 && (
            <div className="mt-6">
              <div className="text-white/80 mb-2">Ghi chú</div>
              <div className="grid gap-2">
                {notes.map((n, i) => (
                  <div key={i} className="text-white/80 text-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-white/60 mr-2">[Trang {n.page + 1}]</span>
                    {n.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ReaderToolbar onPrev={() => scrollToIndex(-1)} onNext={() => scrollToIndex(1)} />
    </div>
  );
}
