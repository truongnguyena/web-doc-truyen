"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/user";

export function useXpSync() {
  const xp = useUserStore((s) => s.xp);
  const lastSent = useRef(0);

  useEffect(() => {
    const send = async () => {
      const delta = xp - lastSent.current;
      if (delta <= 0) return;
      try {
        await api.post("/user/xp", { delta });
        lastSent.current = xp;
      } catch {}
    };

    const id = setInterval(send, 2000);
    const onHide = () => { if (document.visibilityState === "hidden") send(); };
    document.addEventListener("visibilitychange", onHide);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onHide); };
  }, [xp]);
}
