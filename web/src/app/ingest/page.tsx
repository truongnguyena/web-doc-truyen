"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { addToLibrary } from "@/lib/library";

function isValidHttpUrl(s: string) {
  try { const u = new URL(s); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; }
}

export default function IngestPage() {
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [mangaId, setMangaId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<number>(0);
  const jobIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState<string>("");

  // Restore jobId from URL to continue
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const jobId = sp.get("jobId");
    if (jobId) {
      jobIdRef.current = jobId;
      setRunning(true);
    }
  }, []);

  useEffect(() => {
    try { setDomain(url ? new URL(url).hostname : ""); } catch { setDomain(""); }
  }, [url]);

  async function start() {
    if (!isValidHttpUrl(url)) { setError("URL không hợp lệ"); return; }
    setRunning(true);
    setProgress(0);
    setMangaId(null);
    setChapters(0);
    setError(null);

    try {
      const data = await api.post<{ jobId: string; progress: number }>("/ingest/url", { url });
      jobIdRef.current = data.jobId;
      const sp = new URLSearchParams(window.location.search);
      sp.set("jobId", data.jobId);
      history.replaceState(null, "", `?${sp.toString()}`);
    } catch (e: any) {
      setError(e?.data?.error || e?.message || "Lỗi không xác định");
      setRunning(false);
      return;
    }
  }

  function cancel() {
    setRunning(false);
    setProgress(0);
    jobIdRef.current = null;
    const sp = new URLSearchParams(window.location.search);
    sp.delete("jobId");
    history.replaceState(null, "", sp.toString() ? `?${sp.toString()}` : window.location.pathname);
  }

  useEffect(() => {
    if (!running) return;
    let active = true;
    const poll = async () => {
      const jobId = jobIdRef.current;
      if (!jobId) return;
      try {
        const data = await api.get<any>(`/ingest/${jobId}`);
        if (!active) return;
        if (data?.progress != null) setProgress(data.progress);
        if (Array.isArray(data?.chapters)) setChapters(data.chapters.length);
        if (data?.mangaId) setMangaId(data.mangaId);
        if (data?.status === "completed") {
          setRunning(false);
          // Save to library
          addToLibrary({ id: data.mangaId, title: data?.mangaPreview?.title || "Truyện mới", url, tags: data?.mangaPreview?.tags, chapters: (data?.chapters?.length ?? 0), addedAt: Date.now() });
          return;
        }
      } catch {}
      setTimeout(poll, 700);
    };
    poll();
    return () => { active = false; };
  }, [running]);

  const disabled = running || !url.trim();
  const steps = useMemo(() => [
    { label: "Phân tích URL" },
    { label: "Lấy metadata" },
    { label: "Tải danh sách chương" },
    { label: "Tải ảnh" },
    { label: "Chuẩn hóa ảnh" },
  ], []);

  const shareLink = mangaId ? `${location.origin}/manga/${mangaId}` : "";

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-serif text-2xl text-white/90">Nhập link / Parse truyện</h1>
      <div className="mt-2 text-white/60 text-sm">Miền: {domain || "(chưa có)"}</div>
      <div className="mt-4 flex gap-3 max-w-2xl">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Dán URL truyện..."
          className="flex-1 h-11 rounded-lg bg-white/10 text-white/90 placeholder:text-white/50 px-4 outline-none border border-white/10 focus:border-[var(--accent-gold)]/50"
        />
        <button disabled={disabled} onClick={start} className="h-11 px-4 rounded-lg bg-[var(--primary-2)]/80 hover:bg-[var(--primary-2)] text-white/95 disabled:opacity-50">Tải truyện</button>
        {running && <button onClick={cancel} className="h-11 px-4 rounded-lg border border-white/15 text-white/90 hover:bg-white/10">Huỷ</button>}
      </div>

      {error && <div className="mt-3 text-sm text-red-300">{error}</div>}

      <div className="mt-6 grid gap-3 max-w-2xl">
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div className="h-3 rounded-full bg-[var(--primary-1)]" style={{ width: `${progress}%`, transition: "width 300ms ease" }} />
        </div>
        <div className="text-white/70 text-sm">Tiến trình: {progress}%</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {steps.map((s, i) => (
            <div key={i} className={`rounded-lg border px-3 py-2 text-xs ${progress >= ((i + 1) * 20) ? "bg-white/10 border-white/20 text-white/90" : "bg-white/5 border-white/10 text-white/60"}`}>{s.label}</div>
          ))}
        </div>
      </div>

      {mangaId && (
        <div className="mt-8">
          <div className="text-white/85">Đã tải xong: <span className="font-medium">{mangaId}</span></div>
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className="aspect-[3/1] bg-gradient-to-r from-[var(--primary-1)]/30 to-[var(--primary-3)]/20" />
            <div className="p-4">
              <div className="text-white/90">Tiêu đề truyện (mô phỏng)</div>
              <div className="text-white/60 text-sm">Số chương: {chapters}</div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href={`/manga/${mangaId}`} prefetch={false} className="px-3 py-2 rounded-lg border border-white/15 text-white/90 hover:bg-white/10">Mở trang truyện</Link>
                <Link href={`/manga/${mangaId}/chapter/1`} prefetch={false} className="px-3 py-2 rounded-lg bg-[var(--primary-2)]/80 hover:bg-[var(--primary-2)] text-white/95">Đọc chương 1</Link>
                <button onClick={() => { navigator.clipboard.writeText(shareLink); }} className="px-3 py-2 rounded-lg border border-white/15 text-white/90 hover:bg-white/10">Sao chép liên kết</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
