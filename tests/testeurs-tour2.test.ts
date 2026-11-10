/**
 * Naive testers of 2026-11-09, second round (reports/test-naif-2026-11-09-final/testeur-1..3.md). Each test
 * locks one correction:
 *  - SSP page: the gap against outgoings and the pay lost against pay are named apart (£9,472 against £9,149
 *    for the same person, with no word on why);
 *  - critical illness: every income protection line names its own months (“over those months” read as 28.6);
 *  - income protection: the big figure answers “how much a month”, and the age band is asked;
 *  - a chance in words never disagrees with the percentage beside it (“12%” next to “1 in 9”);
 *  - folded fields read “Label: value”, without “Now: Nation United Kingdom”;
 *  - home page: doors for a reader under 30 and one over 55, the sick pay gap not folded.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getSpec } from '../src/lib/mini-specs';
import { inWords, pct } from '../src/lib/pct';
import { resumeRepli } from '../src/lib/libelles-trame';
import { P } from '../src/lib/engine/params';
import * as E from '../src/lib/engine/protection';

const money = (s: string) => Number(s.replace(/[£,\s]|in total/g, ''));
const run = (kind: string, v: Record<string, number>) => getSpec(kind).run(v);

describe('SSP page: two gaps, two names', () => {
  const out = run('ssp', { pay: 2800, need: 2000 });
  const row = (re: RegExp) => out.rows.find(([l]) => re.test(l));
  it('names the gap against outgoings and the pay lost against pay, side by side', () => {
    expect(out.head[0]).toMatch(/outgoings/);
    expect(row(/^Short of your outgoings over the 28 weeks$/)).toBeTruthy();
    expect(row(/^Pay lost against your usual pay over the 28 weeks$/)).toBeTruthy();
  });
  it('the two figures are what their names say', () => {
    const wk = (2800 * P.monthsPerYear) / P.weeksPerYear, s = E.sspWeekly(wk);
    const short = 2000 - (s * P.weeksPerYear) / P.monthsPerYear;
    expect(money(row(/^Short of your outgoings/)![1])).toBe(Math.round((short * P.monthsPerYear / P.weeksPerYear) * 28));
    expect(money(row(/^Pay lost/)![1])).toBe(Math.round((wk - s) * 28));
  });
});

describe('critical illness: one length per line', () => {
  it('every income protection line names the months typed, never “those months” alone', () => {
    const out = run('ci', { lump: 60000, need: 2100, ip: 1500, months: 24 });
    const labels = out.rows.map(([l]) => l);
    expect(labels).toContain('Income protection, paid for 24 months');
    expect(labels).toContain('So short over those 24 months');
    expect(labels.join(' ')).not.toMatch(/over those months/);
    expect(money(out.rows.find(([l]) => l === 'So short over those 24 months')![1])).toBe(600 * 24);
    expect(out.note).toMatch(/28\.6 against 24/);
  });
});

describe('income protection: how much a month (tour of 2026-11-10: the two amounts named side by side)', () => {
  it('the big figure covers the outgoings once the state pays nothing; the smaller one names its weeks', () => {
    const out = run('gap', { pay: 2800, need: 2000, full: 4, half: 0, age: 40, ip: 0, def: 13 });
    const esa = (E.esaWeekly(40, 'wrag') * P.weeksPerYear) / P.monthsPerYear;
    expect(out.head[0]).toMatch(/^Once all sick pay and state benefit have stopped: income protection to ask for, a month$/);
    expect(money(out.head[1])).toBe(2000);
    const row = out.rows.find(([l]) => /^Enough only while the state benefit, New Style ESA, is paid \(weeks \d+ to \d+\)$/.test(l));
    expect(row).toBeTruthy();
    expect(money(row![1])).toBe(Math.round((2000 - esa) / 10) * 10);
  });
  it('under 25 the two-year shortfall is larger (ESA assessment rate)', () => {
    const short = (age: number) => money(run('gap', { pay: 2800, need: 2000, full: 4, half: 0, age, ip: 0, def: 13 }).rows.find(([l]) => /^Short over 2 years/.test(l))![1]);
    expect(short(24)).toBeGreaterThan(short(40));
  });
});

describe('a chance in words agrees with its percentage', () => {
  it('from 10% up, “N people in 100” with N the rounded percentage', () => {
    for (let p = 0.1; p < 1; p += 0.0137) {
      expect(inWords(p)).toBe(`about ${pct(p).replace('%', '')} people in 100`);
    }
  });
  it('the term calculator never shows “1 in 9” next to “12%”', () => {
    const out = run('term', { age: 40, term: 25, sex: 0 });
    expect(out.head[1]).toBe('12%');
    expect(out.note).toContain('about 12 people in 100');
  });
});

describe('folded fields', () => {
  it('read “Label: value”, with no “Now:” in English', () => {
    expect(resumeRepli('en', [{ label: 'Where you live', valeur: 'United Kingdom' }, { label: 'Funeral', valeur: '£5,000' }])).toBe('Where you live: United Kingdom · Funeral: £5,000');
  });
});

describe.skipIf(!existsSync(join('dist', 'en/index.html')))('home page, built', () => {
  const built = join('dist', 'en/index.html');
  const html = existsSync(built) ? readFileSync(built, 'utf8') : '';
  it('has a door for a reader under 30 and one over 55, each loading an example', () => {
    expect(html).toMatch(/href="\/en\/\?ex=1&amp;a=25[^"]*#calculator"[^>]*>Under 30, renting, no children/);
    expect(html).toMatch(/href="\/en\/\?ex=1&amp;a=61[^"]*#calculator"[^>]*>Over 55, children grown up/);
  });
  it('the sick pay gap section is open, not folded', () => {
    const i = html.indexOf('Being off sick is the likelier risk');
    expect(i).toBeGreaterThan(0);
    expect(html.slice(Math.max(0, i - 200), i)).not.toMatch(/<summary/);
  });
  it('the form asks to change the example first, and the mention says what it assumes', () => {
    expect(html).toContain('Start by changing these to match you');
    expect(html).toMatch(/it assumes a married man of 40 with a child at home, £180,000 left on the mortgage/);
    expect(html).not.toMatch(/Now: /);
  });
});
