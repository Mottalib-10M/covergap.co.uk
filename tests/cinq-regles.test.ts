/**
 * Brief of 2026-11-10, five rules (reports/test-naif-2026-11-10/synthese.md). Each test locks one rule:
 *  1. one figure per case: the sick pay example is the same everywhere, every big figure has a line saying
 *     what it assumes, the by-age calculator no longer repeats the term page;
 *  2. doors by profile above the form;
 *  3. at most three sections of text and three questions per page;
 *  4. no law reference or unexplained abbreviation in the running text of the tested pages;
 *  5. a field that does not apply is hidden; units in words.
 * Built pages are read only after existsSync.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getSpec, SPEC_IDS } from '../src/lib/mini-specs';
import { SICK_DEFAULTS } from '../src/lib/cover-defaults';
import { PAGES } from '../src/lib/guides';
import { helpers } from '../src/lib/helpers';

const h = helpers(true);
const defaults = (kind: string) => Object.fromEntries(getSpec(kind).inputs.map((i) => [i.id, i.def]));

describe('rule 1: one figure per case', () => {
  it('pay and outgoings are the same example on every sick pay calculator', () => {
    for (const k of ['gap', 'ssp', 'deferred']) expect(defaults(k).pay, k).toBe(SICK_DEFAULTS.pay);
    for (const k of ['gap', 'ssp', 'deferred', 'ci', 'selfemp']) expect(defaults(k).need, k).toBe(SICK_DEFAULTS.need);
    for (const id of ['income-protection-insurance', 'statutory-sick-pay-income-protection', 'critical-illness-cover', 'income-protection-deferred-period']) {
      const t = PAGES.find((p) => p.id === id)!.tool!;
      expect(t.props?.need, id).toBe(SICK_DEFAULTS.need);
    }
  });
  it('every calculator says, under its big figure, what it assumes', () => {
    for (const k of SPEC_IDS) expect(getSpec(k).run(defaults(k)).sub, k).toBeTruthy();
  });
  it('the SSP page names its period before the figure', () => {
    expect(getSpec('ssp').run(defaults('ssp')).head[0]).toMatch(/^During the \d+ weeks of Statutory Sick Pay only/);
  });
  it('the by-age calculator does not repeat the term calculator', () => {
    const odds = getSpec('odds'), term = getSpec('term');
    expect(odds.inputs.map((i) => i.id)).not.toContain('term');
    expect(odds.run(defaults('odds')).head[0]).not.toBe(term.run(defaults('term')).head[0]);
    expect(odds.run(defaults('odds')).rows.map(([l]) => l).join(' ')).not.toMatch(/years left to live/i);
  });
  it('an age is said in whole years, never “age 76.7”', () => {
    expect(getSpec('over50').run(defaults('over50')).head[1]).toMatch(/^about age \d+$/);
  });
});

describe('rule 2: doors by profile', () => {
  it('the calculators of the tested pages offer doors that load another example', () => {
    for (const k of ['gap', 'term', 'odds', 'over50']) expect(getSpec(k).portes?.length, k).toBeGreaterThanOrEqual(3);
    expect(getSpec('gap').portes!.some((p) => p.v.age >= 60)).toBe(true);
    expect(getSpec('gap').portes!.some((p) => p.v.age < 25)).toBe(true);
  });
});

describe('rule 3: shorter pages', () => {
  it('at most three sections of text and three questions on every calculator page', () => {
    for (const p of PAGES) {
      expect((p.body(h).match(/<h2>/g) ?? []).length, p.id).toBeLessThanOrEqual(3);
      expect(p.faqs(h).length, p.id).toBeLessThanOrEqual(3);
    }
  });
});

describe('rule 4: words a reader knows', () => {
  it('no law reference in the running text of the pages', () => {
    for (const p of PAGES) {
      const all = p.intro + p.resume(h) + p.body(h) + p.faqs(h).map((f) => f.a).join(' ');
      expect(all.replace(/<a [^>]*>/g, ''), p.id).not.toMatch(/ITTOIA|BIM\d+|section \d+ of|Act 20\d\d/);
    }
  });
});

describe('rule 5: hard fields', () => {
  it('the waiting time of a policy shows only once a policy amount is typed', () => {
    const def = getSpec('gap').inputs.find((i) => i.id === 'def')!;
    expect(def.si?.({ ip: 0 })).toBe(false);
    expect(def.si?.({ ip: 1500 })).toBe(true);
  });
  it('the age is asked in years, with no “25 or over” default answering for the reader', () => {
    const ids = getSpec('gap').inputs.map((i) => i.id);
    expect(ids).toContain('age');
    expect(ids).not.toContain('u25');
  });
  it('units are written in words', () => {
    for (const k of SPEC_IDS) for (const i of getSpec(k).inputs) expect(['yrs', 'wks', 'mths']).not.toContain(i.unit ?? '');
  });
  it('hard money fields carry a “Not sure?” way out', () => {
    for (const k of ['gap', 'ssp']) for (const id of ['pay', 'need']) expect(getSpec(k).inputs.find((i) => i.id === id)!.help, `${k}.${id}`).toMatch(/Not sure\?/);
  });
});

describe.skipIf(!existsSync(join('dist', 'en/index.html')))('built site', () => {
  const read = (p: string) => (existsSync(join('dist', p)) ? readFileSync(join('dist', p), 'utf8') : '');
  it('the phone menu shows every group open, the same for all', () => {
    const html = read('en/index.html');
    expect(html).not.toMatch(/mobile-section-toggle[^>]*aria-expanded="false"/);
    expect(html).not.toMatch(/mobile-section-content hidden/);
  });
  it('the date of the rates is not repeated above the footer', () => {
    const html = read('en/term-life-insurance/index.html');
    expect(html).toBeTruthy();
    expect((html.match(/last read on/g) ?? []).length).toBeLessThanOrEqual(1);
  });
  it('the home page loads examples from buttons above the calculator', () => {
    const html = read('en/index.html');
    const i = html.indexOf('data-depart'), j = html.indexOf('id="calculator"');
    expect(i).toBeGreaterThan(0);
    expect(i).toBeLessThan(j);
    expect(html.slice(i, j)).toContain('Tap to load that example into the calculator below');
  });
});
