import Link from "next/link";

export default function ChapterPage({ params }: { params: { id: string; index: string } }) {
  const { id, index } = params;
  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-white/90">Truyện {id} · Chương {index}</h1>
        <Link href="/reader" prefetch={false} className="px-3 py-2 rounded-lg bg-[var(--primary-2)]/80 hover:bg-[var(--primary-2)] text-white/95">Đọc ngay</Link>
      </div>
      <div className="mt-4 text-white/70">Nội dung chương sẽ hiển thị tại đây (mô phỏng).</div>
    </div>
  );
}
