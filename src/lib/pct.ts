import { formatPercent } from './format';
/** Percentage: two decimals under 1 %, one under 10 %, none above. */
/** The same chance in words, never at odds with the percentage beside it (testers of 2026-11-09, second
 *  round: “12%” next to “1 in 9”): “about 12 people in 100” from 10% up, “about 1 person in 23” below. */
export const inWords = (p: number) => (p <= 0 ? 'none' : p >= 0.1 ? `about ${Math.round(p * 100)} people in 100` : `about 1 person in ${Math.round(1 / p).toLocaleString('en-GB')}`);
export const pct = (x: number, d?: number) => formatPercent(x, d ?? (x < 0.01 ? 2 : x < 0.1 ? 1 : 0));
