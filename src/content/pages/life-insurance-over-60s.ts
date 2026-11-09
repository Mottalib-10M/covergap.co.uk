import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'life-insurance-over-60s',
  group: 'later',
  order: 220,
  tool: { kind: 'mini:over60', props: { age: 62, sex: 1, area: 0 } },
  related: ['over-50s-life-insurance', 'whole-of-life-insurance', 'life-insurance-by-age', 'funeral-plans'],
  sources: ['ons_nlt', 'ons_nlt_nations', 'gov_bsp'],
  slug: 'life-insurance-over-60s',
  nav: 'Over 60s cover',
  card: 'Life expectancy at 60 and beyond, by nation, and the odds that a term policy to 80 or 90 would pay.',
  title: 'Life Insurance for Over 60s 2026: Odds by Age and Nation',
  description: 'Life insurance for over 60s in 2026: ONS life expectancy by age and nation, the chance of reaching 80 or 90, and what it means for term and whole of life cover.',
  h1: 'Life insurance over 60: what the life tables say about the term',
  intro: 'After 60 the choice is between a term that ends, a whole of life policy or an over 50s plan. Start with how long the cover has to last.',
  resume: (h) => {
    const m = h.E.lifeExpectancy(62, 'm'), f = h.E.lifeExpectancy(62, 'f');
    const m80 = h.E.survival(62, 18, 'm'), f80 = h.E.survival(62, 18, 'f');
    return `At 60 and over, the length of cover matters more than at any other age, because the chance of a claim rises quickly with each year of the term. On the ONS National life tables for 2022 to 2024, a man of 62 in the United Kingdom lives on average another ${h.num1(m)} years and a woman another ${h.num1(f)}. ${h.pc(m80)} of men and ${h.pc(f80)} of women of 62 reach 80. So a term policy from 62 to 80 pays out for about ${h.pc(1 - m80)} of men, much more often than a term taken out at 40, and insurers price it that way. Three types of cover are sold at this age. Term cover is still the cheapest for a debt or a partner’s income that has an end. Whole of life cover pays whenever death happens. An over 50s plan pays a small fixed sum with no health questions. The calculator gives the odds for your age, sex and nation.`;
  },
  faqs: (h) => [
    { q: 'Can I get life insurance at 65 or 70?', a: 'Yes. Term and whole of life cover are offered to people well into their seventies, usually with health questions, and over 50s plans accept applicants without them, up to an upper age each plan sets. The latest age at which a term may end is also set by each insurer. The older you start, the shorter and dearer the term tends to be.' },
    { q: 'Do I still need life insurance in retirement?', a: 'Only if someone would lose money when you die. A partner who relies on your pension, a mortgage still running, or an inheritance tax bill can all be reasons. A State Pension and a defined benefit pension often pay less or nothing to a survivor, so it is worth checking what your partner would keep before deciding.' },
    { q: 'Is life expectancy different in Scotland or Wales?', a: 'Yes, a little. The ONS publishes separate life tables for England, Wales, Scotland and Northern Ireland, and at most ages expectancy in Scotland is lower than in England. The calculator lets you choose the nation. Insurers price on their own data, not on these tables, so the figures show the odds for the whole population, not your premium.' },
  ],
  body: (h) => {
    const ages = [60, 65, 70, 75, 80];
    const rows = ages.map((a) => [h.num(a), h.num1(h.E.lifeExpectancy(a, 'm')), h.num1(h.E.lifeExpectancy(a, 'f')), h.pc(h.E.survival(a, Math.max(0, 85 - a), 'm')), h.pc(h.E.survival(a, Math.max(0, 85 - a), 'f'))]);
    const rows2 = h.E.AREAS.map((ar) => [h.E.AREA_LABEL[ar], h.num1(h.E.lifeExpectancy(65, 'm', ar)), h.num1(h.E.lifeExpectancy(65, 'f', ar)), h.pc(h.E.survival(65, 25, 'm', ar)), h.pc(h.E.survival(65, 25, 'f', ar))]);
    const terms = [5, 10, 15, 20];
    const rows3 = terms.map((t) => [`${t} years`, h.pc(h.odds(65, t, 'm')), h.pc(h.odds(65, t, 'f'))]);
    return `
<h2>Life expectancy from 60 to 80</h2>
<p>Years left on average at each age, and the chance of reaching 85, from the ${h.src('ons_nlt', 'ONS National life tables')}. These are period figures: they assume today’s death rates stay as they are.</p>
${h.table(['Age', 'Years left, man', 'Years left, woman', 'Reaches 85, man', 'Reaches 85, woman'], rows, 'United Kingdom, ONS 2022-2024.', ['r', 'r', 'r', 'r', 'r'])}

<h2>By nation, at 65</h2>
<p>The ONS publishes ${h.src('ons_nlt_nations', 'separate tables')} for each nation. The table compares years left at 65 and the chance of reaching 90.</p>
${h.table(['Nation', 'Years left, man', 'Years left, woman', 'Reaches 90, man', 'Reaches 90, woman'], rows2, 'ONS 2022-2024, age 65.', ['l', 'r', 'r', 'r', 'r'])}

<h2>How often a term from 65 pays</h2>
${h.table(['Term from 65', 'Man', 'Woman'], rows3, 'Chance of death within the term, United Kingdom, ONS 2022-2024.', ['l', 'r', 'r'])}
<p>A term policy from 65 pays out far more often than the same term from 40, which is why the premium is higher and why a short term is the usual choice. If the need is a debt with an end date, a short term matches it. If the need exists whenever death comes, such as a funeral or a tax bill, a ${h.a('whole-of-life-insurance', 'whole of life policy')} or an ${h.a('over-50s-life-insurance', 'over 50s plan')} fits better.</p>

<h2>What a partner keeps</h2>
<p>For couples over State Pension age, ${h.src('gov_bsp', 'Bereavement Support Payment')} is not paid if the surviving partner had reached State Pension age when the death happened, so the state support that helps younger families does not apply. What the survivor keeps depends on the pensions: a defined benefit scheme may pay a survivor’s pension, a drawdown fund passes on, and an annuity may stop. Checking those first shows whether any cover is needed at all. The ${h.a('life-insurance-by-age', 'odds by age')} page gives the same figures for younger ages.</p>
<h2>Choosing life insurance over 60: matching the term to the need</h2>
<p>Three common needs set the length of cover after 60. A mortgage that still has years to run sets a term equal to the years left, and decreasing cover can follow the balance; the ${h.a('mortgage-life-insurance', 'mortgage page')} shows how quickly a repayment loan falls. A partner who would lose part of your pension sets a term up to the age at which the partner’s own income would be enough, which is often open-ended. A bill that exists whenever death comes, such as inheritance tax or a funeral, has no natural end and is better matched by whole of life cover or a plan without an end date.</p>
<p>Whichever of these applies, the premium rises with every year of age at the start, so the earlier a decision is made, the cheaper the same cover tends to be. The term tables above show why: the chance of a claim rises with each year of the term, and insurers price each of those years.</p>
`;
  },
});
