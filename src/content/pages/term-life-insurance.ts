import { definePage } from '../../lib/guide-types';
import { DEFAULT_AGE } from '../../lib/cover-defaults';

const AGE = DEFAULT_AGE, TERM = 25;

export default definePage({
  id: 'term-life-insurance',
  group: 'life',
  order: 20,
  tool: { kind: 'mini:term', props: { age: AGE, term: TERM, sex: 0 } },
  related: ['life-insurance-by-age', 'mortgage-life-insurance', 'family-income-benefit', 'whole-of-life-insurance'],
  sources: ['ons_nlt', 'gov_bsp', 'gov_valuing'],
  slug: 'term-life-insurance',
  nav: 'Term life insurance',
  card: 'Level term cover: the chance of a claim in the first and second half of the term, and why most policies expire unused.',
  title: 'Term Life Insurance 2026: Odds of a Claim Over the Term',
  description: 'Term life insurance with ONS odds for 2026: how often a level term policy pays out, why most expire unused, and how to set the term against the debt it covers.',
  h1: 'Term life insurance: what you are buying, in odds',
  intro: 'Level term life insurance pays a fixed sum if you die within the term (the years the policy lasts) and nothing after it. The calculator shows how often such a policy pays out at your age.',
  resume: (h) => {
    const p = h.odds(AGE, TERM, 'm');
    // Brief of 2026-11-10 (rule 3): one figure, the calculator's own.
    return `Term life insurance covers a set number of years, the term. If the insured person dies within it, the policy pays the agreed sum, the sum assured, usually to whoever is named or to the trustees of a trust. If they are alive at the end, it stops and pays nothing back. A level term policy keeps the same sum for the whole term; decreasing cover falls each year, in step with a repayment mortgage. How often does such a policy pay? For a man of ${AGE} taking level cover for ${TERM} years, the official UK death statistics (the ONS, Office for National Statistics, life tables for 2022 to 2024) give a ${h.pc(p)} chance of a claim. The amount of cover does not change these odds, only the price. Most term policies therefore end unused, which is what keeps them cheaper than whole of life cover, which pays whenever death comes.`;
  },
  faqs: (h) => [
    { q: 'What happens to term life insurance when the term ends?', a: 'It simply stops. There is no cash value, no refund of premiums and no payout if you are alive on the last day. If you still need cover then, a new policy is priced at your new age and health. That is why the term is usually set to the last mortgage payment or the year the youngest child is expected to finish education, not to a round number.' },
    { q: 'Is level or decreasing term better for a mortgage?', a: `Decreasing cover follows a repayment mortgage down and costs less; level cover pays the full original amount whenever the claim happens, so anything above the balance left goes to the family. With an interest-only mortgage the debt never falls, so only level cover matches it. The calculator on the mortgage life insurance page shows the balance left at any year for your interest rate.` },
    { q: 'Can I cancel a term policy and get money back?', a: 'You can stop paying at any time and the cover ends, but a pure term policy has no surrender value, so nothing comes back except any refund of premiums paid in advance. The first weeks after the start are different: a cancellation period applies in which you can withdraw and get the premiums refunded. The policy documents give the exact length.' },
  ],
  body: (h) => {
    const terms = [10, 15, 20, 25, 30, 35];
    const rows = terms.map((t) => [`${t} years`, h.pc(h.odds(30, t, 'm')), h.pc(h.odds(30, t, 'f')), h.pc(h.odds(45, t, 'm')), h.pc(h.odds(45, t, 'f'))]);
    const bsp = h.E.bsp('married', true);
    return `
<h2>How the odds grow with the length of the term</h2>
<p>A longer term adds years at the end, when death rates are highest. So the chance of a claim rises faster than the number of years. Find the line for the length of your policy, then the column for your age and sex.</p>
${h.table(['Term', 'From 30, men', 'From 30, women', 'From 45, men', 'From 45, women'], rows, `Chance the policy pays out, United Kingdom, from the ${h.src('ons_nlt', 'ONS national life tables')} 2022 to 2024 (official death statistics).`, ['l', 'r', 'r', 'r', 'r'])}

<h2>Setting the term to the need</h2>
<p>The question is not how long you want cover but how long someone would be left short without you. For most families, three dates answer it: the last payment of the mortgage, the year the youngest child turns 18 or leaves education, and the State Pension age of the surviving partner, after which their own pension takes over. A term that runs past all three buys years of cover that protect no one, at the most expensive end of the risk curve.</p>
<p>Some families split the cover rather than stretch one policy. A decreasing policy matches the mortgage; a level or ${h.a('family-income-benefit', 'family income benefit')} policy covers the years of child-raising. The ${h.a('home', 'life cover calculator')} adds up the sums for each part.</p>

<h2>Things to check in a term life insurance policy summary</h2>
<p>Four points, all in the short summary every insurer publishes (the key features document), with no quote needed:</p>
<ul><li>whether the monthly price is fixed for the whole term or can be raised later (reviewable);</li><li>whether the payout stays the same (level), falls (decreasing) or rises with prices;</li><li>whether the policy pays early if a doctor says you have less than a year to live (terminal illness cover), as many do;</li><li>what happens if you miss a payment.</li></ul>

<p>A married partner or civil partner with a child for whom Child Benefit is paid can claim ${h.src('gov_bsp', 'Bereavement Support Payment')} of ${h.m(bsp.total)} in all if the person who died paid enough National Insurance. It is worth counting, but it is a bridge of eighteen months, not a replacement income, so it rarely changes the term, only the amount.</p>

<p>A term policy paid to the estate is counted in it, as ${h.src('gov_valuing', 'GOV.UK’s guide to valuing an estate')} lists life insurance among the assets, and it waits for probate before anyone can use it. Written in trust, the payout goes to the trustees and can reach the family within weeks; the ${h.a('life-insurance-in-trust', 'trust page')} shows the inheritance tax difference.</p>
`;
  },
});
