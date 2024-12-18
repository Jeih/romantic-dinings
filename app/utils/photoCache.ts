const PHOTO_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export function isPhotoStale (photoUpdated: Date | null): boolean {
  if (!photoUpdated) return true;

  const now = new Date();
  const age = now.getTime() - photoUpdated.getTime();
  return age > PHOTO_TTL;
}