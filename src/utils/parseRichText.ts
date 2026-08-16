/**
 * Parser leve para o HTML da descrição do evento — cobre só a allowlist gerada pelo
 * sanitizador do backend (`sanitizeRichText`, espelhando o editor Tiptap do b2b):
 * p, br, strong, em, u, s, span, ul, ol, li, h2, h3, com `style` (color/font-size)
 * só em span/p/li. Como o HTML já chega bem-formado e sanitizado do servidor, um
 * parser baseado em regex é suficiente — não precisa de um parser HTML5 completo.
 */

export type RichNode =
  | { type: "text"; value: string }
  | { type: "element"; tag: string; style?: { color?: string; fontSize?: number }; children: RichNode[] };

type RichElement = Extract<RichNode, { type: "element" }>;

const VOID_TAGS = new Set(["br"]);

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&");
}

function parseStyleAttr(styleAttr: string): RichElement["style"] {
  const result: NonNullable<RichElement["style"]> = {};

  for (const decl of styleAttr.split(";")) {
    const [rawProp, rawValue] = decl.split(":");
    if (!rawProp || !rawValue) continue;

    const prop = rawProp.trim().toLowerCase();
    const value = rawValue.trim();

    if (prop === "color") {
      result.color = value;
    } else if (prop === "font-size") {
      const match = value.match(/^(\d+(?:\.\d+)?)px$/);
      if (match) result.fontSize = Number(match[1]);
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function parseRichText(html: string): RichNode[] {
  const root: RichElement = { type: "element", tag: "root", children: [] };
  const stack: RichElement[] = [root];
  const tagRegex = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const appendText = (raw: string) => {
    const decoded = decodeEntities(raw);
    if (!decoded) return;
    stack[stack.length - 1].children.push({ type: "text", value: decoded });
  };

  while ((match = tagRegex.exec(html)) !== null) {
    const [full, closing, tagNameRaw, attrs] = match;
    const tagName = tagNameRaw.toLowerCase();

    if (match.index > lastIndex) {
      appendText(html.slice(lastIndex, match.index));
    }
    lastIndex = match.index + full.length;

    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tagName) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const styleMatch = attrs.match(/style\s*=\s*"([^"]*)"/i);
    const node: RichElement = {
      type: "element",
      tag: tagName,
      style: styleMatch ? parseStyleAttr(styleMatch[1]) : undefined,
      children: [],
    };
    stack[stack.length - 1].children.push(node);

    const selfClosing = VOID_TAGS.has(tagName) || attrs.trim().endsWith("/");
    if (!selfClosing) {
      stack.push(node);
    }
  }

  if (lastIndex < html.length) {
    appendText(html.slice(lastIndex));
  }

  return root.children;
}
