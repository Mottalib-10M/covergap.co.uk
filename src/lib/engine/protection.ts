/**
 * Cover Gap engine: pure functions, no network. Every statutory figure comes from `data/params-2026.json`
 * (GOV.UK, 2026/27) and every mortality rate from `data/life-tables-2022-2024.json` (ONS national life
 * tables 2022-2024). No insurance price exists anywhere in the engine: premiums are only ever typed by
 * the user, from their own quote.
 */
import { P } from './params';
import LT from '../../data/life-tables-2022-2024.json';

export type Sex = 'm' | 'f';
export type Area = 'uk' | 'england' | 'wales' | 'scotland' | 'ni';
export const AREAS: Area[] = ['uk', 'england', 'wales', 'scotland', 'ni'];
export const AREA_LABEL: Record<Area, string> = { uk: 'United Kingdom', england: 'England', wales: 'Wales', scotland: 'Scotland', ni: 'Northern Ireland' };
export const MAX_AGE = 100;

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const tbl = (area: Area) => (LT.areas as Record<Area, { qx: Record<Sex, number[]>; ex: Record<Sex, number[]> }>)[area];

/** Probability that a person aged exactly `age` dies before `age + 1` (ONS qx). Age 100 and over: the age-100 rate. */
export function qx(age: number, sex: Sex, area: Area = 'uk'): number {
  const a = clamp(Math.floor(age), 0, MAX_AGE);
  return tbl(area).qx[sex][a];
}

/** Period life expectancy at exact age (ONS ex). */
export function lifeExpectancy(age: number, sex: Sex, area: Area = 'uk'): number {
  return tbl(area).ex[sex][clamp(Math.round(age), 0, MAX_AGE)];
}

/**
 * Probability of surviving `years` from exact age `age`, multiplying the yearly survival rates of the table.
 * A fractional last year uses the constant-rate assumption within the year: (1 - q)^fraction.
 */
export function survival(age: number, years: number, sex: Sex, area: Area = 'uk'): number {
  let s = 1;
  const whole = Math.floor(Math.max(0, years));
  const a0 = Math.floor(age);
  for (let i = 0; i < whole; i++) s *= 1 - qx(a0 + i, sex, area);
  const frac = Math.max(0, years) - whole;
  if (frac > 0) s *= Math.pow(1 - qx(a0 + whole, sex, area), frac);
  return s;
}

/** Chance that a level or decreasing term policy pays a death claim: death within the term. */
export function payoutChance(age: number, term: number, sex: Sex, area: Area = 'uk'): number {
  return 1 - survival(age, term, sex, area);
}

/** Joint life, first death: chance at least one of two lives dies within the term, and chance both do. */
export function jointChances(a1: number, s1: Sex, a2: number, s2: Sex, term: number, area: Area = 'uk') {
  const p1 = payoutChance(a1, term, s1, area), p2 = payoutChance(a2, term, s2, area);
  return { first: p1, second: p2, atLeastOne: 1 - (1 - p1) * (1 - p2), both: p1 * p2, neither: (1 - p1) * (1 - p2) };
}

/** Age by which half the people of this age and sex will have died (median age at death, period table). */
export function medianAgeAtDeath(age: number, sex: Sex, area: Area = 'uk'): number {
  let s = 1;
  for (let a = Math.floor(age); a <= MAX_AGE + 20; a++) {
    const q = qx(a, sex, area);
    const next = s * (1 - q);
    if (next <= 0.5) return a + (Math.log(0.5 / s) / Math.log(1 - q));
    s = next;
  }
  return MAX_AGE + 20;
}

/* ------------------------------------------------------------------ over 50s and whole of life ---- */

export interface Over50Input { age: number; sex: Sex; area?: Area; premium: number; sum: number; stopAge?: number }
/**
 * Over 50s plan or whole of life policy at a fixed monthly premium typed by the user.
 * Break-even: the month at which total premiums reach the fixed sum assured. Premiums stop at `stopAge`
 * when the plan has such a rule (0 = paid for life).
 */
export function over50(i: Over50Input) {
  const area = i.area ?? 'uk';
  const months = i.premium > 0 ? i.sum / i.premium : Infinity;
  const stop = i.stopAge && i.stopAge > i.age ? i.stopAge : Infinity;
  const payMonthsMax = stop === Infinity ? Infinity : (stop - i.age) * 12;
  const breakEvenAge = months <= payMonthsMax ? i.age + months / 12 : Infinity;
  const aliveAtBreakEven = breakEvenAge === Infinity ? 0 : survival(i.age, breakEvenAge - i.age, i.sex, area);
  const ex = lifeExpectancy(i.age, i.sex, area);
  const paidToExpectancy = i.premium * Math.min(ex * 12, payMonthsMax);
  const maxPaid = payMonthsMax === Infinity ? Infinity : i.premium * payMonthsMax;
  return { breakEvenAge, aliveAtBreakEven, expectancy: ex, ageAtExpectancy: i.age + ex, paidToExpectancy, maxPaid, median: medianAgeAtDeath(i.age, i.sex, area) };
}

/* ------------------------------------------------------------------ mortgage and decreasing term ---- */

/** Outstanding balance of a capital repayment mortgage after `t` years (monthly payments, annual rate). */
export function mortgageBalance(loan: number, rate: number, years: number, t: number): number {
  const n = Math.round(years * 12), k = Math.min(n, Math.round(t * 12));
  if (rate <= 0) return loan * (1 - k / n);
  const r = rate / 12;
  const pay = (loan * r) / (1 - Math.pow(1 + r, -n));
  return Math.max(0, loan * Math.pow(1 + r, k) - pay * ((Math.pow(1 + r, k) - 1) / r));
}
export function mortgagePayment(loan: number, rate: number, years: number): number {
  const n = Math.round(years * 12);
  if (rate <= 0) return loan / n;
  const r = rate / 12;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

/* ------------------------------------------------------------------ sick pay and ESA ---- */

/** Weekly Statutory Sick Pay from 6 April 2026: the lower of the flat rate and 80 % of average weekly earnings. */
export function sspWeekly(weeklyEarnings: number): number {
  return Math.max(0, Math.min(P.ssp.weekly, P.ssp.earningsShare * weeklyEarnings));
}

/** Weekly New Style ESA by phase: assessment rate, then the work-related activity or support group. */
export function esaWeekly(age: number, phase: 'assessment' | 'wrag' | 'support', privatePensionWeekly = 0): number {
  const base = phase === 'assessment' ? (age < 25 ? P.esa.assessmentUnder25 : P.esa.assessment25) : phase === 'wrag' ? P.esa.wrag : P.esa.support;
  const cut = Math.max(0, privatePensionWeekly - P.esa.pensionDisregard) * P.esa.pensionTaper;
  return Math.max(0, base - cut);
}

export interface SickInput {
  /** Gross pay a month. */
  monthlyPay: number;
  /** Weeks of full company sick pay, then weeks of half pay. */
  fullWeeks: number;
  halfWeeks: number;
  age: number;
  employee: boolean;
  /** Support group after the assessment, instead of the work-related activity group. */
  support?: boolean;
  /** Income protection: monthly benefit and deferred period in weeks (0 = none). */
  ipMonthly?: number;
  deferredWeeks?: number;
}
export interface Phase { label: string; fromWeek: number; toWeek: number; weekly: number; ip: number }

/**
 * Income before tax, week by week, during a long absence: company sick pay (never below SSP), then SSP to
 * week 28, then New Style ESA (assessment for 13 weeks, then the group; the work-related activity group
 * stops after 365 days). Self-employed: no sick pay, ESA from the start. Income protection is added once
 * the deferred period has passed. One year of 52 weeks per phase unit.
 */
export function sickTimeline(i: SickInput, horizonWeeks = 104): Phase[] {
  const W = P.weeksPerYear, M = P.monthsPerYear;
  const weeklyPay = (i.monthlyPay * M) / W;
  const ssp = i.employee ? sspWeekly(weeklyPay) : 0;
  const cuts: Array<{ label: string; to: number; weekly: number }> = [];
  let w = 0;
  if (i.employee) {
    const full = Math.max(0, Math.round(i.fullWeeks)), half = Math.max(0, Math.round(i.halfWeeks));
    if (full > 0) { cuts.push({ label: 'Company sick pay, full', to: full, weekly: Math.max(weeklyPay, ssp) }); w = full; }
    if (half > 0) { cuts.push({ label: 'Company sick pay, half', to: w + half, weekly: Math.max(weeklyPay / 2, w < P.ssp.maxWeeks ? ssp : 0) }); w += half; }
    if (w < P.ssp.maxWeeks) { cuts.push({ label: 'Statutory Sick Pay', to: P.ssp.maxWeeks, weekly: ssp }); w = P.ssp.maxWeeks; }
  }
  const esaStart = w;
  const assessEnd = esaStart + P.esa.assessmentWeeks;
  cuts.push({ label: 'New Style ESA, assessment rate', to: assessEnd, weekly: esaWeekly(i.age, 'assessment') });
  if (i.support) cuts.push({ label: 'New Style ESA, support group', to: Math.max(horizonWeeks, assessEnd), weekly: esaWeekly(i.age, 'support') });
  else {
    const wragEnd = esaStart + Math.round(P.esa.wragDays / 7);
    cuts.push({ label: 'New Style ESA, work-related activity group', to: wragEnd, weekly: esaWeekly(i.age, 'wrag') });
    cuts.push({ label: 'After New Style ESA ends', to: Math.max(horizonWeeks, wragEnd), weekly: 0 });
  }
  const ipFrom = i.ipMonthly && i.ipMonthly > 0 ? Math.max(0, i.deferredWeeks ?? 0) : Infinity;
  const ipWeekly = ((i.ipMonthly ?? 0) * M) / W;
  // Split each statutory phase where income protection starts.
  const out: Phase[] = [];
  let from = 0;
  for (const c of cuts) {
    const to = Math.min(c.to, horizonWeeks);
    if (to <= from) { from = Math.max(from, c.to); continue; }
    if (ipFrom > from && ipFrom < to) {
      out.push({ label: c.label, fromWeek: from, toWeek: ipFrom, weekly: c.weekly, ip: 0 });
      out.push({ label: c.label, fromWeek: ipFrom, toWeek: to, weekly: c.weekly, ip: ipWeekly });
    } else out.push({ label: c.label, fromWeek: from, toWeek: to, weekly: c.weekly, ip: from >= ipFrom ? ipWeekly : 0 });
    from = to;
    if (from >= horizonWeeks) break;
  }
  return out;
}

/** Totals over a timeline against a monthly budget: income received, shortfall, months savings last. */
export function sickGap(i: SickInput & { monthlyNeed: number; savings?: number }, horizonWeeks = 104) {
  const W = P.weeksPerYear, M = P.monthsPerYear;
  const tl = sickTimeline(i, horizonWeeks);
  const needWeekly = (i.monthlyNeed * M) / W;
  let income = 0, shortfall = 0, savings = i.savings ?? 0, savingsGoneWeek: number | null = null;
  for (const ph of tl) for (let wk = ph.fromWeek; wk < ph.toWeek; wk++) {
    const got = ph.weekly + ph.ip;
    income += got;
    const gap = Math.max(0, needWeekly - got);
    shortfall += gap;
    savings -= gap;
    if (savings < 0 && savingsGoneWeek === null) savingsGoneWeek = wk;
  }
  const sspOnly = tl.find((p) => p.label === 'Statutory Sick Pay');
  return { timeline: tl, income, shortfall, savingsGoneWeek, monthly: (x: number) => (x * W) / M, sspWeekly: sspOnly?.weekly ?? 0 };
}

/* ------------------------------------------------------------------ bereavement and life cover ---- */

/** Bereavement Support Payment for a claim within 3 months: one-off payment plus 18 monthly payments. */
export function bsp(partner: 'married' | 'cohabiting' | 'none', children: boolean) {
  const B = P.bsp;
  if (partner === 'none' || (partner === 'cohabiting' && !children)) return { rate: 'none' as const, lump: 0, monthly: 0, total: 0 };
  const higher = children;
  const lump = higher ? B.higherLump : B.standardLump, monthly = higher ? B.higherMonthly : B.standardMonthly;
  return { rate: higher ? ('higher' as const) : ('standard' as const), lump, monthly, total: lump + monthly * B.months };
}

export interface NeedInput {
  mortgage: number; debts: number; funeral: number;
  /** Income the family would need replaced, a year, and for how many years. */
  income: number; years: number;
  /** Lump sums for children (education etc.). */
  extra: number;
  savings: number; deathInService: number; existing: number;
  partner: 'married' | 'cohabiting' | 'none'; children: boolean;
  /** Count Bereavement Support Payment against the need. */
  countBsp: boolean;
}
/** Lump sum of life cover still needed after what is already in place. No interest assumed on the income. */
export function coverNeed(i: NeedInput) {
  const b = bsp(i.partner, i.children);
  const incomeNeed = Math.max(0, i.income) * Math.max(0, i.years);
  const gross = i.mortgage + i.debts + i.funeral + incomeNeed + i.extra;
  const state = i.countBsp ? b.total : 0;
  const inPlace = i.savings + i.deathInService + i.existing + state;
  const need = Math.max(0, gross - inPlace);
  return { gross, incomeNeed, bsp: b, state, inPlace, need, monthlyEquivalent: i.years > 0 ? need / (i.years * 12) : 0 };
}

/** Family income benefit: total paid if the claim happens at year `t` of a `term`-year policy. */
export function fibTotal(monthly: number, term: number, t: number) {
  return Math.max(0, term - t) * 12 * monthly;
}

/* ------------------------------------------------------------------ inheritance tax on a payout ---- */

export interface IhtInput { estate: number; payout: number; home: number; toDescendants: boolean; toSpouse: boolean }
/** Inheritance tax added by a life policy paid into the estate, against a policy written in trust (outside it). */
export function ihtOnPayout(i: IhtInput) {
  const I = P.iht;
  const charge = (est: number) => {
    if (i.toSpouse) return { tax: 0, threshold: I.nrb };
    const rnrbBase = i.toDescendants ? Math.min(I.rnrb, i.home) : 0;
    const taper = Math.max(0, (est - I.taperThreshold) / I.taperDivisor);
    const rnrb = Math.max(0, rnrbBase - taper);
    const threshold = I.nrb + rnrb;
    return { tax: Math.max(0, est - threshold) * I.rate, threshold };
  };
  const inTrust = charge(i.estate), inEstate = charge(i.estate + i.payout);
  return { taxInTrust: inTrust.tax, taxInEstate: inEstate.tax, extra: inEstate.tax - inTrust.tax, thresholdInTrust: inTrust.threshold, thresholdInEstate: inEstate.threshold, familyGetsInTrust: i.payout, familyGetsInEstate: i.payout - (inEstate.tax - inTrust.tax) };
}

/* ------------------------------------------------------------------ funeral ---- */

/** Funeral Expenses Payment: burial or cremation fees in full, plus other costs up to the cap (lower cap with a plan). */
export function funeralPayment(fees: number, otherCosts: number, hasPlan: boolean) {
  const cap = hasPlan ? P.funeral.withPlan : P.funeral.otherExpenses;
  const other = Math.min(Math.max(0, otherCosts), cap);
  return { fees: Math.max(0, fees), other, cap, total: Math.max(0, fees) + other, gap: Math.max(0, otherCosts - other) };
}
/** Funeral plan paid by instalments: total paid against the single price quoted. */
export function planInstalments(price: number, monthly: number, months: number) {
  const total = monthly * months;
  return { total, extra: total - price, extraShare: price > 0 ? (total - price) / price : 0 };
}

/* ------------------------------------------------------------------ key person ---- */

export function keyPerson(profit: number, months: number, recruit: number, lost: number) {
  const cover = (profit * months) / 12 + recruit + lost;
  return { cover, profitPart: (profit * months) / 12 };
}

/* ------------------------------------------------------------------ critical illness lump vs income ---- */

/** How long a lump sum pays a monthly budget, and what an income benefit pays over a period. */
export function lumpVsIncome(lump: number, monthlyNeed: number, ipMonthly: number, ipMonths: number) {
  return { lumpMonths: monthlyNeed > 0 ? lump / monthlyNeed : Infinity, ipTotal: ipMonthly * ipMonths, ipCoverShare: monthlyNeed > 0 ? ipMonthly / monthlyNeed : 0 };
}
