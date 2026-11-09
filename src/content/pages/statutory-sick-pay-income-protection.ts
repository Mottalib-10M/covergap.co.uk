import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'statutory-sick-pay-income-protection',
  group: 'income',
  order: 110,
  tool: { kind: 'mini:ssp', props: { weekly: 450 } },
  related: ['income-protection-insurance', 'income-protection-deferred-period', 'self-employed-income-protection', 'death-in-service'],
  sources: ['gov_ssp', 'gov_ssp_2026', 'gov_rates', 'gov_esa'],
  slug: 'statutory-sick-pay-income-protection',
  nav: 'Statutory Sick Pay 2026/27',
  card: 'SSP after the April 2026 reform: the weekly amount for your earnings, the 28-week limit and what it means for cover.',
  title: 'Statutory Sick Pay 2026/27: Rate, 80% Rule and Your Cover',
  description: 'Statutory Sick Pay for 2026/27: the weekly rate, the 80 % of earnings rule from day one, what 28 weeks of SSP add up to, and why it rarely covers a mortgage.',
  h1: 'Statutory Sick Pay 2026/27 and what it leaves uncovered',
  intro: 'Enter your average weekly earnings before tax. The calculator applies the rule in force since the April 2026 reform.',
  resume: (h) => {
    const S = h.P.ssp;
    const low = h.E.sspWeekly(140), mid = h.E.sspWeekly(450);
    return `Statutory Sick Pay is the minimum an employer must pay an employee who is too ill to work. For the ${h.P.taxYear} tax year it is ${h.m2(S.weekly)} a week or ${h.pc(S.earningsShare)} of the employee’s average weekly earnings, whichever is lower, paid from the first day off sick for up to ${S.maxWeeks} weeks. Both rules came in on ${h.D.ssp}: before that date, SSP started only after unpaid waiting days and the lowest earners could not get it at all. Someone earning ${h.m(140)} a week before tax now gets ${h.m2(low)}; anyone earning ${h.m(450)} or more gets the full ${h.m2(mid)}. Over the full ${S.maxWeeks} weeks that is ${h.m(mid * S.maxWeeks)} at most, before tax and National Insurance. For most households that covers a fraction of the rent or mortgage and nothing else, which is the gap income protection and company sick pay schemes exist to fill.`;
  },
  faqs: (h) => [
    { q: 'How much is Statutory Sick Pay a month in 2026/27?', a: `The full weekly rate of ${h.m2(h.P.ssp.weekly)} works out at about ${h.m((h.P.ssp.weekly * h.P.weeksPerYear) / h.P.monthsPerYear)} a month, before income tax and National Insurance, which are deducted like wages. A lower earner gets ${h.pc(h.P.ssp.earningsShare)} of average weekly earnings instead, so less. Your employer may pay more under its own sick pay scheme, but never less than SSP.` },
    { q: 'Can I get SSP from two jobs at the same time?', a: 'Yes. GOV.UK says that if you have more than one job you may get SSP from each employer, as long as you qualify in each one. Each employer works out the amount on the earnings it pays you, so two part-time jobs can bring two payments of up to the flat rate. Income protection policies usually count total earnings from all jobs.' },
    { q: `What do I get after ${h.P.ssp.maxWeeks} weeks of Statutory Sick Pay?`, a: `Nothing more from the employer under SSP rules. Your employer must send form SSP1 so that you can apply for New Style ESA or Universal Credit. New Style ESA starts at ${h.m2(h.P.esa.assessment25)} a week if you are 25 or over and your National Insurance record qualifies. The timeline on the income protection page follows each phase for two years.` },
    { q: 'Do I need a fit note to get Statutory Sick Pay?', a: `For an absence of more than ${h.P.ssp.fitNoteAfterDays} days in a row, including days you would not have worked, your employer can ask for a fit note. GPs, hospital doctors, registered nurses, occupational therapists, pharmacists and physiotherapists can issue one, on paper or digitally. For shorter absences, the employer can accept your own word or other evidence it agrees to.` },
  ],
  body: (h) => {
    const S = h.P.ssp;
    const ws = [100, 125, 150, 175, 200, 300, 450, 700];
    const rows = ws.map((w) => { const s = h.E.sspWeekly(w); return [h.m(w), h.m2(s), h.m((s * h.P.weeksPerYear) / h.P.monthsPerYear), h.m(s * S.maxWeeks)]; });
    const cut = S.weekly / S.earningsShare;
    return `
<h2>SSP at different earnings</h2>
<p>The ${h.pc(S.earningsShare)} rule only bites below average weekly earnings of ${h.m2(cut)}: above that, everyone gets the same flat rate, whatever their salary. So for a full-time employee on an ordinary wage, SSP is a fixed amount that does not move with pay, and the higher the salary, the larger the drop.</p>
${h.table(['Average weekly earnings', 'SSP a week', 'About a month', `Total over ${S.maxWeeks} weeks`], rows, `${h.P.taxYear} rate, read on ${h.src('gov_ssp', 'GOV.UK')} and in the ${h.src('gov_rates', 'DWP rates table')}. Before tax and National Insurance.`, ['r', 'r', 'r', 'r'])}

<h2>What the reform changed, and what it did not</h2>
<p>${h.src('gov_ssp_2026', 'GOV.UK’s guidance for absences that span the change')} sets out the transition: waiting days no longer apply from ${h.D.ssp}, and an employee who earned too little to qualify before that date becomes entitled. What stayed the same is the length. SSP still runs for ${S.maxWeeks} weeks at most, linked periods of sickness less than ${S.linkGapWeeks} weeks apart still count as one, and a series of linked periods ends entitlement after three years. For a short absence the reform pays more; for a long one it changes almost nothing.</p>

<h2>Reading your employer’s scheme against it</h2>
<p>Company sick pay schemes are set by the contract, not by law. A common shape is a number of weeks of full pay followed by a number of weeks of half pay, often growing with length of service. SSP is included in those payments, not added to them. Once company pay ends, SSP continues alone until week ${S.maxWeeks} if any weeks are left. The ${h.a('income-protection-deferred-period', 'deferred period calculator')} uses your scheme to show where your income drops.</p>

<h2>Why SSP matters when choosing cover</h2>
<p>An income protection policy with a short deferred period overlaps SSP; one that starts after ${S.maxWeeks} weeks begins where SSP ends and ${h.src('gov_esa', 'New Style ESA')} takes over at a lower rate. SSP is paid by the employer whatever private cover you hold; for ESA, any policy benefit has to be declared when you claim. Because the state pays so little beyond the first months, the longer deferred periods are where the gap is widest. The ${h.a('income-protection-insurance', 'income protection timeline')} adds the policy to the state payments week by week.</p>
<h2>Tax and National Insurance on SSP</h2>
<p>SSP is paid through payroll like wages, so income tax and National Insurance are deducted in the usual way if the total pay is high enough. Whether anything is deducted depends on the total paid in the period, on other pay in the tax year and on your tax code. That is a different treatment from an income protection policy paid for by the employee, whose benefit is free of income tax. When comparing a policy with SSP, compare the policy benefit with SSP after deductions, not before.</p>
`;
  },
});
