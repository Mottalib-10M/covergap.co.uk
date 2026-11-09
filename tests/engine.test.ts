/** Engine tests (RECETTE §17.3, §17.4): each case is computed by hand from the source it cites. */
import { describe, it, expect } from 'vitest';
import * as E from '../src/lib/engine/protection';
import { P } from '../src/lib/engine/params';
import LT from '../src/data/life-tables-2022-2024.json';

describe('ONS life tables', () => {
  it('holds 101 ages for both sexes in five areas', () => {
    for (const a of E.AREAS) for (const s of ['m', 'f'] as const) {
      expect((LT.areas as any)[a].qx[s].length).toBe(101);
      expect((LT.areas as any)[a].ex[s].length).toBe(101);
    }
  });
  it('reads the ONS 2022-2024 values as published (UK, men, 35: qx 0.00111, ex 45.23)', () => {
    expect(E.qx(35, 'm')).toBeCloseTo(0.00111, 6);
    expect(E.lifeExpectancy(35, 'm')).toBeCloseTo(45.23, 2);
    expect(E.lifeExpectancy(0, 'f')).toBeCloseTo(83.02, 2);
  });
  it('payout chance is the product of yearly survival rates', () => {
    let s = 1; for (let a = 40; a < 65; a++) s *= 1 - E.qx(a, 'm');
    expect(E.payoutChance(40, 25, 'm')).toBeCloseTo(1 - s, 12);
    expect(E.survival(50, 0, 'f')).toBe(1);
    expect(E.payoutChance(30, 10, 'f')).toBeLessThan(E.payoutChance(30, 10, 'm'));
    expect(E.payoutChance(60, 10, 'm')).toBeGreaterThan(E.payoutChance(40, 10, 'm'));
  });
  it('median age at death sits where survival crosses one half', () => {
    const med = E.medianAgeAtDeath(60, 'm');
    expect(E.survival(60, med - 60, 'm')).toBeCloseTo(0.5, 3);
  });
  it('joint first-death odds exceed either single life', () => {
    const j = E.jointChances(40, 'm', 38, 'f', 25);
    expect(j.atLeastOne).toBeGreaterThan(Math.max(j.first, j.second));
    expect(j.atLeastOne + j.neither).toBeCloseTo(1, 12);
  });
});

describe('Statutory Sick Pay 2026/27 (GOV.UK)', () => {
  it('is the lower of the flat rate and 80 % of earnings', () => {
    expect(E.sspWeekly(1000)).toBe(P.ssp.weekly);
    expect(E.sspWeekly(100)).toBeCloseTo(80, 10);
    expect(E.sspWeekly(P.ssp.weekly / P.ssp.earningsShare)).toBeCloseTo(P.ssp.weekly, 10);
  });
});

describe('New Style ESA timeline (GOV.UK)', () => {
  it('runs company pay, SSP to week 28, assessment 13 weeks, then the group with its 365-day limit', () => {
    const tl = E.sickTimeline({ monthlyPay: 2600, fullWeeks: 4, halfWeeks: 0, age: 30, employee: true }, 120);
    expect(tl.map((p) => p.label)).toEqual(['Company sick pay, full', 'Statutory Sick Pay', 'New Style ESA, assessment rate', 'New Style ESA, work-related activity group', 'After New Style ESA ends']);
    expect(tl[1].toWeek).toBe(P.ssp.maxWeeks);
    expect(tl[2].toWeek - tl[2].fromWeek).toBe(P.esa.assessmentWeeks);
    expect(tl[3].toWeek).toBe(P.ssp.maxWeeks + Math.round(P.esa.wragDays / 7));
    expect(tl[2].weekly).toBe(P.esa.assessment25);
  });
  it('self-employed: no SSP, ESA from the start; under 25 at the lower rate', () => {
    const tl = E.sickTimeline({ monthlyPay: 0, fullWeeks: 0, halfWeeks: 0, age: 22, employee: false, support: true }, 60);
    expect(tl[0].label).toBe('New Style ESA, assessment rate');
    expect(tl[0].weekly).toBe(P.esa.assessmentUnder25);
    expect(tl[1].weekly).toBe(P.esa.support);
  });
  it('a private pension above £85 a week cuts ESA by half the excess (GOV.UK example: £100 gives £7.50)', () => {
    expect(P.esa.assessment25 - E.esaWeekly(30, 'assessment', 100)).toBeCloseTo(7.5, 10);
  });
  it('income protection starts after the deferred period', () => {
    const g = E.sickGap({ monthlyPay: 3000, monthlyNeed: 2000, fullWeeks: 0, halfWeeks: 0, age: 40, employee: true, ipMonthly: 1000, deferredWeeks: 13 }, 104);
    const withIp = g.timeline.filter((p) => p.ip > 0);
    expect(withIp[0].fromWeek).toBe(13);
    const none = E.sickGap({ monthlyPay: 3000, monthlyNeed: 2000, fullWeeks: 0, halfWeeks: 0, age: 40, employee: true }, 104);
    expect(none.shortfall - g.shortfall).toBeCloseTo((1000 * 12 / 52) * (104 - 13), 6);
  });
});

describe('Bereavement Support Payment 2026/27 (GOV.UK)', () => {
  it('higher rate £3,500 + 18 × £350, standard £2,500 + 18 × £100', () => {
    expect(E.bsp('married', true).total).toBe(3500 + 18 * 350);
    expect(E.bsp('married', false).total).toBe(2500 + 18 * 100);
    expect(E.bsp('cohabiting', true).total).toBe(3500 + 18 * 350);
    expect(E.bsp('cohabiting', false).total).toBe(0);
    expect(E.bsp('none', true).total).toBe(0);
  });
  it('cover need takes off the benefit, savings and cover in place', () => {
    const r = E.coverNeed({ mortgage: 100000, debts: 0, funeral: 0, income: 10000, years: 10, extra: 0, savings: 5000, deathInService: 50000, existing: 0, partner: 'married', children: true, countBsp: true });
    expect(r.need).toBe(200000 - 5000 - 50000 - 9800);
  });
});

describe('Mortgage, inheritance tax, funeral', () => {
  it('a repayment mortgage reaches zero on its last month', () => {
    expect(E.mortgageBalance(200000, 0.045, 25, 25)).toBeCloseTo(0, 4);
    expect(E.mortgageBalance(200000, 0.045, 25, 0)).toBeCloseTo(200000, 6);
    expect(E.mortgageBalance(120000, 0, 10, 5)).toBeCloseTo(60000, 6);
  });
  it('GOV.UK example: £500,000 estate, threshold £325,000, tax 40 % of £175,000', () => {
    const r = E.ihtOnPayout({ estate: 0, payout: 500000, home: 0, toDescendants: false, toSpouse: false });
    expect(r.taxInEstate).toBeCloseTo(0.4 * 175000, 6);
    expect(E.ihtOnPayout({ estate: 400000, payout: 200000, home: 0, toDescendants: false, toSpouse: true }).extra).toBe(0);
  });
  it('Funeral Expenses Payment caps other costs at £1,000, or £120 with a plan', () => {
    expect(E.funeralPayment(900, 3000, false).total).toBe(900 + 1000);
    expect(E.funeralPayment(900, 3000, true).other).toBe(120);
  });
  it('over 50s break-even: £25 a month against £5,000 is 200 months', () => {
    const r = E.over50({ age: 60, sex: 'm', premium: 25, sum: 5000, stopAge: 90 });
    expect(r.breakEvenAge).toBeCloseTo(60 + 200 / 12, 10);
    expect(E.over50({ age: 80, sex: 'm', premium: 10, sum: 5000, stopAge: 90 }).breakEvenAge).toBe(Infinity);
  });
});
