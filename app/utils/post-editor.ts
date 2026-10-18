export interface PostEditorFormValue {
  title: string;
  slug: string;
  excerpt: string;
  categoryId: string;
  coverMediaId: string;
  markdownBody: string;
  seoTitle: string;
  seoDescription: string;
}

const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createDraftPayload(form: PostEditorFormValue, fallbackSlug: string) {
  return {
    title: form.title.trim() || '未命名文章',
    slug: validSlug.test(form.slug.trim()) ? form.slug.trim() : fallbackSlug,
    excerpt: form.excerpt.trim() || '尚未填写摘要',
    categoryId: form.categoryId,
    coverMediaId: form.coverMediaId || null,
    status: 'DRAFT' as const,
    markdownBody: form.markdownBody,
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
  };
}

export function validatePostForPublish(form: PostEditorFormValue) {
  const errors: string[] = [];
  if (!form.title.trim()) errors.push('请填写文章标题');
  if (!form.slug.trim()) errors.push('请填写路径标识');
  else if (!validSlug.test(form.slug.trim())) errors.push('路径标识只能使用小写字母、数字和连字符');
  if (!form.excerpt.trim()) errors.push('请填写文章摘要');
  if (!form.categoryId) errors.push('请选择文章分类');
  if (!form.markdownBody.trim()) errors.push('请填写文章正文');
  return errors;
}
