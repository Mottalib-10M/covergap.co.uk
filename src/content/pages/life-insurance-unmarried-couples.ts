import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'life-insurance-unmarried-couples',
  group: 'life',
  order: 60,
  tool: { kind: 'mini:bsp', props: { partner: 1, kids: 1 } },
  related: ['home', 'life-insurance-in-trust', 'joint-life-insurance', 'death-in-service'],
  sources: ['gov_bsp', 'gov_rates', 'gov_iht', 'gov_intestacy'],
  slug: 'life-insurance-unmarried-couples',
  nav: 'Unmarried couples',
  card: 'What an unmarried partner gets from the state and from the estate, and the gap life cover has to fill for them.',
  title: 'Life Insurance for Unmarried Couples 2026: The Hidden Gaps',
  description: 'Life insurance for unmarried couples in 2026: when a cohabiting partner gets Bereavement Support Payment, the missing spouse exemption, and the gap it leaves.',
  h1: 'Life insurance for unmarried couples: what the law does not give you',
  intro: 'Living together is treated differently from marriage by benefits, by inheritance and by tax. Choose your situation to see what the state would pay your partner.',
  resume: (h) => {
    const withKids = h.E.bsp('cohabiting', true), married = h.E.bsp('married', false);
    return `For a couple who live together without marrying or forming a civil partnership, the gap left by a death is often larger than for a married couple. Bereavement Support Payment is due to a cohabiting partner only if, when the partner died, they were getting Child Benefit for a child living with them, were entitled to it, or were pregnant: in that case the full ${h.m(withKids.total)} is paid. Without children, an unmarried partner gets nothing, where a married partner would get ${h.m(married.total)}. Inheritance is the second gap. With no will, an unmarried partner has no automatic right to inherit, and anything left to them by will is taxed above the ${h.m(h.P.iht.nrb)} nil-rate band, because the spouse exemption does not apply. A life policy written in trust for the partner reaches them directly, whatever the will says.`;
  },
  faqs: (h) => [
    { q: 'Does my partner get anything from the state if we are not married and I die?', a: `Only with children. GOV.UK says a cohabiting partner can get Bereavement Support Payment if they were getting Child Benefit for a child living with them, were entitled to it, or were pregnant when you died. The payment is then ${h.m(h.P.bsp.higherLump)} plus ${h.P.bsp.months} monthly payments of ${h.m(h.P.bsp.higherMonthly)}. Without a child, there is no bereavement benefit for an unmarried partner at all.` },
    { q: 'Is life insurance paid to my unmarried partner subject to inheritance tax?', a: `If the policy pays into your estate, yes: the payout counts in the estate, and with no spouse exemption the part above the tax-free threshold is taxed at ${h.pc(h.P.iht.rate)}. If the policy is written in trust with your partner as beneficiary, it is paid to the trustees outside the estate. The trust page shows the difference on your own figures.` },
    { q: 'Does living together for years give my partner the same rights as a spouse?', a: `Not for inheritance, benefits or tax. GOV.UK’s guide to who inherits without a will says a surviving partner who was not married or in a civil partnership has no automatic right to inherit, however long the couple lived together. Bereavement Support Payment needs a child for whom Child Benefit is paid, and the spouse exemption from inheritance tax does not apply. A will and a policy in trust fill those gaps.` },
  ],
  body: (h) => {
    const rows = [
      ['Married or civil partners, child at home', h.m(h.E.bsp('married', true).total), 'Exempt', 'Spouse inherits all or part'],
      ['Married or civil partners, no child', h.m(h.E.bsp('married', false).total), 'Exempt', 'Spouse inherits all or part'],
      ['Living together, child at home', h.m(h.E.bsp('cohabiting', true).total), `Taxed above ${h.m(h.P.iht.nrb)}`, 'No automatic right to inherit'],
      ['Living together, no child', h.m(0), `Taxed above ${h.m(h.P.iht.nrb)}`, 'No automatic right to inherit'],
    ];
    const t = h.E.ihtOnPayout({ estate: 350000, payout: 200000, home: 250000, toDescendants: false, toSpouse: false });
    return `
<h2>Married and unmarried, side by side</h2>
<p>The table sets the three things that change between a married and an unmarried couple: the bereavement benefit, inheritance tax on what the survivor receives, and what happens without a will, as ${h.src('gov_intestacy', 'GOV.UK’s intestacy guide')} sets out. Benefit amounts are the ${h.src('gov_rates', 'DWP rates for')} ${h.P.taxYear}; the conditions are those of ${h.src('gov_bsp', 'GOV.UK’s Bereavement Support Payment guide')}.</p>
${h.table(['Couple', 'Bereavement Support Payment', 'Inheritance tax on what the partner inherits', 'Without a will'], rows, `Claim within ${h.P.bsp.fullClaimMonths} months; the person who died must have paid enough National Insurance.`, ['l', 'r', 'l', 'l'])}

<h2>The inheritance tax gap in figures</h2>
<p>Take an estate of ${h.m(350000)}, including a ${h.m(250000)} share of a home, left by will to an unmarried partner, and a ${h.m(200000)} life policy paid into the estate. The partner is not a child or grandchild, so no residence band applies, and there is no spouse exemption. The policy adds ${h.m(t.extra)} of inheritance tax, and the partner receives ${h.m(t.familyGetsInEstate)} of the ${h.m(200000)}. Written in trust for the partner, the same policy would have reached them in full. The rules are on ${h.src('gov_iht', 'GOV.UK’s inheritance tax page')}; the ${h.a('life-insurance-in-trust', 'trust calculator')} runs your own case.</p>

<h2>What cover usually has to do</h2>
<p>For an unmarried couple without children, the need is often the home: a survivor who owns half the house and has a mortgage in both names may have to buy out the other half from the estate, or pay the whole mortgage alone. For a couple with children, the state does pay Bereavement Support Payment, but the long-term income need is the same as for married parents. The ${h.a('home', 'life cover calculator')} has a setting for living together, which counts the benefit only when it is due.</p>

<h2>Death in service and pensions</h2>
<p>Many employer schemes ask members to say on an expression of wishes form who should receive death in service and survivor benefits. A partner who is not named on it leaves the scheme to decide without that guidance. Filling the form in costs nothing and is worth doing at the same time as any new policy. The ${h.a('death-in-service', 'death in service page')} shows how far that benefit goes.</p>
<h2>Three steps that close most of the gap</h2>
<p>First, write a will, because without one an unmarried partner inherits nothing under the ${h.src('gov_intestacy', 'intestacy rules')}. Second, put any life policy in trust with the partner as a beneficiary, so the payout reaches them directly and outside the estate. Third, fill in the expression of wishes form for each pension and death in service scheme, naming the partner. None of the three costs much, and together they mean the money that exists reaches the person it was meant for. Only then is it worth working out how much extra cover is needed, using the ${h.a('home', 'calculator')} with the unmarried setting so that Bereavement Support Payment is counted only where children qualify.</p>
`;
  },
});
