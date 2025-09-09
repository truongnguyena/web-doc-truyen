"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ReviewsPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await api.get<{ items: any[] }>("/reviews");
        if (active) setItems(data.items ?? []);
      } catch {}
    };
    const id = setTimeout(load, 100); // defer to idle
    return () => { active = false; clearTimeout(id); };
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const f = files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result as string;
      await api.post("/reviews", { imageDataUrl, fileName: f.name });
      const data = await api.get<{ items: any[] }>("/reviews");
      setItems(data.items ?? []);
    };
    reader.readAsDataURL(f);
  }

  async function vote(id: string, delta: number) {
    await api.post("/reviews/vote", { id, delta });
    const data = await api.get<{ items: any[] }>("/reviews");
    setItems(data.items ?? []);
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-serif text-2xl text-white/90">Đánh giá & Hình ảnh</h1>

      <div className="mt-4">
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 cursor-pointer">
          <input type="file" accept="image/*" multiple={false} className="hidden" onChange={onPick} />
          Tải ảnh lên
        </label>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div key={it.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img src={it.imageDataUrl} alt={it.fileName} className="w-full h-auto" />
            <div className="p-4 flex items-center justify-between">
              <div className="text-white/90 text-sm">{it.fileName}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => vote(it.id, 1)} className="px-2 py-1 rounded-md bg-white/10 text-white/90 hover:bg-white/15">+1</button>
                <div className="text-white/80 text-sm">{it.votes ?? 0}</div>
                <button onClick={() => vote(it.id, -1)} className="px-2 py-1 rounded-md bg-white/10 text-white/90 hover:bg-white/15">-1</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
