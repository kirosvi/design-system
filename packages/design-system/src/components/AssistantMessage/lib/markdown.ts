import { Lexer, type MarkedToken, type Token } from 'marked';
import remend from 'remend';

// The only file that imports the engine. No marked extensions are registered, so marked never emits its
// `Tokens.Generic` (an `any` index signature): every token is a `MarkedToken`.
export const asTokens = (tokens: Token[] | undefined): MarkedToken[] =>
  (tokens ?? []) as MarkedToken[];

/** Fresh options per call: marked's defaults are global (an app's `marked.use()` would leak in) and the lexer
 *  writes a tokenizer onto the options object it gets. */
const lexBlocks = (src: string): MarkedToken[] =>
  asTokens(Lexer.lex(src, { gfm: true })).filter(t => t.type !== 'space' && t.type !== 'def');

// ponytail: heuristic. Hides a marker run the tail can't close yet (`**`, `` ` ``, `~~`, `#`, `-`, `>`, `1.`) for
// the frame or two until the next token; remend can't close an empty span. A task box (`- [`, `- [x]`) waits
// for its text with its bullet. Extend the class when the prefix-flash test finds a new flash.
const DANGLING = /(^|\s)(?:(?:[*+-]|\d+[.)])\s+\[[ xX]?\]?|[*_~`#>+-]+|\d+[.)])\s*$/;
/** A fence run on its own line opens or closes a code block: keep it (a fence with no code yet is held back). */
const FENCE_LINE = /(^|\n) {0,3}(?:`{3,}|~{3,})\s*$/;
// italic: false — an unpaired `*` (a glob like `*.example.com` in prose) would italicize the rest of the block.
const REMEND = { linkMode: 'text-only', katex: false, htmlTags: false, italic: false } as const;

/** A table header that marked still lexes as a paragraph (no full delimiter row yet), down to its first `| I`. */
const isHalfTable = (t: MarkedToken): boolean =>
  t.type === 'paragraph' &&
  /^ {0,3}\|/.test(t.raw) &&
  t.raw
    .split('\n')
    .slice(1)
    .every(line => /^[\s|:-]*$/.test(line));

/**
 * The top-level blocks of untrusted GFM. While `streaming`, only the last block can be unfinished, so only it is
 * repaired (remend counts markers across its whole input: run on the full text, one stray `*` in a finished
 * block leaks a closer into every later frame), and a tail that would flash — a half-typed table header, a fence
 * with no code yet — is held back.
 */
export const lexMarkdown = (text: string, streaming: boolean): MarkedToken[] => {
  if (!streaming) return lexBlocks(text);
  const blocks = lexBlocks(FENCE_LINE.test(text) ? text : text.replace(DANGLING, '$1'));
  const tail = blocks.pop();
  if (tail) {
    blocks.push(
      ...(tail.type === 'code' || tail.type === 'html'
        ? [tail]
        : lexBlocks(remend(tail.raw, REMEND))),
    );
  }
  const last = blocks[blocks.length - 1];
  if (last && (isHalfTable(last) || (last.type === 'code' && !last.text))) blocks.pop();
  return blocks;
};

/** The closing fence has arrived (indented code has none and is always closed). */
export const isClosedFence = (raw: string): boolean => {
  const open = /^ {0,3}(`{3,}|~{3,})/.exec(raw)?.[1];
  if (!open) return true;
  const lines = raw.trimEnd().split('\n');
  const close =
    lines.length > 1
      ? /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(lines[lines.length - 1] ?? '')?.[1]
      : undefined;
  return !!close && close[0] === open[0] && close.length >= open.length;
};

const BASE = 'https://base.invalid';
/**
 * http(s), mailto and relative URLs pass; javascript:, data:, vbscript:, file:, blob: and anything unparsable
 * don't. The WHATWG parser is the browser's own, so case, whitespace and control-character tricks resolve the
 * same way here. Never entity-decode an href: React writes attributes verbatim, so `javascript&colon;x` stays
 * a harmless relative path.
 */
export const safeHref = (href: string | null | undefined): string | undefined => {
  if (!href) return undefined;
  try {
    return /^(?:https?|mailto):$/.test(new URL(href, BASE).protocol) ? href : undefined;
  } catch {
    return undefined;
  }
};

const ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  nbsp: ' ',
};
/** marked decodes numeric entities but keeps these named ones in text tokens. Text nodes only. */
export const decodeEntities = (s: string): string =>
  s.replace(/&(amp|lt|gt|quot|nbsp);/g, (m, name: string) => ENTITIES[name] ?? m);
