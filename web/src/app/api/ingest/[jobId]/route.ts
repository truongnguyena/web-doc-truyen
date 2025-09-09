import { NextRequest, NextResponse } from "next/server";

// Reuse the same jobs map by attaching to globalThis
const g = globalThis as any;
if (!g.__INGEST_JOBS__) g.__INGEST_JOBS__ = new Map<string, any>();
const jobs: Map<string, any> = g.__INGEST_JOBS__;

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  const job = jobs.get(jobId);
  if (!job) return NextResponse.json({ error: "Không tìm thấy job" }, { status: 404 });

  const resp: any = { ...job };
  if (job.progress >= 40) {
    resp.mangaPreview = {
      id: job.mangaId ?? "mg_preview",
      title: "Tiêu đề truyện mô phỏng",
      tags: ["Tu tiên", "Huyền huyễn"],
      description: "Mô tả ngắn về truyện...",
      coverUrl: "https://picsum.photos/seed/cover/640/360",
    };
    resp.chapters = Array.from({ length: 10 }).map((_, i) => ({
      id: `ch_${i + 1}`,
      mangaId: resp.mangaPreview.id,
      index: i + 1,
      title: `Chương ${i + 1}`,
      pagesCount: 20 + (i % 4) * 2,
      status: i < 2 ? "ready" : "processing",
    }));
  }
  return NextResponse.json(resp);
}
