/** Writing helpers handed to every page: links, numbers from the engine, tables, sources. */
import { route, ROUTES } from '../i18n/routes';
import { P, type SourceKey } from './engine/params';
import * as E from './engine/protection';
import { formatMoney, formatNumber, displayDate } from './format';
import { attributsTableau, etiquettes } from './tableaux';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
/** Column name as plain text, for the `data-label` of each cell (phone cards, lib/tableaux.ts). */
const attr = (s: string) => s.replace(/<[^>]*>/g, '').replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/"/g, '&quot;').trim();
/** Content table. From 3 columns it becomes a stack of cards under 768 px (`table.empile`, naive testers 2026-11-08). */
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = []) {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  const { classe } = attributsTableau('auto', headers.length);
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm${classe ? ` ${classe}` : ''}">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-navy-700 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => { const lab = etiquettes(headers, r.length); return `<tr>${r.map((c, i) => `<td data-label="${attr(lab[i])}" class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0)) : c}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;
}

import { pct } from './pct';
export { pct };

export function helpers(strict = false) {
  const m = (n: number) => formatMoney(Math.round(n), 0);
  const m2 = (n: number) => formatMoney(n, 2);
  const oneIn = (x: number) => (x > 0 ? `1 in ${formatNumber(Math.round(1 / x), 0)}` : 'none');
  const a = (id: string, text: string) => {
    if (!ROUTES.some((r) => r.id === id)) { if (strict) throw new Error(`Unknown page id in a link: ${id}`); return text; }
    return `<a href="${route(id, 'en')}">${text}</a>`;
  };
  return {
    P,
    E,
    /** Link to another page of the site by id. */
    a,
    /** £2,363 (rounded to the pound). */
    m,
    /** £123.25 (pence kept). */
    m2,
    num: (n: number) => formatNumber(n, 0),
    num1: (n: number) => formatNumber(n, 1),
    pc: pct,
    oneIn,
    /** “6 April 2026” from an ISO date. */
    date: (iso: string) => displayDate(iso, 'en-GB'),
    D: { ssp: displayDate(P.ssp.reformFrom, 'en-GB'), read: displayDate(P.retrieved_at, 'en-GB') },
    table,
    /** Link to an official source of the parameter file. */
    src: (key: SourceKey, text?: string) => { const s = P.sources[key]; return `<a href="${s.url}" target="_blank" rel="nofollow noopener noreferrer">${text ?? s.label.en}</a>`; },
    box: (title: string, html: string, kind: 'info' | 'tip' | 'warning' | 'example' = 'info') => `<div class="callout callout-${kind}"><span class="callout-title">${title}</span>${html}</div>`,
    /** Chance that a term policy pays out (ONS 2022-2024). */
    odds: (age: number, term: number, sex: E.Sex, area: E.Area = 'uk') => E.payoutChance(age, term, sex, area),
  };
}
export type Helpers = ReturnType<typeof helpers>;
