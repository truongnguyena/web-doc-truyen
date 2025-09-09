"use client";

import { useEffect, useRef, useState } from "react";

export default function PageImage({
  src,
  alt,
  nextSrc,
  index,
}: {
  src: string;
  alt: string;
  nextSrc?: string;
  index: number;
}) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(index < 2);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Preload next image
  useEffect(() => {
    if (!nextSrc) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = nextSrc;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [nextSrc]);

  return (
    <img
      ref={ref}
      src={visible ? src : undefined}
      data-src={src}
      alt={alt}
      className="w-full h-auto rounded-lg select-none"
      loading={index < 2 ? "eager" : "lazy"}
      draggable={false}
    />
  );
}
