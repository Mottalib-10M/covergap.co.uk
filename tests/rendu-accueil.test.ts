/**
 * Audit of 2026-11-09: six links were shown as raw HTML on the home page ("The <a href=…>Funeral Expenses
 * Payment</a> helps…"), and the household cards counted amounts their text did not name. `npm run check`
 * builds before the tests, so the built pages are read here.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = 'dist';
const pages = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? pages(p) : f.endsWith('.html') ? [p] : [];
});
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| | /g, ' ');
const money = (s: string) => Number(s.replace(/[£,\s]/g, ''));

// Each built file is read only after existsSync (a deploy once failed on a dist/ without its pages).
describe.skipIf(!existsSync(join(DIST, 'en/index.html')))('built pages', () => {
  it('no HTML tag is shown as text', () => {
    const bad = pages(DIST).filter((p) => /&lt;(a|p|strong|em|span|br)[\s>]/.test(readFileSync(p, 'utf8')));
    expect(bad).toEqual([]);
  });
  it('each household card: the amounts named add up to “Family would need”', () => {
    const html = readFileSync(join(DIST, 'en/index.html'), 'utf8');
    const sec = html.slice(html.indexOf('id="fams-title"'), html.indexOf('</section>', html.indexOf('id="fams-title"')));
    const cards = sec.split('border border-navy-200 p-4').slice(1);
    expect(cards.length).toBe(3);
    for (const c of cards) {
      const t = text(c).replace(/\s+/g, ' ');
      const what = t.slice(0, t.indexOf('Family would need'));
      const need = money(t.match(/Family would need £([\d,]+)/)![1]);
      let sum = 0;
      const income = what.match(/£([\d,]+) a year of income needed for (\d+) years/);
      if (income) sum += money(income[1]) * Number(income[2]);
      const rest = what.replace(income?.[0] ?? '', '');
      for (const mm of rest.matchAll(/£([\d,]+) (left on the mortgage|of other debts|for university|for a funeral)/g)) sum += money(mm[1]);
      expect(sum).toBe(need);
    }
  });
});
