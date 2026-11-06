export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export function coverRect(width: number, height: number, sourceWidth = 1920, sourceHeight = 1080, subjectFit = false) {
  const scale = (subjectFit ? width * .92 / (sourceWidth * .44) : Math.max(width / sourceWidth, height / sourceHeight)) * 1.015;
  const w = sourceWidth * scale, h = sourceHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}
export function sequenceIndex(progress: number, count: number, crown = false) {
  return (count - 1) * clamp(crown ? (progress - .06) / .86 : progress);
}
export function envelope(distanceInViewports: number) {
  const t = clamp((Math.abs(distanceInViewports) - .28) / .18);
  return 1 - t * t * (3 - 2 * t);
}
export function progressiveOrder(count: number) {
  const seen = new Set<number>([0, count - 1]);
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += step) seen.add(i);
  return [...seen];
}
