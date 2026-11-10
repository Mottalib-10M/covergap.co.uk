import { definePage } from '../../lib/guide-types';

const LIFE = 200000, CI = 200000;

export default definePage({
  id: 'life-and-critical-illness-cover',
  group: 'income',
  order: 150,
  tool: { kind: 'mini:lifeci', props: { life: 200000, ci: 200000, combined: 1 } },
  related: ['critical-illness-cover', 'home', 'term-life-insurance', 'mortgage-life-insurance'],
  sources: ['ons_nlt', 'gov_valuing', 'gov_bsp'],
  slug: 'life-and-critical-illness-cover',
  nav: 'Life and critical illness',
  card: 'A combined policy pays once, on the first claim. What is left for the family afterwards, against separate policies.',
  title: 'Life and Critical Illness Cover 2026: One Payout or Two',
  description: 'Life and critical illness cover in 2026: why a combined policy pays once, on the first claim, what is left for the family, and how separate policies compare.',
  h1: 'Life and critical illness cover: combined or separate',
  intro: 'Sold as one policy, life and critical illness cover often pays only once. Choose combined or separate and see what the family would receive after each kind of claim.',
  resume: (h) => {
    const p = h.odds(40, 25, 'm');
    return `Life and critical illness cover is often sold as one combined policy, sometimes called accelerated cover. It pays its sum assured (the amount it pays out) once, on whichever valid claim comes first: a critical illness claim during the insured person’s life, or a death claim. After a critical illness payout of the full amount, the policy ends and there is no life cover left. With ${h.m(LIFE)} of life cover and ${h.m(CI)} of critical illness cover combined, a family that claimed for a critical illness and later suffered a death in the same term would receive ${h.m(Math.max(LIFE, CI))} in all. With separate policies of the same sums, they would receive ${h.m(LIFE + CI)}. Combined cover usually costs less for the same sums, because it can only pay once. The odds of the death claim alone, for a man of 40 over 25 years, are ${h.pc(p)} on official UK death statistics (ONS life tables).`;
  },
  faqs: (h) => [
    { q: 'What does accelerated critical illness cover mean?', a: 'It means the critical illness benefit is paid early out of the life cover, so a claim reduces or ends the life cover by the same amount. If the critical illness sum is lower than the life sum, the difference stays as life cover. A standalone critical illness policy, by contrast, is separate from the life cover, and a claim on one leaves the other untouched.' },
    { q: 'Can I have more life cover than critical illness cover on one policy?', a: `Often, yes. A combined policy can carry ${h.m(LIFE)} of life cover with a smaller critical illness sum, for example ${h.m(100000)}. A critical illness claim then pays ${h.m(100000)} and leaves ${h.m(LIFE - 100000)} of life cover in force. Setting the two sums separately is one way of keeping some protection for the family after a living claim.` },
    { q: 'Is life and critical illness cover the same as income protection?', a: 'No. Both life and critical illness cover pay lump sums: one on death, the other on a claim that meets the policy definition. Income protection pays a monthly benefit while the insured person cannot work. A household can hold all three, and each fills a different gap: debts and the family’s future, a one-off cost while alive, and lost pay.' },
  ],
  body: (h) => {
    const cis = [50000, 100000, 150000, 200000];
    const rows = cis.map((c) => [h.m(c), h.m(c), h.m(Math.max(0, LIFE - c)), h.m(Math.max(LIFE, c)), h.m(LIFE + c)]);
    const bsp = h.E.bsp('married', true);
    return `
<h2>Combined against separate cover, for different critical illness sums</h2>
<p>The table keeps ${h.m(LIFE)} of life cover and varies the critical illness sum. A combined policy pays the critical illness sum on a living claim and keeps only the rest as life cover; separate policies keep the whole life cover. The two “Total if both claims” lines show what the family receives if both kinds of claim happen within the term.</p>
${h.table(['Critical illness sum', 'Paid on a critical illness claim', 'Life cover left (combined)', 'Total if both claims, combined', 'Total if both claims, separate'], rows, `Life cover ${h.m(LIFE)} in each case. Sums are your own choice.`, ['r', 'r', 'r', 'r', 'r'])}

<h2>Why the order of claims matters</h2>
<p>If the first claim is a death, a combined policy pays the life sum and both covers end; separate policies pay the life sum, and the critical illness policy ends too, because there is no one left to claim for. So the difference between the two designs only appears when a living claim comes first. In that case, the family that held separate policies still has life cover at the old price, while the family with a combined policy may need new cover at an older age, if any insurer will offer it after the claim.</p>

<h2>Deciding between them</h2>
<p>Combined cover is the cheaper way to hold both protections, and for a couple whose main worry is the mortgage, one payout may be enough whichever event comes first. Separate cover costs more but keeps protection in place after a living claim. Some households choose a combined policy with a smaller critical illness sum, which keeps part of the life cover after a living claim at a cost between the two. The ${h.a('critical-illness-cover', 'critical illness page')} compares a lump sum with income protection in months of outgoings, and the odds of a death claim at each age are on the ${h.a('life-insurance-by-age', 'life insurance by age')} page, from the ${h.src('ons_nlt', 'ONS tables')}.</p>
<p>Whatever the design, write the life part in trust where the policy allows it, so that a death claim reaches the family directly.</p>

<p>The life cover protects the same things as a plain term policy: the mortgage, the family’s income and any lump sums for the children. Against those, a married partner with a child for whom Child Benefit is paid can count ${h.src('gov_bsp', 'Bereavement Support Payment')} of ${h.m(bsp.total)}. The ${h.a('home', 'life cover calculator')} adds it all up. A payout to the estate counts in it, as ${h.src('gov_valuing', 'GOV.UK’s estate valuation guide')} lists life insurance among the assets, so a trust is worth considering for either design.</p>
`;
  },
});
