export type IngestUrlRequest = {
  url: string;
};

export type IngestJob = {
  jobId: string;
  mangaId?: string;
  status: "queued" | "processing" | "normalizing" | "completed" | "failed";
  progress: number; // 0..100
  error?: string;
};

export type IngestUrlResponse = IngestJob;

export type IngestProgressResponse = IngestJob & {
  mangaPreview?: Manga;
  chapters?: ChapterSummary[];
};

export type Manga = {
  id: string;
  title: string;
  altTitles?: string[];
  author?: string;
  tags?: string[];
  description?: string;
  coverUrl?: string;
  lang?: string;
  status?: "ongoing" | "completed" | "hiatus";
  sourceUrl?: string;
  sourceDomain?: string;
};

export type ChapterSummary = {
  id: string;
  mangaId: string;
  index: number;
  title?: string;
  pagesCount?: number;
  lang?: string;
  status?: "ready" | "processing";
};

export type ChapterPage = {
  index: number;
  imageUrl: string;
  width?: number;
  height?: number;
  ocrText?: string;
};

export type ChapterDetail = {
  id: string;
  mangaId: string;
  index: number;
  title?: string;
  pages: ChapterPage[];
};

// REST endpoints proposal
// POST /api/ingest/url -> IngestUrlResponse
// GET  /api/ingest/{jobId} -> IngestProgressResponse
// GET  /api/manga/{id} -> Manga
// GET  /api/manga/{id}/chapters -> ChapterSummary[]
// GET  /api/chapter/{id} -> ChapterDetail
