import { NextRequest, NextResponse } from "next/server";

// in-memory store
const g = globalThis as any;
if (!g.__REVIEWS__) g.__REVIEWS__ = [] as any[];
const REVIEWS: any[] = g.__REVIEWS__;

export async function GET() {
  return NextResponse.json({ items: REVIEWS.slice(-50).reverse() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { imageDataUrl, fileName } = body as { imageDataUrl?: string; fileName?: string };
  if (!imageDataUrl) return NextResponse.json({ error: "Thiếu ảnh" }, { status: 400 });
  const item = {
    id: `rv_${Date.now()}`,
    imageDataUrl,
    fileName: fileName ?? "image",
    votes: 0,
    createdAt: Date.now(),
  };
  REVIEWS.push(item);
  return NextResponse.json(item);
}
