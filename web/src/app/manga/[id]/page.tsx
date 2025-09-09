import Link from "next/link";

export default function MangaDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const chapters = Array.from({ length: 10 }).map((_, i) => i + 1);
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-serif text-2xl text-white/90">Truyện {id}</h1>
      <div className="mt-2 text-white/70">Tiêu đề: Tiên Đồ (mô phỏng) · Thể loại: Tu tiên, Huyền huyễn</div>
      <div className="mt-6 grid gap-2">
        {chapters.map((c) => (
          <Link key={c} href={`/manga/${id}/chapter/${c}`} prefetch={false} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/85 hover:bg-white/10">
            Chương {c}
          </Link>
        ))}
      </div>
    </div>
  );
}
