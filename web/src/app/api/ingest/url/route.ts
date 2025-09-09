import { NextRequest, NextResponse } from "next/server";

let counter = 0;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = body?.url as string | undefined;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Thiếu URL hợp lệ" }, { status: 400 });
  }
  const jobId = `job_${Date.now()}_${++counter}`;
  jobs.set(jobId, { jobId, status: "queued", progress: 0 });
  // Bắt đầu mô phỏng tiến trình async (tăng dần %)
  tickJob(jobId);
  return NextResponse.json({ jobId, status: "queued", progress: 0 });
}

// In-memory jobs
const jobs = new Map<string, { jobId: string; mangaId?: string; status: string; progress: number; error?: string }>();

function tickJob(jobId: string) {
  const timer = setInterval(() => {
    const job = jobs.get(jobId);
    if (!job) return clearInterval(timer);
    if (job.progress >= 100) return clearInterval(timer);
    job.progress = Math.min(100, job.progress + Math.ceil(Math.random() * 22));
    job.status = job.progress >= 100 ? "completed" : "processing";
    if (job.status === "completed") {
      job.mangaId = `mg_${Math.random().toString(36).slice(2, 8)}`;
    }
  }, 600);
}
