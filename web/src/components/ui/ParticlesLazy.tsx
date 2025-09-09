"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function ParticlesLazy() {
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const cb = () => setReady(true);
    // Prefer idle callback; fallback to timeout
    const id = (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback(cb, { timeout: 800 })
      : setTimeout(cb, 300);
    return () => {
      if ((window as any).cancelIdleCallback) (window as any).cancelIdleCallback(id);
      clearTimeout(id as any);
    };
  }, [reduced]);

  if (reduced || !ready) return null;

  return (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <div className="particle" style={{ left: "12%", top: "20%" }} />
      <div className="particle" style={{ left: "32%", top: "60%", animationDelay: "1s" }} />
      <div className="particle" style={{ left: "72%", top: "30%", animationDelay: "2s" }} />
      <div className="particle" style={{ left: "85%", top: "70%", animationDelay: "3s" }} />
    </div>
  );
}
