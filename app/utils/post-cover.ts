export function createDefaultPostCoverLabel(categoryName: string) {
  const characters = Array.from(categoryName.trim().replace(/\s+/g, ''));
  if (characters.length >= 2) return characters.slice(0, 2).join('');
  if (characters.length === 1) return `${characters[0]}录`;
  return '文章';
}
