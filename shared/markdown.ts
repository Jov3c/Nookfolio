import { marked, type RendererThis, type TokenizerThis, type Tokens } from 'marked';
import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'span',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
] as const;

const renderer = new marked.Renderer();
renderer.html = ({ raw }) => escapeHtml(raw);

const spoilerExtension = {
  name: 'spoiler',
  level: 'inline' as const,
  start(this: TokenizerThis, source: string) {
    const index = source.indexOf('!!');
    return index === -1 ? undefined : index;
  },
  tokenizer(this: TokenizerThis, source: string): Tokens.Generic | undefined {
    const match = /^!!([\s\S]+?)!!/.exec(source);
    if (!match) return undefined;
    const spoilerText = match[1] ?? '';

    return {
      type: 'spoiler',
      raw: match[0],
      text: spoilerText,
      tokens: this.lexer.inlineTokens(spoilerText),
    };
  },
  renderer(this: RendererThis, token: Tokens.Generic) {
    return `<span class="spoiler" tabindex="0" title="悬停或聚焦查看">${this.parser.parseInline(token.tokens ?? [])}</span>`;
  },
};

marked.use({ extensions: [spoilerExtension] });

export function renderMarkdown(markdown: string) {
  const parsed = marked.parse(markdown, {
    gfm: true,
    breaks: false,
    renderer,
  });

  return sanitizeHtml(String(parsed), {
    allowedTags: [...allowedTags],
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class'],
      img: ['alt', 'height', 'src', 'title', 'width'],
      input: ['checked', 'disabled', 'type'],
      pre: ['class'],
      span: ['class', 'tabindex', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character,
  );
}
