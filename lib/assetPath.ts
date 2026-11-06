const basePath = process.env.NODE_ENV === 'production' ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '') : '';

/** Public assets need the same build-time prefix as the Next.js application. */
export function asset(path: string): string {
  return `${basePath}${path}`;
}
