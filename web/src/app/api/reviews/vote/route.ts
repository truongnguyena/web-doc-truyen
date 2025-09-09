import { NextRequest, NextResponse } from "next/server";

const g = globalThis as any;
if (!g.__REVIEWS__) g.__REVIEWS__ = [] as any[];
const REVIEWS: any[] = g.__REVIEWS__;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, delta } = body as { id?: string; delta?: number };
  const item = REVIEWS.find((x) => x.id === id);
  if (!item) return NextResponse.json({ error: "Không tìm thấy review" }, { status: 404 });
  item.votes = (item.votes ?? 0) + (typeof delta === "number" ? delta : 0);
  return NextResponse.json({ id: item.id, votes: item.votes });
}
