export interface AdminNavigationItem {
  label: string;
  to: string;
}

export interface AdminNavigationGroup {
  key: 'overview' | 'content' | 'profile' | 'community' | 'media';
  label: string;
  to: string;
  items: AdminNavigationItem[];
}

interface IndicatorRect {
  left: number;
  top: number;
  width?: number;
  height?: number;
}

export const adminNavigation: AdminNavigationGroup[] = [
  { key: 'overview', label: '概览', to: '/admin', items: [{ label: '概览', to: '/admin' }] },
  {
    key: 'content', label: '内容', to: '/admin/write', items: [
      { label: '发布文章', to: '/admin/write' }, { label: '草稿箱', to: '/admin/write/drafts' },
      { label: '文章管理', to: '/admin/posts' }, { label: '分类管理', to: '/admin/categories' },
      { label: '项目管理', to: '/admin/projects' }, { label: '时间线', to: '/admin/timeline' },
    ],
  },
  {
    key: 'profile', label: '资料', to: '/admin/home', items: [
      { label: '首页资料', to: '/admin/home' }, { label: '个人简历', to: '/admin/cv' },
      { label: 'About 页面', to: '/admin/about' },
    ],
  },
  {
    key: 'community', label: '互动', to: '/admin/comments', items: [
      { label: '评论管理', to: '/admin/comments' }, { label: '留言管理', to: '/admin/messages' },
      { label: '友链管理', to: '/admin/links' },
    ],
  },
  { key: 'media', label: '媒体库', to: '/admin/media', items: [{ label: '媒体库', to: '/admin/media' }] },
];

export function isAdminRouteActive(path: string, to: string) {
  return path === to || (to !== '/admin' && path.startsWith(`${to}/`));
}

export function getAdminNavigationState(path: string) {
  const matches = adminNavigation.flatMap((group) =>
    group.items.map((item) => ({ group, item })).filter(({ item }) => isAdminRouteActive(path, item.to)),
  );
  const match = matches.sort((a, b) => b.item.to.length - a.item.to.length)[0] ?? {
    group: adminNavigation[0]!, item: adminNavigation[0]!.items[0]!,
  };
  return { activeGroup: match.group, activeItem: match.item, secondaryItems: match.group.items };
}

export function getAdminNavIndicatorGeometry(target: Required<IndicatorRect>, container: IndicatorRect) {
  return { x: target.left - container.left, y: target.top - container.top, width: target.width, height: target.height };
}
