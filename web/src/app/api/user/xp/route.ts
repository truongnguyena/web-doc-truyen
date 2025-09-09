import { NextRequest, NextResponse } from "next/server";

const g = globalThis as any;
if (!g.__USER_XP__) g.__USER_XP__ = 0;

export async function GET() {
  return NextResponse.json({ xp: (globalThis as any).__USER_XP__ as number });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const delta = Number(body?.delta ?? 0);
  const cur = ((globalThis as any).__USER_XP__ as number) ?? 0;
  (globalThis as any).__USER_XP__ = Math.max(0, cur + (Number.isFinite(delta) ? Math.floor(delta) : 0));
  return NextResponse.json({ xp: (globalThis as any).__USER_XP__ as number });
}
