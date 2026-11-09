import { definePage } from '../../lib/guide-types';

const AGE = 45, PREM = 60, SUM = 50000;

export default definePage({
  id: 'whole-of-life-insurance',
  group: 'later',
  order: 210,
  tool: { kind: 'mini:whole', props: { age: AGE, premium: PREM, sum: SUM, sex: 0 } },
  related: ['over-50s-life-insurance', 'life-insurance-in-trust', 'term-life-insurance', 'life-insurance-over-60s'],
  sources: ['ons_nlt', 'gov_iht', 'gov_trusts_iht'],
  slug: 'whole-of-life-insurance',
  nav: 'Whole of life',
  card: 'A policy with no end date pays out for certain. How long the premiums take to reach the sum, on ONS odds.',
  title: 'Whole of Life Insurance 2026: Premiums Against the Payout',
  description: 'Whole of life insurance in 2026: a policy with no end date always pays, so the test is how long premiums take to reach the sum assured. ONS odds for your age.',
  h1: 'Whole of life insurance: a payout that is certain, at a price',
  intro: 'A whole of life policy pays whenever death happens, as long as the premiums are paid. Type a premium and a sum assured to see when they meet.',
  resume: (h) => {
    const r = h.E.over50({ age: AGE, sex: 'm', premium: PREM, sum: SUM });
    const p = h.odds(AGE, 25, 'm');
    return `Whole of life insurance has no end date: as long as the premiums are paid, it pays the sum assured on death, whenever that is. Because the payout is certain, it costs much more than term cover for the same sum, which pays only if death happens within the term. A man of ${AGE} buying ${h.m(SUM)} of term cover for 25 years buys protection that the ONS life tables say pays out in ${h.pc(p)} of cases. A whole of life policy pays in all of them, and the premium reflects that. At ${h.m(PREM)} a month, premiums reach ${h.m(SUM)} by age ${h.num1(r.breakEvenAge)}; a man of ${AGE} has a ${h.pc(r.aliveAtBreakEven)} chance of being alive then, and half of men his age live past ${h.num1(r.median)}. The common use of whole of life cover is not income for a young family but a known sum at death: often to pay an inheritance tax bill, written in trust so that the payout is outside the estate.`;
  },
  faqs: (h) => [
    { q: 'What is the difference between whole of life and term insurance?', a: 'Term insurance covers a set number of years and pays nothing if you outlive it, which is why it is cheaper. Whole of life cover lasts until death and pays out as long as premiums are kept up. Term suits a need that ends, such as a mortgage or children growing up; whole of life suits a need that exists at death whenever it comes.' },
    { q: 'Can whole of life premiums go up?', a: 'Some policies have guaranteed premiums that never change. Others are reviewable: the insurer looks again after a set number of years and can raise the premium or cut the cover, which can make an old policy expensive to keep. The policy documents say which type you hold and when the reviews happen.' },
    { q: 'Is whole of life insurance used for inheritance tax?', a: 'Yes, that is one of its main uses. A policy written in trust pays outside the estate, so the family can use it to pay the inheritance tax bill without waiting for probate or selling assets. The premiums can be gifts that fall within an exemption. Whether this suits you depends on the size of your estate and your other plans.' },
  ],
  body: (h) => {
    const ages = [35, 45, 55, 65];
    const rows = ages.map((a) => { const r = h.E.over50({ age: a, sex: 'm', premium: PREM, sum: SUM }); const f = h.E.over50({ age: a, sex: 'f', premium: PREM, sum: SUM }); return [h.num(a), h.num1(r.breakEvenAge), h.pc(r.aliveAtBreakEven), h.pc(f.aliveAtBreakEven), h.num1(r.median), h.num1(f.median)]; });
    const t = [10, 20, 30];
    const rows2 = t.map((y) => [`${y} years`, h.pc(h.odds(AGE, y, 'm')), h.pc(h.odds(AGE, y, 'f'))]);
    const I = h.P.iht;
    return `
<h2>When the premiums reach the sum, at different starting ages</h2>
<p>The table keeps ${h.m(PREM)} a month and ${h.m(SUM)} of cover and changes the starting age. Real premiums rise with age, so use the quote you have; the point here is the shape. The median age is the age by which half of people now that age have died, on the ${h.src('ons_nlt', 'ONS tables')}.</p>
${h.table(['Starting age', 'Premiums reach the sum at', 'Man alive then', 'Woman alive then', 'Median age at death, man', 'Median age at death, woman'], rows, `Premium ${h.m(PREM)} a month for life, sum ${h.m(SUM)}. ONS 2022-2024, United Kingdom.`, ['r', 'r', 'r', 'r', 'r', 'r'])}

<h2>Against term cover from the same age</h2>
<p>For comparison, the chance that a term policy taken out at ${AGE} pays out at all. The rest of the time the term ends with nothing paid, which is what makes it cheaper.</p>
${h.table(['Term from age ' + AGE, 'Man', 'Woman'], rows2, 'Chance of death within the term, ONS 2022-2024.', ['l', 'r', 'r'])}

<h2>The inheritance tax use</h2>
<p>Inheritance tax is charged at ${h.pc(I.rate)} on the part of an estate above the thresholds set out on ${h.src('gov_iht', 'GOV.UK')}: a nil-rate band of ${h.m(I.nrb)} and, when a home goes to children or grandchildren, a residence nil-rate band of up to ${h.m(I.rnrb)}. A whole of life policy written in trust pays outside the estate, so the payout itself is not taxed and is available before probate. ${h.src('gov_trusts_iht', 'GOV.UK’s guide to trusts and inheritance tax')} explains how different trusts are charged. The ${h.a('life-insurance-in-trust', 'trust calculator')} shows what a payout into the estate would add to the bill.</p>

<h2>What to check</h2>
<p>Whether the premium is guaranteed or reviewable, and when the first review falls; whether premiums stop at an age; whether the sum is fixed, rises with an index, or is linked to investments, which some older policies are. If the only aim is a modest sum for a funeral, the ${h.a('over-50s-life-insurance', 'over 50s plans page')} compares smaller fixed sums with no medical questions.</p>
<h2>Saving instead, and the trade-off</h2>
<p>Someone who could save the premium every month until the break-even age would hold the same sum without a policy, but only if they live that long and never touch the money. The policy removes that condition: it pays the full sum even if death comes in the first year. That certainty is what the extra premium over term cover buys. For a couple with a known tax bill on the second death, a joint policy that pays on the second death is a common variant, because that is when the tax falls due. The odds that both partners survive to a given age can be read from the tables on the ${h.a('joint-life-insurance', 'joint life page')}.</p>
`;
  },
});
