import { definePage } from '../../lib/guide-types';

const CASE = { monthlyPay: 2800, monthlyNeed: 2000, fullWeeks: 4, halfWeeks: 0, age: 40, employee: true };

export default definePage({
  id: 'income-protection-insurance',
  group: 'income',
  order: 100,
  tool: { kind: 'mini:gap', props: { pay: 2800, need: 2000, full: 4, half: 0, ip: 0, def: 13 } },
  related: ['statutory-sick-pay-income-protection', 'income-protection-deferred-period', 'self-employed-income-protection', 'critical-illness-cover'],
  sources: ['gov_ssp', 'gov_ssp_2026', 'gov_esa', 'gov_rates', 'ittoia_735'],
  slug: 'income-protection-insurance',
  nav: 'Income protection gap',
  card: 'Your income week by week through company sick pay, SSP and New Style ESA, and how much income protection would add.',
  title: 'Income Protection Insurance 2026/27: Your Sick Pay Gap',
  description: 'Income protection insurance in 2026/27: what company sick pay, SSP and New Style ESA pay week by week for two years, and the gap a policy would have to fill.',
  h1: 'Income protection: the gap after sick pay and ESA',
  intro: 'Enter your pay, your company sick pay and your monthly outgoings. The timeline follows the state rates for 2026/27 and shows what is left to cover.',
  resume: (h) => {
    const g = h.E.sickGap(CASE);
    const withIp = h.E.sickGap({ ...CASE, ipMonthly: 1500, deferredWeeks: 13 });
    return `Income protection insurance pays a monthly income when illness or injury stops you working, after a waiting time called the deferred period, until you go back, the policy term ends or the benefit period runs out. Before choosing one, it helps to know what you would get without it. Take an employee on ${h.m(CASE.monthlyPay)} a month, with ${CASE.fullWeeks} weeks of full company sick pay and ${h.m(CASE.monthlyNeed)} a month of outgoings. After those weeks comes Statutory Sick Pay of ${h.m2(g.sspWeekly)} a week, until week ${h.P.ssp.maxWeeks}. Then New Style ESA, if the National Insurance record qualifies, at ${h.m2(h.P.esa.assessment25)} a week. Over two years the household receives ${h.m(g.income)} before tax and falls ${h.m(g.shortfall)} short of its outgoings. A policy paying ${h.m(1500)} a month after ${13} weeks would cut that shortfall to ${h.m(withIp.shortfall)}.`;
  },
  faqs: (h) => [
    { q: 'Is income protection insurance worth it if my employer pays sick pay?', a: `It depends on how long the company scheme lasts. Many pay full salary for a few weeks or months, then nothing beyond Statutory Sick Pay of ${h.m2(h.P.ssp.weekly)} a week at most. Enter your scheme in the calculator: if your savings cover the months after it ends, a policy adds little; if the shortfall runs into tens of thousands, that is the gap an income protection policy is designed for.` },
    { q: 'Do I pay tax on income protection payouts?', a: `Not on a policy you pay for yourself. Section 735 of the Income Tax (Trading and Other Income) Act 2005 exempts annual payments from insurance against a health or employment risk when the premiums were not deducted from your taxable income. Group income protection paid for by an employer is different: the benefit is usually paid through payroll and taxed as earnings.` },
    { q: 'How much of my salary can income protection replace?', a: 'Insurers cap the monthly benefit at a share of your earnings before tax, and the share and the cap differ between them, so the policy document or the quote gives the limit. The calculator lets you enter any monthly benefit and shows what it changes; a benefit close to your outgoings rather than your salary is the figure many people aim for.' },
    { q: 'Does income protection affect my benefits if I claim?', a: `It can, and the answer depends on the benefit. New Style ESA is reduced by a private pension of more than ${h.m(h.P.esa.pensionDisregard)} a week, as GOV.UK explains, and Universal Credit takes most other income into account. Tell the DWP about any policy payment when you apply, so the award is right from the start, and ask the insurer whether its benefit is reduced by state payments.` },
  ],
  body: (h) => {
    const tl = h.E.sickTimeline(CASE);
    const W = h.P.weeksPerYear, M = h.P.monthsPerYear;
    const rows = tl.map((p) => [p.label, `${h.num(p.fromWeek + 1)} to ${h.num(p.toWeek)}`, h.m2(p.weekly), h.m((p.weekly * W) / M)]);
    const half = h.E.sickGap({ ...CASE, fullWeeks: 13, halfWeeks: 13 });
    const sup = h.E.sickGap({ ...CASE, support: true });
    return `
<h2>The timeline the calculator follows</h2>
<p>The table sets out the case loaded above, phase by phase. Weeks are counted from the first day off. Company pay is treated as never falling below Statutory Sick Pay while SSP is due, which is how employers normally pay it: SSP is part of the company payment, not on top of it. When SSP ends at week ${h.P.ssp.maxWeeks}, the calculator assumes a claim for ${h.src('gov_esa', 'New Style ESA')} straight away, paid at the assessment rate for ${h.P.esa.assessmentWeeks} weeks and then, in the work-related activity group, for up to ${h.P.esa.wragDays} days in all.</p>
${h.table(['Phase', 'Weeks', 'A week', 'A month'], rows, `Employee on ${h.m(CASE.monthlyPay)} a month, ${CASE.fullWeeks} weeks of full company sick pay, aged ${CASE.age}. Amounts before tax, DWP rates ${h.P.taxYear}.`, ['l', 'l', 'r', 'r'])}
<p>The last line is the one people rarely see written down. Once New Style ESA in the work-related activity group runs out, there is no more contribution-based income at all; what follows depends on Universal Credit, which looks at a partner’s earnings and at savings above ${h.m(h.P.uc.capitalLower)}. For someone placed in the support group after the assessment, ESA continues at ${h.m2(h.P.esa.support)} a week with no end date. On the same pay and outgoings, that changes the two-year shortfall to ${h.m(sup.shortfall)}.</p>

<h2>What changed in April 2026</h2>
<p>From ${h.D.ssp}, ${h.src('gov_ssp_2026', 'GOV.UK’s guidance')} sets out two changes to Statutory Sick Pay. It is now paid from the first day of sickness, where it used to start only after unpaid waiting days, and the Lower Earnings Limit no longer shuts anyone out: a low earner who used to get nothing now gets ${h.pc(h.P.ssp.earningsShare)} of average weekly earnings, capped at the flat rate. For most full-time employees the weekly amount is the flat ${h.m2(h.P.ssp.weekly)}, and the ${h.P.ssp.maxWeeks}-week limit is unchanged. So the reform helps with short absences and low pay; it does nothing for the months after week ${h.P.ssp.maxWeeks}, which is where a long absence becomes expensive.</p>

<h2>A generous scheme changes the picture</h2>
<p>Many public sector and large private employers pay full salary for months, then half. With ${13} weeks of full pay and ${13} of half pay instead of four weeks, the same household’s two-year shortfall falls to ${h.m(half.shortfall)}. The ${h.a('income-protection-deferred-period', 'deferred period page')} shows how to line a policy up with the end of such a scheme, so that you do not pay for months the employer already covers.</p>

<h2>Reading a policy, not a price</h2>
<p>This site shows no premiums, because no insurer publishes prices that may be reused here, and every quote depends on your job and health. What you can compare from a policy summary without giving your details is its shape: the definition of incapacity (your own job, any suited job, or daily tasks), the deferred period, how long each claim can last, whether the benefit rises with inflation and whether the premium is fixed or reviewable. A policy that pays only for two years per claim costs less than one that pays to retirement, and the timeline above shows what each would leave uncovered.</p>
<p>Self-employed people have no company scheme and no SSP; their own ${h.a('self-employed-income-protection', 'timeline')} starts straight at ESA.</p>
`;
  },
});
