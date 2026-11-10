import { definePage } from '../../lib/guide-types';

const MONTHLY = 2000, TERM = 20;

export default definePage({
  id: 'family-income-benefit',
  group: 'life',
  order: 40,
  tool: { kind: 'mini:fib', props: { monthly: 2000, term: 20, claim: 5 } },
  related: ['home', 'term-life-insurance', 'life-insurance-unmarried-couples', 'death-in-service'],
  sources: ['ons_nlt', 'gov_bsp', 'ittoia_735'],
  slug: 'family-income-benefit',
  nav: 'Family income benefit',
  card: 'A monthly income from the claim to the end of the term: what it pays at each point, against a lump sum.',
  title: 'Family Income Benefit 2026: Monthly Life Cover Explained',
  description: 'Family income benefit in 2026: the monthly income it pays from a claim to the end of the term, how the total falls each year, and how it compares to a lump sum.',
  h1: 'Family income benefit: life cover paid as a monthly income',
  intro: 'Instead of one lump sum, the policy pays an income every month until the term ends. Pick a claim year to see what the family would receive in total.',
  resume: (h) => {
    const y1 = h.E.fibTotal(MONTHLY, TERM, 0), y10 = h.E.fibTotal(MONTHLY, TERM, 10), y19 = h.E.fibTotal(MONTHLY, TERM, 19);
    return `Family income benefit is a form of term life insurance that replaces income rather than paying a lump sum. If the insured person dies during the term, the family receives a set amount each month from the claim until the term ends. A policy paying ${h.m(MONTHLY)} a month over ${TERM} years pays ${h.m(y1)} if the claim comes in the first year, ${h.m(y10)} if it comes after ten years and ${h.m(y19)} in the last year. Because the insurer’s total exposure falls every month, the premium is usually lower than for level cover of the same starting total. It matches the shape of what a family loses when an earner dies: a salary paid month by month until the children are grown. Many policies let the income rise each year with inflation, at a higher premium.`;
  },
  faqs: (h) => [
    { q: 'What happens to family income benefit if nobody dies during the term?', a: `Nothing is paid. Like any term policy, it ends on its last day with no refund and no cash value. That is the normal outcome: for a man of 36 over ${TERM} years, the official UK death statistics (ONS life tables) give a ${h.pc(h.odds(36, TERM, 'm'))} chance of a claim, so in most cases the premiums buy only the certainty that the family would have been covered.` },
    { q: 'Can the family take the monthly payments as one lump sum instead?', a: 'Some insurers allow the remaining payments to be converted into a single sum, usually at a discount for paying early, and some do not. It is worth checking before buying, because a lump sum can clear a mortgage at once while monthly payments cannot. The policy wording says whether the option exists and how the sum is worked out.' },
    { q: 'How much monthly income should family income benefit pay?', a: `One way to set it is the monthly spending the household would lose, less what continues: the surviving partner’s own pay, Child Benefit, and the ${h.P.bsp.months} months of Bereavement Support Payment if it is due. The life cover calculator turns a yearly income need into a monthly figure over the same term.` },
  ],
  body: (h) => {
    const years = [0, 5, 10, 15, 19];
    const rows = years.map((t) => [`Year ${t + 1}`, h.m(h.E.fibTotal(MONTHLY, TERM, t)), `${TERM - t} years`]);
    const lumpTotal = h.E.fibTotal(MONTHLY, TERM, 0);
    const p = h.odds(36, TERM, 'm');
    const bsp = h.E.bsp('married', true);
    return `
<h2>The total falls as the term runs</h2>
<p>The table follows a policy of ${h.m(MONTHLY)} a month over ${TERM} years. Each row is a claim in a different year. What the family receives is the monthly sum times the months left, so the policy is worth most at the start, when the children are youngest, and least near the end, when they are close to independence. That is exactly the need it is built for.</p>
${h.table(['Claim in', 'Total paid to the family', 'Payments run for'], rows, `${h.m(MONTHLY)} a month, ${TERM}-year term, level benefit (no yearly increase).`, ['l', 'r', 'r'])}

<h2>Family income benefit against a lump sum policy</h2>
<p>A level term policy of ${h.m(lumpTotal)} would pay that full sum whenever the claim happens. In the last years of the term it pays far more than the family needs, and the insurer charges for that. Family income benefit pays only what the remaining years require. The trade-off is flexibility: a lump sum can clear a mortgage, fund a move or be invested, while a monthly income cannot do any of those without a conversion option. Many families combine the two: decreasing cover for the mortgage and family income benefit for living costs.</p>

<h2>Choosing the monthly figure</h2>
<p>The usual starting point is the take-home income the family would lose, less what would carry on: a partner’s own earnings, any survivor’s pension, and in the first ${h.P.bsp.months} months the Bereavement Support Payment where it is due. Childcare often rises after a death, because the surviving parent may need to work longer hours, so some households add it rather than subtract it. Because the benefit is a fixed monthly sum, a policy that rises each year keeps more of its value over a long term, at a higher premium. The calculator above shows what a claim would pay in total at any year of the term.</p>

<p>How likely is a claim? For a man of 36 over ${TERM} years, the official UK death statistics (${h.src('ons_nlt', 'ONS life tables')}) give a ${h.pc(p)} chance that the policy pays out. The policy is a small regular cost against that probability. The odds at other ages are on the ${h.a('life-insurance-by-age', 'life insurance by age')} page.</p>

<p>A married partner with a child for whom Child Benefit is paid may receive ${h.src('gov_bsp', 'Bereavement Support Payment')} of ${h.m(bsp.lump)} at once and ${h.m(bsp.monthly)} a month for ${h.P.bsp.months} months. It overlaps the start of a family income benefit claim and then stops, so a monthly benefit chosen against long-term spending is rarely changed by it.</p>


`;
  },
});
