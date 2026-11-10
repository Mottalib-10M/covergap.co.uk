import { definePage } from '../../lib/guide-types';
import { DEFAULT_AGE, SICK_DEFAULTS as SD } from '../../lib/cover-defaults';

// The site's one sick pay example (brief of 2026-11-10, rule 1), the same as the calculator's.
const CASE = { monthlyPay: SD.pay, monthlyNeed: SD.need, fullWeeks: SD.full, halfWeeks: SD.half, age: DEFAULT_AGE, employee: true };

export default definePage({
  id: 'income-protection-insurance',
  group: 'income',
  order: 100,
  tool: { kind: 'mini:gap', props: { pay: SD.pay, need: SD.need, full: SD.full, half: SD.half, age: DEFAULT_AGE, ip: 0, def: 13 } },
  related: ['statutory-sick-pay-income-protection', 'income-protection-deferred-period', 'self-employed-income-protection', 'critical-illness-cover'],
  sources: ['gov_ssp', 'gov_ssp_2026', 'gov_esa', 'gov_rates', 'ittoia_735'],
  slug: 'income-protection-insurance',
  nav: 'Income protection: how much',
  card: 'Your income week by week through company sick pay, Statutory Sick Pay and the state benefit, and the monthly cover to ask for.',
  title: 'Income Protection Insurance 2026/27: Your Sick Pay Gap',
  description: 'Income protection insurance in 2026/27: what company sick pay, SSP and New Style ESA pay week by week for two years, and the gap a policy would have to fill.',
  h1: 'Income protection: what you would be short if illness stopped your pay',
  intro: 'Income protection insurance pays you a monthly income while illness or injury keeps you off work. Enter your pay and what you spend: the calculator gives the monthly amount to ask an insurer for, after sick pay and state benefits for 2026/27.',
  resume: (h) => {
    const g = h.E.sickGap(CASE);
    // Brief of 2026-11-10 (rule 3): one sentence, one figure.
    return `Income protection insurance pays a monthly income when illness or injury stops you working. It starts after a waiting time you choose, called the deferred period, and runs until you go back to work, the policy ends or its limit is reached. Before choosing one, it helps to know what you would get without it. Most employees first get their employer’s sick pay, then the legal minimum, Statutory Sick Pay (SSP), for up to ${h.P.ssp.maxWeeks} weeks. After that comes New Style ESA (Employment and Support Allowance), the state benefit for people too ill to work, for about a year if the National Insurance record qualifies. Then the state pays nothing. Take an employee on ${h.m(CASE.monthlyPay)} a month who spends ${h.m(CASE.monthlyNeed)} a month. Over two years off sick, that household would be ${h.m(g.shortfall)} short. The policy to look for is the one that fills that gap, at a monthly amount close to what the household spends.`;
  },
  faqs: (h) => [
    { q: 'Is income protection insurance worth it if my employer pays sick pay?', a: `It depends on how long the company scheme lasts. Many pay full salary for a few weeks or months, then nothing beyond Statutory Sick Pay of ${h.m2(h.P.ssp.weekly)} a week at most. Enter your scheme in the calculator: if your savings cover the months after it ends, a policy adds little; if the shortfall runs into tens of thousands, that is the gap an income protection policy is designed for.` },
    { q: 'How much of my salary can income protection replace?', a: 'Insurers cap the monthly benefit at a share of your earnings before tax, and the share and the cap differ between them, so the policy document or the quote gives the limit. The calculator lets you enter any monthly benefit and shows what it changes; a benefit close to your outgoings rather than your salary is the figure many people aim for.' },
    { q: 'Does income protection affect my benefits if I claim?', a: `It can, and the answer depends on the benefit. New Style ESA is reduced by a private pension of more than ${h.m(h.P.esa.pensionDisregard)} a week, as GOV.UK explains, and Universal Credit takes most other income into account. Tell the DWP (Department for Work and Pensions) about any policy payment when you apply, so the award is right from the start, and ask the insurer whether its benefit is reduced by state payments.` },
  ],
  body: (h) => {
    const tl = h.E.sickTimeline(CASE);
    const W = h.P.weeksPerYear, M = h.P.monthsPerYear;
    // Plain names for the phases (testers of 2026-11-09, second round). Testers of 2026-11-10: two ESA lines at
    // the same weekly amount under two names read as an error; consecutive ESA phases paying the same are merged.
    const PLAIN: Record<string, string> = { 'New Style ESA, assessment rate': 'New Style ESA (state benefit for people too ill to work)', 'New Style ESA, work-related activity group': 'New Style ESA (state benefit for people too ill to work)', 'New Style ESA, support group': 'New Style ESA, the most severely ill', 'Statutory Sick Pay': 'Statutory Sick Pay (SSP)', 'After New Style ESA ends': 'After New Style ESA ends: nothing' };
    const merged: Array<{ label: string; from: number; to: number; weekly: number }> = [];
    for (const p of tl) {
      const label = PLAIN[p.label] ?? p.label, last = merged[merged.length - 1];
      if (last && last.label === label && last.weekly === p.weekly) last.to = p.toWeek;
      else merged.push({ label, from: p.fromWeek, to: p.toWeek, weekly: p.weekly });
    }
    const rows = merged.map((p) => [p.label, `${h.num(p.from + 1)} to ${h.num(p.to)}`, h.m2(p.weekly), h.m((p.weekly * W) / M)]);
    const half = h.E.sickGap({ ...CASE, fullWeeks: 13, halfWeeks: 13 });
    return `
<h2>What comes in, month by month, if you cannot work</h2>
<p>The table follows the example above, counted in weeks from the first day off. First your employer’s own sick pay, if your contract gives any. Then the legal minimum, Statutory Sick Pay (SSP), until week ${h.P.ssp.maxWeeks}. Then ${h.src('gov_esa', 'New Style ESA')} (Employment and Support Allowance), if you have paid enough National Insurance, for up to one year in most cases. Then nothing.</p>
${h.table(['What is paid', 'Weeks', 'A week', 'A month'], rows, `Employee of ${CASE.age} on ${h.m(CASE.monthlyPay)} a month, with ${CASE.fullWeeks} weeks of full company sick pay. Under 25, New Style ESA pays less for its first ${h.P.esa.assessmentWeeks} weeks. Amounts before tax, government rates for ${h.P.taxYear}.`, ['l', 'l', 'r', 'r'])}
<p>The last line, £0, is the one people rarely see written down. Universal Credit may follow, but it counts a partner’s earnings and most savings.</p>
<p>Close to retirement, New Style ESA can only be claimed under State Pension age, and a policy stops at the age chosen when it is bought. From then on, the State Pension takes over if your National Insurance record qualifies.</p>

<h2>A generous scheme changes the picture</h2>
<p>Many public sector and large private employers pay full salary for months, then half. With ${13} weeks of full pay and ${13} of half pay instead of ${CASE.fullWeeks} weeks, the same household’s two-year shortfall falls to ${h.m(half.shortfall)}. The ${h.a('income-protection-deferred-period', 'deferred period page')} shows how to start a policy when such a scheme ends, so that you do not pay for months the employer already covers.</p>

<h2>Reading an income protection policy, not a price</h2>
<p>This site shows no premiums: no insurer publishes prices that may be reused here, and every quote depends on your job and health. What you can compare from a policy summary, without giving your details, is its shape:</p>
<ul><li>when it pays: if you cannot do your own job, any suited job, or everyday tasks;</li><li>the waiting time before it pays (the deferred period);</li><li>how long each claim can last: two years, or until retirement;</li><li>whether the monthly amount rises with prices, and whether the premium is fixed or can be raised later (reviewable).</li></ul>
<p>Self-employed people have no company scheme and no SSP; their own ${h.a('self-employed-income-protection', 'timeline')} starts straight at New Style ESA.</p>

<p>From ${h.D.ssp}, ${h.src('gov_ssp_2026', 'GOV.UK’s guidance')} sets out two changes to Statutory Sick Pay. It is now paid from the first day of sickness, where it used to start only after unpaid waiting days, and the Lower Earnings Limit no longer shuts anyone out: a low earner who used to get nothing now gets ${h.pc(h.P.ssp.earningsShare)} of average weekly earnings, capped at the flat rate. For most full-time employees the weekly amount is the flat ${h.m2(h.P.ssp.weekly)}, and the ${h.P.ssp.maxWeeks}-week limit is unchanged. So the reform helps with short absences and low pay; it does nothing for the months after week ${h.P.ssp.maxWeeks}, which is where a long absence becomes expensive.</p>
`;
  },
});
