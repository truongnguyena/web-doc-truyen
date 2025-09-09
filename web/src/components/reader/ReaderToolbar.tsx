"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function ReaderToolbar({ onPrev, onNext }: { onPrev?: () => void; onNext?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: any;
    const show = () => {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 1800);
    };
    const onMove = () => show();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove, { passive: true });
    show();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-opacity ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 backdrop-blur-md px-2 py-1">
        <button onClick={onPrev} className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10">
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button className="h-9 px-3 rounded-full text-sm text-white/90 hover:bg-white/10">Trang dọc</button>
        <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10">
          <Maximize2 className="h-5 w-5 text-white" />
        </button>
        <button onClick={onNext} className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10">
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
