import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'term-life-insurance',
  group: 'life',
  order: 20,
  tool: { kind: 'mini:term', props: { age: 32, sum: 250000, term: 30, sex: 1 } },
  related: ['life-insurance-by-age', 'mortgage-life-insurance', 'family-income-benefit', 'whole-of-life-insurance'],
  sources: ['ons_nlt', 'gov_bsp', 'gov_valuing'],
  slug: 'term-life-insurance',
  nav: 'Term life insurance',
  card: 'Level term cover: the chance of a claim in the first and second half of the term, and why most policies expire unused.',
  title: 'Term Life Insurance 2026: Odds of a Claim Over the Term',
  description: 'Term life insurance with ONS odds for 2026: how often a level term policy pays out, why most expire unused, and how to set the term against the debt it covers.',
  h1: 'Term life insurance: what you are buying, in odds',
  intro: 'A level term policy pays a fixed sum if you die within the term and nothing after it. The calculator shows how often that happens at your age.',
  resume: (h) => {
    const p = h.odds(32, 30, 'f'), half = h.odds(32, 15, 'f'), m = h.odds(32, 30, 'm');
    return `Term life insurance covers a set number of years. If the insured person dies within the term, the policy pays the sum assured, usually to whoever is named or to the trustees of a trust; if they are alive at the end, it stops and pays nothing back. A level term policy keeps the same sum for the whole term, unlike decreasing cover, which falls with a repayment mortgage. For a woman of 32 taking ${h.m(250000)} of level cover for 30 years, the ONS life tables for 2022 to 2024 give a ${h.pc(p)} chance of a claim, of which ${h.pc(half)} in the first fifteen years. For a man of the same age it is ${h.pc(m)}. Most term policies therefore end unused, which is what keeps them cheaper than whole of life cover: the insurer only pays in the unlikely case.`;
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
<p>A longer term adds years at the end, which are the years with the highest death rates. That is why the chance of a claim rises faster than the number of years: on the ${h.src('ons_nlt', 'ONS tables')}, a 35-year term from 30 is far more than three and a half times as likely to pay as a 10-year one.</p>
${h.table(['Term', 'From 30, men', 'From 30, women', 'From 45, men', 'From 45, women'], rows, 'Probability of dying within the term, United Kingdom, ONS national life tables 2022 to 2024.', ['l', 'r', 'r', 'r', 'r'])}

<h2>Setting the term to the need</h2>
<p>The question is not how long you want cover but how long someone would be left short without you. For most families, three dates answer it: the last payment of the mortgage, the year the youngest child turns 18 or leaves education, and the State Pension age of the surviving partner, after which their own pension takes over. A term that runs past all three buys years of cover that protect no one, at the most expensive end of the risk curve.</p>
<p>Some families split the cover rather than stretch one policy. A decreasing policy matches the mortgage; a level or ${h.a('family-income-benefit', 'family income benefit')} policy covers the years of child-raising. The ${h.a('home', 'life cover calculator')} adds up the sums for each part.</p>

<h2>What the state already pays</h2>
<p>A married partner or civil partner with a child for whom Child Benefit is paid can claim ${h.src('gov_bsp', 'Bereavement Support Payment')} of ${h.m(bsp.total)} in all if the person who died paid enough National Insurance. It is worth counting, but it is a bridge of eighteen months, not a replacement income, so it rarely changes the term, only the amount.</p>

<h2>Who receives the money</h2>
<p>A term policy paid to the estate is counted in it, as ${h.src('gov_valuing', 'GOV.UK’s guide to valuing an estate')} lists life insurance among the assets, and it waits for probate before anyone can use it. Written in trust, the payout goes to the trustees and can reach the family within weeks; the ${h.a('life-insurance-in-trust', 'trust page')} shows the inheritance tax difference.</p>

<h2>Things to check in the policy summary</h2>
<p>Whether the premium is guaranteed for the whole term or reviewable; whether the sum assured is level, decreasing or rises with inflation; whether a terminal illness benefit pays the sum early when life expectancy is short, as many policies do; and what happens if you miss a payment. None of these needs a quote to read: they are in the key features document every insurer publishes.</p>
`;
  },
});
