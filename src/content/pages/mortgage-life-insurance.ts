import { definePage } from '../../lib/guide-types';

const LOAN = 200000, RATE = 0.045, YEARS = 25;

export default definePage({
  id: 'mortgage-life-insurance',
  group: 'life',
  order: 30,
  tool: { kind: 'mini:mortgage', props: { loan: 200000, rate: 4.5, years: 25, at: 10 } },
  related: ['term-life-insurance', 'joint-life-insurance', 'home', 'life-insurance-in-trust'],
  sources: ['ons_nlt', 'gov_valuing', 'gov_trusts'],
  slug: 'mortgage-life-insurance',
  nav: 'Mortgage life insurance',
  card: 'What a repayment mortgage still owes year by year, and how decreasing and level cover compare against it.',
  title: 'Mortgage Life Insurance 2026: Decreasing or Level Cover',
  description: 'Mortgage life insurance in 2026: what a repayment mortgage still owes each year, how decreasing cover tracks it, and when level cover fits the loan better.',
  h1: 'Mortgage life insurance: matching the cover to the balance',
  intro: 'Enter the loan, the rate and the years left. The calculator shows what would still be owed at any point, which is what the cover has to clear.',
  resume: (h) => {
    const b10 = h.E.mortgageBalance(LOAN, RATE, YEARS, 10), b20 = h.E.mortgageBalance(LOAN, RATE, YEARS, 20);
    const p = h.odds(35, YEARS, 'm');
    return `Mortgage life insurance is term cover set up to repay a home loan if a borrower dies before it is paid off. Most is sold as decreasing term cover, whose sum assured falls each year roughly in line with a capital repayment mortgage. On a ${h.m(LOAN)} loan at ${h.pc(RATE)} over ${YEARS} years, the balance is still ${h.m(b10)} after ten years and ${h.m(b20)} after twenty, because early payments go mostly on interest. A decreasing policy follows that curve, so the insurer’s exposure shrinks and the premium is lower than for level cover of the full loan. For a man of 35, the ONS life tables put the chance of a claim within those ${YEARS} years at ${h.pc(p)}. Lenders often ask for cover but cannot insist that you buy theirs: any insurer’s policy that clears the balance does the job.`;
  },
  faqs: (h) => [
    { q: 'Do I legally need life insurance to get a mortgage?', a: 'No. It is not a legal requirement in the UK, and lenders usually do not make it a condition of a residential loan, though some ask about it. It matters most when someone else depends on the home: a partner who could not keep up the payments alone, or children. A single borrower with no dependants may decide that the house sale would clear the debt.' },
    { q: 'What rate does a decreasing life policy assume?', a: `Each policy reduces its sum on a schedule set by the insurer, often by assuming a mortgage interest rate. If your real rate is higher, the loan falls more slowly than the cover and a gap opens. Enter your own rate in the calculator, then compare the balance after ten or fifteen years with the sum the policy schedule shows for the same year.` },
    { q: 'Should a couple with a joint mortgage get one policy or two?', a: `A joint policy pays once, at the first death, which clears the loan and then ends. Two single policies can both pay, and the survivor keeps their own cover afterwards. For a couple of 35 and 33 over ${YEARS} years, the odds that at least one of them dies within the term are ${h.pc(h.E.jointChances(35, 'm', 33, 'f', YEARS).atLeastOne)} on the ONS tables.` },
  ],
  body: (h) => {
    const ys = [0, 5, 10, 15, 20, 25];
    const rows = ys.map((t) => { const b = h.E.mortgageBalance(LOAN, RATE, YEARS, t); return [`Year ${t}`, h.m(b), h.pc(b / LOAN), h.m(LOAN - b)]; });
    const pay = h.E.mortgagePayment(LOAN, RATE, YEARS);
    const hi = h.E.mortgageBalance(LOAN, 0.06, YEARS, 12), lo = h.E.mortgageBalance(LOAN, RATE, YEARS, 12);
    return `
<h2>How a repayment mortgage falls</h2>
<p>The monthly payment on this loan is ${h.m(pay)}. At the start, most of it is interest; by the end, almost all of it is capital. So the balance falls slowly for the first decade and fast in the last one. A policy of the full loan bought as level cover pays far more than the debt in the later years, which is money for the family rather than the lender.</p>
${h.table(['Point in the term', 'Still owed', 'Share of the loan', 'Level cover above the debt'], rows, `${h.m(LOAN)} capital repayment mortgage at ${h.pc(RATE)} over ${YEARS} years, monthly payments.`, ['l', 'r', 'r', 'r'])}

<h2>When the rate moves</h2>
<p>A decreasing policy’s sum follows a schedule fixed when it starts. Mortgage rates do not stay fixed for 25 years. If the rate rises to ${h.pc(0.06)} for the whole term, the same loan still owes ${h.m(hi)} after twelve years instead of ${h.m(lo)}: the cover can fall faster than the debt. People who expect to remortgage several times sometimes choose a decreasing schedule built on a higher assumed rate, or level cover for part of the loan, so that the policy never falls below the balance.</p>

<h2>Interest-only and part-and-part loans</h2>
<p>An interest-only loan owes the full amount until the last day, so decreasing cover does not fit it at all. A part-and-part mortgage needs level cover for the interest-only part and can use decreasing cover for the repayment part. The calculator above models the repayment part only.</p>

<h2>Cover that already exists</h2>
<p>Before buying a mortgage policy, add up what would already be paid on a death: death in service from an employer, an older policy, and savings. If those cover the balance, a new policy only adds a second payout. The ${h.a('home', 'life cover calculator')} counts them, together with the family’s income need, which a mortgage policy alone does not touch.</p>

<h2>Trust or estate</h2>
<p>A policy that pays the lender directly clears the debt; one paid to the estate is part of it, as ${h.src('gov_valuing', 'GOV.UK’s guide to valuing an estate')} shows, and waits for probate. Writing the policy in trust, under the rules GOV.UK sets out for ${h.src('gov_trusts', 'trusts')}, lets the trustees use the money at once. The ${h.a('life-insurance-in-trust', 'trust page')} shows the tax at stake.</p>
<p>The odds that this cover is ever claimed are low, as the ${h.src('ons_nlt', 'ONS life tables')} show for every age. The cost of being without it, for a family that could not keep the home, is what makes it worth looking at.</p>
`;
  },
});
