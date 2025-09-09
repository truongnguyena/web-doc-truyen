"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem("prefersReducedMotion") === "1";
      setReduced(val);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("prefersReducedMotion", reduced ? "1" : "0");
      document.documentElement.style.setProperty("scroll-behavior", reduced ? "auto" : "smooth");
    } catch {}
  }, [reduced]);

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-serif text-2xl text-white/90">Cài đặt</h1>

      <section className="mt-6 grid gap-4 max-w-2xl">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white/85 mb-2">Giao diện</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme("dark")} className={`px-3 py-1.5 rounded-full border ${theme === "dark" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}>Tối</button>
            <button onClick={() => setTheme("light")} className={`px-3 py-1.5 rounded-full border ${theme === "light" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}>Sáng</button>
            <button onClick={() => setTheme("system")} className={`px-3 py-1.5 rounded-full border ${!theme || theme === "system" ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}`}>Theo hệ thống</button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white/85 mb-2">Hiệu ứng & chuyển động</div>
          <label className="inline-flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
            Giảm chuyển động (tắt particle/animation mạnh)
          </label>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white/85 mb-2">Ngôn ngữ</div>
          <div className="text-white/70 text-sm">Tiếng Việt (mặc định)</div>
        </div>
      </section>
    </div>
  );
}
