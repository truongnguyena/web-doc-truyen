"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Menu, X } from "lucide-react";
import { useSearchStore } from "@/store/search";

export default function HeaderBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearchStore();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/reader", label: "Trình đọc" },
    { href: "/ingest", label: "Nhập link" },
    { href: "/library", label: "Thư viện" },
    { href: "/reviews", label: "Đánh giá" },
    { href: "/profile", label: "Hồ sơ" },
    { href: "/settings", label: "Cài đặt" },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === href : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center gap-3 bg-[rgba(10,10,10,0.65)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(10,10,10,0.45)] border-b border-white/10">
        <button aria-label="Mở trình đơn" className="md:hidden h-10 w-10 grid place-items-center rounded-full bg-white/10 border border-white/10" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5 text-white/85" />
        </button>
        <Link href="/" prefetch={false} className="font-serif text-lg text-white/90 tracking-wide">KurumiTruyen+</Link>
        <nav className="ml-4 hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                isActive(item.href)
                  ? "text-white border-white/20 bg-white/10"
                  : "text-white/80 border-transparent hover:text-white hover:border-white/15"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="relative w-full max-w-md hidden sm:block">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm truyện, tác giả, tag..."
            className="w-full h-10 rounded-full bg-white/10 text-white/90 placeholder:text-white/50 pl-10 pr-4 outline-none border border-white/10 focus:border-[var(--accent-gold)]/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        </div>
        <button className="ml-3 h-10 w-10 grid place-items-center rounded-full bg-white/10 border border-white/10 hover:border-[var(--accent-gold)]/40 transition-colors">
          <Bell className="h-5 w-5 text-white/80" />
        </button>
        <Link href="/profile" prefetch={false} className="ml-2 h-10 w-10 rounded-full border border-white/10 bg-gradient-to-br from-white/15 to-white/5" />
      </div>

      {open && (
        <div className="fixed inset-0 z-40">
          <button aria-label="Đóng trình đơn" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-[rgba(10,10,10,0.8)] backdrop-blur-md border-l border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="font-serif text-white/90">Trình đơn</div>
              <button className="h-9 w-9 grid place-items-center rounded-full bg-white/10 border border-white/10" onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-white/85" />
              </button>
            </div>
            <div className="mt-4">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm truyện..."
                  className="w-full h-10 rounded-full bg-white/10 text-white/90 placeholder:text-white/50 pl-10 pr-4 outline-none border border-white/10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              </div>
              <nav className="mt-4 grid gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      isActive(item.href)
                        ? "text-white border-white/20 bg-white/10"
                        : "text-white/80 border-white/10 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
