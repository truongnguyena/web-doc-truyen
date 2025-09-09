"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useUserStore } from "@/store/user";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useXpSync } from "@/hooks/useXpSync";

const PATHS = [
  { key: "Thanh Khí", color: "from-[var(--primary-2)] to-[var(--primary-3)]" },
  { key: "Huyết Khí", color: "from-[#B91C1C] to-[#EF4444]" },
  { key: "Kim Nguyên", color: "from-[#F59E0B] to-[#F5D565]" },
] as const;

const ACHIEVEMENTS = [
  { code: "read_first", name: "Khởi Hành", desc: "Đọc 1 trang đầu tiên", xp: 10, cond: (ctx: Ctx) => ctx.xp >= 1 },
  { code: "read_50", name: "Bước Tiến", desc: "Đọc 50 trang", xp: 50, cond: (ctx: Ctx) => ctx.xp >= 50 },
  { code: "bookmark_any", name: "Dấu Ấn", desc: "Đánh dấu 1 trang", xp: 20, cond: (ctx: Ctx) => (ctx.bookmarks?.length ?? 0) >= 1 },
  { code: "note_any", name: "Ghi Chép", desc: "Tạo 1 ghi chú", xp: 20, cond: (ctx: Ctx) => (ctx.notes?.length ?? 0) >= 1 },
] as const;

type Ctx = { xp: number; bookmarks: number[]; notes: { page: number; text: string; at: number }[] };

export default function ProfilePage() {
  useXpSync();
  const { cultivationPath, setCultivationPath, xp } = useUserStore();
  const path = PATHS.find((p) => p.key === cultivationPath) ?? PATHS[0];
  const { bookmarks, notes } = useReadingProgress("reader_demo");

  const ctx = useMemo<Ctx>(() => ({ xp, bookmarks, notes }), [xp, bookmarks, notes]);
  const unlocked = useMemo(() => ACHIEVEMENTS.filter((a) => a.cond(ctx)).map((a) => a.code), [ctx]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const played = useRef<Set<string>>(new Set());
  useEffect(() => {
    unlocked.forEach((code) => {
      if (!played.current.has(code) && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.35;
        audioRef.current.play().catch(() => {});
        played.current.add(code);
      }
    });
  }, [unlocked]);

  const xpNext = 1000;
  const pct = Math.min(100, Math.round((xp / xpNext) * 100));

  return (
    <div className="p-6 md:p-10">
      <audio ref={audioRef} src="/unlock.mp3" preload="auto" />
      <h1 className="font-serif text-2xl text-white/90">Hồ sơ người dùng</h1>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border border-white/10 bg-gradient-to-br from-white/15 to-white/5" />
        <div>
          <div className="text-white/90">Đạo hữu Kurumi</div>
          <div className="mt-2 h-3 w-72 rounded-full bg-white/10 overflow-hidden">
            <div className={`h-3 w-full bg-gradient-to-r ${path.color}`} style={{ width: `${pct}%`, transition: "width 700ms ease" }} />
          </div>
          <div className="text-xs text-white/60 mt-1">{xp} / {xpNext} XP · {pct}%</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-white/80 mb-2">Đường tu luyện</div>
        <div className="flex gap-2">
          {PATHS.map((p) => (
            <button key={p.key} onClick={() => setCultivationPath(p.key)} className={`px-3 py-1.5 rounded-full text-sm border ${p.key === path.key ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}>
              {p.key}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="text-white/80 mb-3">Thành tích</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.includes(a.code);
            return (
              <div key={a.code} className={`relative h-28 rounded-xl border px-3 py-3 ${isUnlocked ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5"}`}>
                {isUnlocked && <div className="badge-shine absolute inset-0 pointer-events-none" />}
                <div className="text-white/90 text-sm font-medium">{a.name}</div>
                <div className="text-white/60 text-xs mt-1">{a.desc}</div>
                <div className="mt-3 inline-block rounded-full px-2 py-1 text-[11px] border border-white/15 text-white/80">+{a.xp} XP</div>
                {!isUnlocked && <div className="absolute bottom-2 right-3 text-[11px] text-white/50">Chưa mở</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
