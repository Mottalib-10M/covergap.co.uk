/**
 * The life cover calculator's example case, shared by the calculator and by every text that describes it
 * (home page, method): the text and the tool start from the same values, so a figure printed in a sentence
 * is the figure the reader sees in the tool (brief of 2026-11-09). Age 40 is the default age of every
 * calculator of the site that asks for an age, except the pages about a given age (over 50s, over 60s).
 */
import type { Area, Sex } from './engine/protection';

export type Partner = 'married' | 'cohabiting' | 'none';
export const COVER_DEFAULTS = {
  age: 40, sex: 'm' as Sex, area: 'uk' as Area, partner: 'married' as Partner, kids: true,
  mortgage: 180000, debts: 8000, funeral: 5000, income: 24000, years: 15, extra: 20000, savings: 15000, dis: 0, existing: 0,
};
/** The sick pay example, the same on every page that asks for pay and outgoings (brief of 2026-11-10, rule 1:
 *  one figure per case): an employee on £2,800 a month before tax, £2,000 of outgoings, 4 weeks of full
 *  company sick pay. */
export const SICK_DEFAULTS = { pay: 2800, need: 2000, full: 4, half: 0 };
/** Default age of the calculators that ask for one (same field, same value on every page). */
export const DEFAULT_AGE = COVER_DEFAULTS.age;

/** “a 15-year” / “an 8-year”, “an 11-year”, “an 18-year”. */
export const article = (n: number) => (/^(8|11|18|8\d)$/.test(String(Math.round(n))) ? 'an' : 'a');
