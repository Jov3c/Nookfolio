export function shouldShowBackToTop(scrollY: number, scrollHeight: number, viewportHeight: number) {
  return scrollHeight > viewportHeight + 1 && scrollY > 320;
}
