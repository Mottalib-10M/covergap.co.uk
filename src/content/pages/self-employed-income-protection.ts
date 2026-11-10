import { definePage } from '../../lib/guide-types';

import { DEFAULT_AGE } from '../../lib/cover-defaults';

const AGE = DEFAULT_AGE, NEED = 2200, SAV = 8000;

export default definePage({
  id: 'self-employed-income-protection',
  group: 'income',
  order: 130,
  tool: { kind: 'mini:selfemp', props: { age: AGE, need: NEED, sav: SAV, sup: 0 } },
  related: ['income-protection-insurance', 'income-protection-deferred-period', 'critical-illness-cover', 'key-person-insurance'],
  sources: ['gov_esa', 'gov_rates', 'gov_uc', 'ittoia_735'],
  slug: 'self-employed-income-protection',
  nav: 'Self-employed cover',
  card: 'No sick pay at all: what the state benefit for people too ill to work pays a self-employed person, how long savings last, and the gap left.',
  title: 'Self-Employed Income Protection 2026/27: No Sick Pay Gap',
  description: 'Self-employed income protection for 2026/27: no Statutory Sick Pay, what New Style ESA pays and for how long, how long savings last and the gap a policy covers.',
  h1: 'Self-employed: income protection when there is no sick pay',
  intro: 'Self-employed income protection starts from less: without an employer there is no company sick pay and no Statutory Sick Pay. The calculator starts the state support at New Style ESA (Employment and Support Allowance), the state benefit for people too ill to work.',
  resume: (h) => {
    const g = h.E.sickGap({ monthlyPay: 0, monthlyNeed: NEED, fullWeeks: 0, halfWeeks: 0, age: AGE, employee: false, savings: SAV });
    const W = h.P.weeksPerYear, M = h.P.monthsPerYear;
    return `Self-employed people get no Statutory Sick Pay, because SSP is paid by an employer. If illness or injury stops the work, the state support is New Style ESA, which a self-employed person can claim if they have paid enough National Insurance, usually over the last two or three years. It starts at the assessment rate of ${h.m2(h.P.esa.assessment25)} a week from age 25, about ${h.m((h.P.esa.assessment25 * W) / M)} a month, for ${h.P.esa.assessmentWeeks} weeks, then ${h.m2(h.P.esa.wrag)} a week in the work-related activity group (people expected to work again) for up to ${h.P.esa.wragDays} days in all, or ${h.m2(h.P.esa.support)} in the support group. For someone of ${AGE} with ${h.m(NEED)} of monthly outgoings and ${h.m(SAV)} saved, the savings are gone by week ${g.savingsGoneWeek === null ? 'none' : h.num(g.savingsGoneWeek + 1)}, and the two-year shortfall is ${h.m(g.shortfall)}. That is the gap an income protection policy with a short waiting time before it pays (deferred period) is meant to fill.`;
  },
  faqs: (h) => [
    { q: 'Can a self-employed person claim New Style ESA?', a: 'Yes. GOV.UK says you can apply if you are employed, self-employed or unemployed, as long as you have worked and paid enough National Insurance contributions, usually in the last two to three years, with credits also counting. A work capability assessment then decides which group you are placed in. Check your National Insurance record for gaps before relying on it.' },
    { q: 'How do insurers work out income protection for the self-employed?', a: 'Usually on taxable profit, or for company directors on salary and dividends, averaged over recent years from tax returns or accounts. A year of low profit can therefore cut the benefit you can insure. Because there is no employer to pay the first weeks, self-employed policies often have short deferred periods, at a higher premium.' },
    { q: 'Is income protection a business expense if I am self-employed?', a: 'UK tax law makes the benefit of a health or employment insurance policy free of income tax only when no part of the premiums was deducted in working out taxable income. Deducting the premiums and receiving the benefit tax free do not go together. A limited company paying a policy for its director is treated differently, and an accountant can say how.' },
  ],
  body: (h) => {
    const W = h.P.weeksPerYear, M = h.P.monthsPerYear;
    const tl = h.E.sickTimeline({ monthlyPay: 0, fullWeeks: 0, halfWeeks: 0, age: AGE, employee: false });
    const rows = tl.map((p) => [p.label, `${h.num(p.fromWeek + 1)} to ${h.num(p.toWeek)}`, h.m2(p.weekly), h.m((p.weekly * W) / M), h.m(NEED - (p.weekly * W) / M)]);
    const sup = h.E.sickGap({ monthlyPay: 0, monthlyNeed: NEED, fullWeeks: 0, halfWeeks: 0, age: AGE, employee: false, support: true });
    const ip = h.E.sickGap({ monthlyPay: 0, monthlyNeed: NEED, fullWeeks: 0, halfWeeks: 0, age: AGE, employee: false, ipMonthly: 1800, deferredWeeks: 4 });
    return `
<h2>What the state pays a self-employed person</h2>
<p>The table follows ${h.src('gov_esa', 'New Style ESA')} at the ${h.src('gov_rates', 'government rates')} for ${h.P.taxYear}, assuming the National Insurance record qualifies and the work-related activity group after the assessment. The last column is what is left to find each month against ${h.m(NEED)} of outgoings.</p>
${h.table(['Phase', 'Weeks', 'A week', 'A month', 'Short each month'], rows, `Self-employed, aged ${AGE}, no other income. Before tax.`, ['l', 'l', 'r', 'r', 'r'])}
<p>After ${h.P.esa.wragDays} days in the work-related activity group, contribution-based support stops. From then on only ${h.src('gov_uc', 'Universal Credit')} remains, and it is means-tested. A person placed in the support group keeps ESA at ${h.m2(h.P.esa.support)} a week with no time limit, which cuts the two-year shortfall to ${h.m(sup.shortfall)}.</p>

<h2>The gap with a policy</h2>
<p>With a policy paying ${h.m(1800)} a month after four weeks, the same person’s two-year shortfall falls to ${h.m(ip.shortfall)}. The short deferred period does most of the work: with no employer paying the first months, every week of deferral is a week of outgoings paid from savings. Those who keep several months of spending in cash can choose a longer period and a lower premium; the ${h.a('income-protection-deferred-period', 'deferred period page')} shows the trade-off week by week.</p>

<h2>What to read in a self-employed income protection policy</h2>
<p>How earnings are measured and over how many years; whether the definition of incapacity is your own occupation or any suited work, which matters for skilled trades; whether the benefit is reduced by other income such as rental profits; and how long each claim can last. A policy that pays for one or two years per claim costs less and still covers the period in which the state support is thinnest. Benefits from a policy you pay yourself are free of income tax under ${h.src('ittoia_735', 'tax law')}.</p>

<p>A director who is an employee of their own company can be paid Statutory Sick Pay by the company if they are classed as an employee, at ${h.m2(h.P.ssp.weekly)} a week at most, if the company keeps paying them as an employee. In practice a one-person company often has no income while the director cannot work, so SSP is no real help. Some directors arrange a policy through the company instead, sometimes alongside ${h.a('key-person-insurance', 'key person cover')}; the tax treatment then follows the company rules, not the personal exemption.</p>

<p>GOV.UK says New Style ESA depends on having worked and paid enough National Insurance contributions, usually in the last two to three years, with National Insurance credits also counting. Self-employed people whose profits were low in some years, or who spent time abroad or out of work without credits, should check their record on GOV.UK before relying on it. A gap means the state support in the table above may not be paid at all, and the whole of the shortfall then falls on savings and on any private policy the person holds.</p>
`;
  },
});
