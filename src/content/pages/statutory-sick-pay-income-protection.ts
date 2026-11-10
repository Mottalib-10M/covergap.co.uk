import { definePage } from '../../lib/guide-types';

// Page centred on the gap SSP leaves and the cover that fills it (audit of 2026-11-09, A4): the SSP rate
// itself is statutorypay.co.uk's subject, not this site's.
// Testers of 2026-11-09 (second round): the same example as the income protection page (£2,800 a month,
// £2,000 of outgoings), pay asked a month, and the two gaps (against outgoings, against pay) named apart.
import { SICK_DEFAULTS as SD } from '../../lib/cover-defaults';
const PAY = SD.pay, NEED = SD.need;

export default definePage({
  id: 'statutory-sick-pay-income-protection',
  group: 'income',
  order: 110,
  tool: { kind: 'mini:ssp', props: { pay: PAY, need: NEED } },
  related: ['income-protection-insurance', 'income-protection-deferred-period', 'self-employed-income-protection', 'death-in-service'],
  sources: ['gov_ssp', 'gov_ssp_2026', 'gov_rates', 'gov_esa'],
  slug: 'statutory-sick-pay-income-protection',
  nav: 'The gap sick pay leaves',
  card: 'What you would be short each month on sick pay alone, against your own outgoings, and the cover that fills the gap.',
  title: 'Income Protection After Sick Pay 2026/27: Your Monthly Gap',
  description: 'How much income protection you need on top of sick pay in 2026/27: what you would be short each month against your outgoings, and over the weeks of SSP.',
  h1: 'The gap sick pay leaves each month, and the income protection that fills it',
  intro: 'Income protection after sick pay has to fill a monthly gap. Enter your monthly pay and your monthly outgoings: the calculator shows what you would be short each month if only the legal minimum sick pay, Statutory Sick Pay, came in.',
  resume: (h) => {
    const S = h.P.ssp, W = h.P.weeksPerYear, M = h.P.monthsPerYear;
    const sm = (h.E.sspWeekly((PAY * M) / W) * W) / M, short = Math.max(0, NEED - sm);
    // Brief of 2026-11-10 (rules 1 and 3): one sentence, one figure; the period of the gap named with it.
    return `Most employees who fall ill get only the legal minimum, Statutory Sick Pay (SSP), once any company sick pay in their contract has run out. It is paid by the employer for up to ${S.maxWeeks} weeks. For ${h.P.taxYear} it comes to at most ${h.m2(S.weekly)} a week. Set against ordinary outgoings, that leaves a large gap. Take someone earning ${h.m(PAY)} a month before tax who spends ${h.m(NEED)} a month on rent or mortgage, bills and food. During those weeks on SSP alone, they would be ${h.m(short)} short every month. That gap is what income protection insurance is bought to fill: a monthly amount, chosen by the buyer, that starts after a waiting time called the deferred period. Savings, a partner’s pay or a generous employer scheme can fill part of it instead. After week ${S.maxWeeks}, a different state benefit takes over, and the income protection page follows the whole two years.`;
  },
  faqs: (h) => [
    { q: 'How much income protection do I need on top of sick pay?', a: `Start from your monthly outgoings, not your salary. Take off what would still come in: sick pay of about ${h.m((h.P.ssp.weekly * h.P.weeksPerYear) / h.P.monthsPerYear)} a month at most, a partner’s pay you could rely on, and any rent or interest you receive. What is left is the monthly benefit to aim for. Insurers cap the benefit at a share of earnings, so the quote shows how close you can get.` },
    { q: `What happens to my income after ${h.P.ssp.maxWeeks} weeks off sick?`, a: `Sick pay from the employer stops. Your employer must give you form SSP1 so that you can apply for New Style ESA (Employment and Support Allowance) or Universal Credit. New Style ESA starts at ${h.m2(h.P.esa.assessment25)} a week if you are 25 or over and your National Insurance record qualifies. The timeline on the income protection page follows each stage for two years.` },
    { q: 'Is sick pay enough to cover a mortgage?', a: 'Rarely. At the flat weekly rate, a month of Statutory Sick Pay is less than the monthly repayment on many mortgages, before any bills or food. Mortgage payment protection, income protection or savings fill that gap. If you expect to fall behind, telling the lender early leaves more options open than waiting for a missed payment.' },
  ],
  body: (h) => {
    const S = h.P.ssp;
    const ws = [100, 125, 150, 175, 200, 300, 450, 700];
    // Testers of 2026-11-10: “£100”, “£125” read as monthly pay; every line now says “a week”.
    const rows = ws.map((w) => { const s = h.E.sspWeekly(w); return [`${h.m(w)} a week`, h.m2(s), h.pc(s / w), h.m((w - s) * S.maxWeeks)]; });
    const cut = S.weekly / S.earningsShare;
    return `
<h2>How much of your pay sick pay replaces</h2>
<p>Above ${h.m2(cut)} a week of pay, everyone gets the same flat amount, whatever their salary. So the higher the pay, the smaller the share that sick pay replaces.</p>
<p>This table compares sick pay with your <strong>pay</strong>; the calculator above compares it with what you <strong>spend</strong>.</p>
${h.table(['Your usual pay, a week', 'Sick pay a week', 'Share of pay replaced', `Pay lost against your usual pay over ${S.maxWeeks} weeks`], rows, `${h.P.taxYear} rate, read on ${h.src('gov_ssp', 'GOV.UK')} and in the ${h.src('gov_rates', 'government rates table')}. Before tax and National Insurance.`, ['r', 'r', 'r', 'r'])}

<h2>Reading your employer’s scheme against it</h2>
<p>Company sick pay schemes are set by the contract, not by law. A common shape is a number of weeks of full pay followed by a number of weeks of half pay, often growing with length of service. SSP is included in those payments, not added to them. Once company pay ends, SSP continues alone until week ${S.maxWeeks} if any weeks are left. The ${h.a('income-protection-deferred-period', 'deferred period calculator')} uses your scheme to show where your income drops.</p>

<h2>Why Statutory Sick Pay matters when choosing income protection</h2>
<p>A policy with a short waiting time (deferred period) overlaps SSP; one that starts after ${S.maxWeeks} weeks begins where SSP ends and ${h.src('gov_esa', 'New Style ESA')} (Employment and Support Allowance, the state benefit for people too ill to work) takes over at a lower rate. SSP is paid by the employer whatever private cover you hold; for New Style ESA, any policy payment has to be declared when you claim. Because the state pays so little beyond the first months, the longer deferred periods are where the gap is widest. The ${h.a('income-protection-insurance', 'income protection timeline')} adds the policy to the state payments week by week.</p>

<p>${h.src('gov_ssp_2026', 'GOV.UK’s guidance for absences that span the change')} sets out the transition: waiting days no longer apply from ${h.D.ssp}, and an employee who earned too little to qualify before that date becomes entitled. What stayed the same is the length. SSP still runs for ${S.maxWeeks} weeks at most, linked periods of sickness less than ${S.linkGapWeeks} weeks apart still count as one, and a series of linked periods ends entitlement after three years. For a short absence the reform pays more; for a long one it changes almost nothing.</p>

<p>SSP is paid through payroll like wages, so income tax and National Insurance are deducted in the usual way if the total pay is high enough. Whether anything is deducted depends on the total paid in the period, on other pay in the tax year and on your tax code. That is a different treatment from an income protection policy paid for by the employee, whose benefit is free of income tax. When comparing a policy with SSP, compare the policy benefit with SSP after deductions, not before.</p>
`;
  },
});
