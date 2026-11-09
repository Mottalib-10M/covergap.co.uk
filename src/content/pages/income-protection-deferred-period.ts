import { definePage } from '../../lib/guide-types';

const CASE = { monthlyPay: 3200, monthlyNeed: 2300, fullWeeks: 13, halfWeeks: 13, age: 40, employee: true, savings: 6000 };

export default definePage({
  id: 'income-protection-deferred-period',
  group: 'income',
  order: 120,
  tool: { kind: 'mini:deferred', props: { pay: 3200, full: 13, half: 13, need: 2300, sav: 6000 } },
  related: ['income-protection-insurance', 'statutory-sick-pay-income-protection', 'self-employed-income-protection', 'critical-illness-cover'],
  sources: ['gov_ssp', 'gov_esa', 'gov_rates'],
  slug: 'income-protection-deferred-period',
  nav: 'Deferred period',
  card: 'Where your company sick pay and savings run out, and which deferred period would start paying at that point.',
  title: 'Income Protection Deferred Period 2026: Match Your Sick Pay',
  description: 'Income protection deferred period for 2026: find the week your company sick pay and savings run out, and set the policy to start paying then, not before.',
  h1: 'Income protection deferred period: when should the policy start paying?',
  intro: 'The income protection deferred period is the wait before the policy pays. Enter your company sick pay scheme, your outgoings and your savings. The calculator shows the week your money runs short.',
  resume: (h) => {
    const g = h.E.sickGap(CASE);
    return `The deferred period of an income protection policy is the time between stopping work and the first payment. Common choices run from four weeks to a year, and the longer it is, the lower the premium, because short absences are far more frequent than long ones. The usual way to choose it is to start the policy when your other income stops. Take an employee on ${h.m(CASE.monthlyPay)} a month whose employer pays ${CASE.fullWeeks} weeks of full pay and ${CASE.halfWeeks} weeks of half pay, with ${h.m(CASE.monthlyNeed)} of monthly outgoings and ${h.m(CASE.savings)} set aside. Full pay ends after week ${CASE.fullWeeks}; after week ${CASE.fullWeeks + CASE.halfWeeks} only state benefits remain. On this case the savings run out in week ${g.savingsGoneWeek === null ? 'none' : h.num(g.savingsGoneWeek + 1)}, so a policy deferred to the end of company pay, ${CASE.fullWeeks + CASE.halfWeeks} weeks, would start before the money is gone.`;
  },
  faqs: (h) => [
    { q: 'What is the most common deferred period for income protection?', a: 'There is no single answer, because it should follow your own sick pay and savings. Employees with generous company schemes often choose 13 or 26 weeks, or longer, so that the policy starts when full or half pay ends. Self-employed people with little saved tend to choose a short one, because nothing replaces their income from the first day.' },
    { q: 'Can I change the deferred period later?', a: 'Lengthening it lowers the premium and the insurer’s risk, so it is the easier change to ask for. Shortening it means the insurer takes on more risk, so it will normally ask about your health again and may refuse or charge more. Choosing the period against your current sick pay scheme and reviewing it when you change job keeps the policy in step.' },
    { q: 'Does the deferred period start again if I go back to work and fall ill again?', a: `Many policies have a linked claims rule: if the same condition returns within a set time after you go back, the claim restarts without a new deferred period. The time and the conditions differ between insurers, so they are in the policy wording. Statutory Sick Pay has its own rule, linking absences less than ${h.P.ssp.linkGapWeeks} weeks apart.` },
  ],
  body: (h) => {
    const tl = h.E.sickTimeline(CASE);
    const W = h.P.weeksPerYear, M = h.P.monthsPerYear;
    const rows = tl.map((p) => [p.label, `${h.num(p.fromWeek + 1)} to ${h.num(p.toWeek)}`, h.m((p.weekly * W) / M), h.m(CASE.monthlyNeed - (p.weekly * W) / M)]);
    const options = [4, 13, 26, 52];
    const opt = options.map((d) => { const g = h.E.sickGap({ ...CASE, ipMonthly: 1600, deferredWeeks: d }); return [`${d} weeks`, h.m(g.shortfall), g.savingsGoneWeek === null ? 'not in two years' : `week ${h.num(g.savingsGoneWeek + 1)}`]; });
    return `
<h2>The phases of this employee’s income</h2>
<p>Company sick pay comes first, at full and then half pay, with ${h.src('gov_ssp', 'Statutory Sick Pay')} included in it. Once company pay ends, ${h.src('gov_esa', 'New Style ESA')} is assumed to follow at the assessment rate, if the National Insurance record qualifies. The last column is the monthly shortfall against outgoings in each phase.</p>
${h.table(['Phase', 'Weeks', 'A month', 'Short each month'], rows, `Pay ${h.m(CASE.monthlyPay)} a month, ${CASE.fullWeeks} weeks full and ${CASE.halfWeeks} weeks half pay, outgoings ${h.m(CASE.monthlyNeed)}. DWP rates ${h.P.taxYear}, before tax.`, ['l', 'l', 'r', 'r'])}

<h2>Four income protection deferred periods compared</h2>
<p>The next table adds a policy of ${h.m(1600)} a month with each of four common deferred periods and shows the two-year shortfall that remains and the week the savings would run out. A four-week period duplicates months the employer already pays; fifty-two weeks leaves the half-pay and ESA months to savings that do not stretch that far.</p>
${h.table(['Deferred period', 'Shortfall left over two years', 'Savings run out'], opt, `Same employee, savings ${h.m(CASE.savings)}, policy benefit ${h.m(1600)} a month.`, ['l', 'r', 'l'])}

<h2>How people usually decide</h2>
<p>Three dates set the choice: the end of full company pay, the end of all company pay, and the point at which savings would be gone at the shortfall shown in the first table. A deferred period at the earliest of the three leaves no month without income; one at the latest is the cheapest that still avoids running out of money, if the savings would really be kept for this purpose. Where the savings are also the emergency fund for a boiler or a car, many people count only part of them.</p>

<h2>What the state rates mean for the choice</h2>
<p>The state pays most in the first months and least afterwards. Statutory Sick Pay is ${h.m2(h.P.ssp.weekly)} a week at most; the ${h.src('gov_rates', 'DWP rates')} put the ESA assessment rate at ${h.m2(h.P.esa.assessment25)} and the work-related activity group at ${h.m2(h.P.esa.wrag)}, which stops after ${h.P.esa.wragDays} days. Because the state support thins out over time, the cost of a long deferred period is borne in the hardest months. The ${h.a('income-protection-insurance', 'full timeline')} lets you enter any benefit and period.</p>
<h2>A worked choice for this employee</h2>
<p>On these figures, a policy starting at week ${CASE.fullWeeks} would overlap the half-pay months and cost more than needed for the first part of an absence. A policy starting at week ${CASE.fullWeeks + CASE.halfWeeks} begins as company pay ends, so the savings only have to cover the half-pay shortfall, which they do. A policy starting at week 52 leaves half a year of state benefits alone, which the savings would not cover. So the choice here is between the second and the third, and the second is the one that leaves no month in which the household runs out of money. Changing a single figure, such as the savings or the weeks of half pay, can move the answer, which is why the calculator is set to your own scheme.</p>
`;
  },
});
