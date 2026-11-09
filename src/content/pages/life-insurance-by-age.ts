import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'life-insurance-by-age',
  group: 'life',
  order: 10,
  tool: { kind: 'mini:odds', props: { age: 35, term: 25, sex: 0, area: 0 } },
  related: ['home', 'term-life-insurance', 'life-insurance-over-60s', 'joint-life-insurance'],
  sources: ['ons_nlt', 'ons_nlt_nations', 'ogl'],
  slug: 'life-insurance-by-age',
  nav: 'Life insurance by age',
  card: 'The chance a policy pays out at each age and term, from the ONS life tables, instead of an untraceable average premium.',
  title: 'Life Insurance by Age 2026: Chance a Policy Ever Pays Out',
  description: 'Life insurance by age, from the ONS life tables 2022 to 2024: the chance a 10, 20 or 25-year policy pays out at 25, 40 or 60, for men and women, by UK nation.',
  h1: 'Life insurance by age: how likely a claim really is',
  intro: 'Age is what moves the cost of cover more than anything else. Here is the reason, in the official figures: the odds of a claim at each age.',
  resume: (h) => {
    const a = h.odds(30, 25, 'm'), b = h.odds(40, 25, 'm'), c = h.odds(50, 25, 'm'), f = h.odds(40, 25, 'f');
    return `People search for the cost of life insurance by age because premiums climb steeply from the forties onward. The cause is the risk the insurer is pricing, and that risk is public. On the ONS national life tables for 2022 to 2024, a man who takes out a 25-year policy at 30 has a ${h.pc(a)} chance of dying within the term. At 40 the same policy carries a ${h.pc(b)} chance, and at 50 it is ${h.pc(c)}. A woman of 40 starts at ${h.pc(f)}. Every ten years of waiting roughly doubles the odds for a term of the same length, which is why the same cover bought later costs more each month. This page does not invent an average premium: no insurer publishes reusable prices. It gives the odds, so a quote can be read against them.`;
  },
  faqs: (h) => [
    { q: 'At what age is it too late to get life insurance?', a: `There is no legal age limit; each insurer sets its own maximum age at the start and at the end of the term. What changes with age is the risk. At 60, a man taking ten years of cover has a ${h.pc(h.odds(60, 10, 'm'))} chance of a claim on the national tables, against ${h.pc(h.odds(30, 10, 'm'))} at 30. Over 50s plans accept everyone in an age band but pay a fixed, smaller sum.` },
    { q: 'Is it cheaper to get life insurance in my twenties?', a: `Each month is cheaper because the odds of a claim are low: a woman of 25 taking 30 years of cover has a ${h.pc(h.odds(25, 30, 'f'))} chance of dying within the term. Whether buying early saves money overall depends on whether you need the cover yet. Paying for years before anyone depends on your income is a cost with nothing behind it.` },
    { q: 'Are the odds of a claim lower for women than for men of the same age?', a: `Yes, at every working age in the ONS tables. A man of 40 taking twenty years of cover has a ${h.pc(h.odds(40, 20, 'm'))} chance of dying within the term, a woman of the same age ${h.pc(h.odds(40, 20, 'f'))}. The gap narrows in old age. The tool shows both, and the nation selector shows how much the figures move between England, Wales, Scotland and Northern Ireland.` },
  ],
  body: (h) => {
    const ages = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
    const rows = ages.map((a) => [`${a}`, h.pc(h.odds(a, 10, 'm')), h.pc(h.odds(a, 10, 'f')), h.pc(h.odds(a, 20, 'm')), h.pc(h.odds(a, 20, 'f')), h.num1(h.E.lifeExpectancy(a, 'm')), h.num1(h.E.lifeExpectancy(a, 'f'))]);
    const ratio = h.odds(45, 20, 'm') / h.odds(35, 20, 'm');
    return `
<h2>The odds at each age</h2>
<p>The table chains the yearly death rates of the ${h.src('ons_nlt', 'ONS national life tables')} over ten and twenty years. A rate of a few in a thousand in a single year becomes several percent over two decades, and the curve bends upwards: from 35 to 45, the twenty-year figure for men grows ${h.num1(ratio)} times. That bend is what you see in quotes as you get older, before any question about health or smoking is asked.</p>
${h.table(['Age at start', '10 years, men', '10 years, women', '20 years, men', '20 years, women', 'Life expectancy, men', 'Women'], rows, 'United Kingdom, ONS national life tables 2022 to 2024, period rates for the whole population.', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}

<h2>Why this is not a price list</h2>
<p>Insurers start from tables like these, then replace them with their own experience of the people they cover, who are on average healthier than the whole population. They add their expenses, the commission of whoever sold the policy, a margin for profit and a loading for anything in your answers that raises the risk. None of those adjustments is published in a form that may be reused, and the averages printed on broker pages give no method. So the figures above tell you how the risk moves, not what anyone will charge.</p>
<p>They are still useful when a quote arrives. If one insurer’s monthly price for a 20-year term doubles between two ages ten years apart, the table shows that the risk itself does roughly the same, so the jump is not a penalty. And if the cover is only needed for the years a mortgage or young children depend on you, a shorter term at a lower risk may do the job.</p>

<h2>Where you live</h2>
<p>The ONS publishes the same tables for each nation, and the gaps are real. Chosen in the tool, Scotland gives a man of 35 taking a 25-year term a ${h.pc(h.odds(35, 25, 'm', 'scotland'))} chance of a claim against ${h.pc(h.odds(35, 25, 'm', 'england'))} in England. Wales gives ${h.pc(h.odds(35, 25, 'm', 'wales'))} and Northern Ireland ${h.pc(h.odds(35, 25, 'm', 'ni'))}. Insurers price the whole country alike, so the difference does not appear in a quote, but it is part of why the population figures are only a starting point.</p>

<h2>Reading the figures safely</h2>
<p>Period tables apply today’s death rates to the future. If death rates fall over the coming decades, the real odds over a long term will be lower than shown; if they rise, higher. The tables count every death, from any cause, so they also include people who would not be offered standard cover. Use them as an upper guide for a healthy applicant, and as a reason to size the term to the need rather than to buy as long a policy as possible.</p>
<p>The ${h.a('home', 'life cover calculator')} uses the same rates to show the odds for the amount and the term it suggests.</p>
`;
  },
});
