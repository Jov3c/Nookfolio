export function appendUniquePosts<T extends { id: string }>(current: T[], incoming: T[]) {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !seen.has(item.id))];
}

export function createHeadingId(text: string, used: Set<string>) {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\p{Letter}\p{Number}-]/gu, '') || 'section';
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  used.add(candidate);
  return candidate;
}

export function getReadingProgress(
  scrollY: number,
  articleTop: number,
  articleHeight: number,
  viewportHeight: number,
) {
  const readableDistance = Math.max(articleHeight - viewportHeight, 1);
  return Math.min(1, Math.max(0, (scrollY - articleTop) / readableDistance));
}
