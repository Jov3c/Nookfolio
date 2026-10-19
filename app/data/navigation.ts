export interface NavigationItem {
  label: string;
  to: string;
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'Links', to: '/blog/links' },
  { label: 'About', to: '/about' },
];

export const blogNavigation: NavigationItem[] = [
  { label: '博客首页', to: '/blog' },
  { label: '归档', to: '/blog/archive' },
  { label: '留言', to: '/blog/message' },
];
