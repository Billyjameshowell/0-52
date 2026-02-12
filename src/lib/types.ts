export type WeeklyPost = {
  id: string;
  handle: string;
  year: number; // e.g. 2026
  week: number; // 1-52
  imageDataUrl: string; // dev/local mode
  caption?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
