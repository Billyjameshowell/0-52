export type WeeklyPost = {
  id: string;
  handle: string;
  year: number; // e.g. 2026
  week: number; // 1-52
  imageUrl?: string; // Tigris URL (production)
  imageDataUrl?: string; // base64 data URL (localStorage fallback)
  caption?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// Helper to get the displayable image source
export function getImageSrc(post: WeeklyPost): string | undefined {
  return post.imageUrl || post.imageDataUrl;
}
