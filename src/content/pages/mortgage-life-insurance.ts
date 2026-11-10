import { definePage } from '../../lib/guide-types';
import { COVER_DEFAULTS, DEFAULT_AGE } from '../../lib/cover-defaults';

// Same loan as the main calculator's example, same age as every calculator of the site.
const LOAN = COVER_DEFAULTS.mortgage, RATE = 0.045, YEARS = 25, AGE = DEFAULT_AGE;

export default definePage({
  id: 'mortgage-life-insurance',
  group: 'life',
  order: 30,
  tool: { kind: 'mini:mortgage', props: { loan: COVER_DEFAULTS.mortgage, rate: 4.5, years: 25, at: 10 } },
  related: ['term-life-insurance', 'joint-life-insurance', 'home', 'life-insurance-in-trust'],
  sources: ['ons_nlt', 'gov_valuing', 'gov_trusts'],
  slug: 'mortgage-life-insurance',
  nav: 'Mortgage life insurance',
  card: 'What a repayment mortgage still owes year by year, and how decreasing and level cover compare against it.',
  title: 'Mortgage Life Insurance 2026: Decreasing or Level Cover',
  description: 'Mortgage life insurance in 2026: what a repayment mortgage still owes each year, how decreasing cover tracks it, and when level cover fits the loan better.',
  h1: 'Mortgage life insurance: matching the cover to the balance',
  intro: 'Mortgage life insurance has to clear what would still be owed. Enter the loan, the rate and the years left to see that balance at any point.',
  resume: (h) => {
    const b10 = h.E.mortgageBalance(LOAN, RATE, YEARS, 10);
    // Brief of 2026-11-10 (rule 3): one sentence, one figure; the calculator's own case.
    return `Mortgage life insurance is term cover set up to repay a home loan if a borrower dies before it is paid off. Most is sold as decreasing term cover: the sum it would pay falls each year, roughly in line with a capital repayment mortgage. The loan falls slowly at first, because early payments go mostly on interest. Take the example in the calculator, a ${h.m(LOAN)} repayment mortgage over ${YEARS} years. After ten years, ${h.m(b10)} is still owed. A decreasing policy follows that curve, so the insurer’s risk shrinks and the monthly price is lower than for level cover, which pays the full loan all along. Lenders often ask whether you have cover but cannot insist that you buy theirs: any insurer’s policy that clears the balance does the job. The table below shows what is still owed in each year of the loan, and what level cover would leave the family on top.`;
  },
  faqs: (h) => [
    { q: 'Do I legally need life insurance to get a mortgage?', a: 'No. It is not a legal requirement in the UK, and lenders usually do not make it a condition of a residential loan, though some ask about it. It matters most when someone else depends on the home: a partner who could not keep up the payments alone, or children. A single borrower with no dependants may decide that the house sale would clear the debt.' },
    { q: 'What rate does a decreasing life policy assume?', a: `Each policy reduces its sum on a schedule set by the insurer, often by assuming a mortgage interest rate. If your real rate is higher, the loan falls more slowly than the cover and a gap opens. Enter your own rate in the calculator, then compare the balance after ten or fifteen years with the sum the policy schedule shows for the same year.` },
    { q: 'Should a couple with a joint mortgage get one policy or two?', a: `A joint policy pays once, at the first death, which clears the loan and then ends. Two single policies can both pay, and the survivor keeps their own cover afterwards. For a couple of 35 and 33 over ${YEARS} years, the odds that at least one of them dies within the term are ${h.pc(h.E.jointChances(35, 'm', 33, 'f', YEARS).atLeastOne)} on the ONS tables.` },
  ],
  body: (h) => {
    const ys = [0, 5, 10, 15, 20, 25];
    // Year 25 is the last payment: the policy ends with the loan, so it pays nothing above the debt then.
    const rows = ys.map((t) => { const b = h.E.mortgageBalance(LOAN, RATE, YEARS, t); const fin = t >= YEARS; return [fin ? `Year ${t}, last payment` : `Year ${t}`, h.m(b), fin ? 'nothing' : h.pc(b / LOAN), fin ? 'nothing: the policy ends with the loan' : h.m(LOAN - b)]; });
    const pay = h.E.mortgagePayment(LOAN, RATE, YEARS);
    const hi = h.E.mortgageBalance(LOAN, 0.06, YEARS, 12), lo = h.E.mortgageBalance(LOAN, RATE, YEARS, 12);
    return `
<h2>How a repayment mortgage falls</h2>
<p>The monthly mortgage payment on this loan is ${h.m(pay)}. At the start, most of it is interest; by the end, almost all of it is capital. So the balance falls slowly for the first decade and fast in the last one. A policy of the full loan bought as level cover pays far more than the debt in the later years, which is money for the family rather than the lender.</p>
${h.table(['Year of the loan', 'Still owed', 'Share of the loan', `Left for the family with level cover of ${h.m(LOAN)}`], rows, `${h.m(LOAN)} capital repayment mortgage at ${h.pc(RATE)} over ${YEARS} years, monthly payments.`, ['l', 'r', 'r', 'r'])}

<h2>When the rate moves</h2>
<p>A decreasing policy’s sum follows a schedule fixed when it starts. Mortgage rates do not stay fixed for 25 years. If the rate rises to ${h.pc(0.06)} for the whole term, the same loan still owes ${h.m(hi)} after twelve years instead of ${h.m(lo)}: the cover can fall faster than the debt. People who expect to remortgage several times sometimes choose a decreasing schedule built on a higher assumed rate, or level cover for part of the loan, so that the policy never falls below the balance.</p>

<h2>Mortgage life insurance: trust or estate</h2>
<p>A policy that pays the lender directly clears the debt; one paid to the estate is part of it, as ${h.src('gov_valuing', 'GOV.UK’s guide to valuing an estate')} shows, and waits for probate (the legal process of settling the estate). Writing the policy in trust (on a form the insurer provides, naming who receives the money), under the rules GOV.UK sets out for ${h.src('gov_trusts', 'trusts')}, lets the trustees use the money at once. The ${h.a('life-insurance-in-trust', 'trust page')} shows the tax at stake.</p>
<p>The odds that this cover is ever claimed are low, as the official UK death statistics, the ${h.src('ons_nlt', 'ONS life tables')}, show for every age. The cost of being without it, for a family that could not keep the home, is what makes it worth looking at.</p>

<p>An interest-only loan owes the full amount until the last day, so decreasing cover does not fit it at all. A part-and-part mortgage needs level cover for the interest-only part and can use decreasing cover for the repayment part. The calculator above models the repayment part only.</p>

<p>Before buying a mortgage policy, add up what would already be paid on a death: death in service from an employer, an older policy, and savings. If those cover the balance, a new policy only adds a second payout. The ${h.a('home', 'life cover calculator')} counts them, together with the family’s income need, which a mortgage policy alone does not touch.</p>
`;
  },
});
