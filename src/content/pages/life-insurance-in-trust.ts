import { definePage } from '../../lib/guide-types';

const CASE = { estate: 400000, payout: 250000, home: 300000, toDescendants: true, toSpouse: false };

export default definePage({
  id: 'life-insurance-in-trust',
  group: 'tax',
  order: 400,
  tool: { kind: 'mini:trust', props: { estate: 400000, payout: 250000, home: 300000, desc: 1, spouse: 0 } },
  related: ['whole-of-life-insurance', 'life-insurance-unmarried-couples', 'home', 'key-person-insurance'],
  sources: ['gov_iht', 'gov_valuing', 'gov_trusts', 'gov_trusts_iht'],
  slug: 'life-insurance-in-trust',
  nav: 'Policy in trust',
  card: 'The inheritance tax a payout adds when it is paid to the estate, against the same policy written in trust.',
  title: 'Life Insurance in Trust 2026/27: Inheritance Tax on a Payout',
  description: 'Life insurance in trust for 2026/27: the inheritance tax a payout adds when it falls into the estate, the thresholds that apply, and what a trust changes.',
  h1: 'Life insurance in trust: the tax a payout adds to the estate',
  intro: 'A life policy paid to the estate is counted with everything else for inheritance tax. Enter the estate, the payout and the home to compare.',
  resume: (h) => {
    const r = h.E.ihtOnPayout(CASE);
    const I = h.P.iht;
    return `A life insurance payout that is not written in trust is paid to the estate of the person who died and counts towards its value for inheritance tax, as GOV.UK’s guide to valuing an estate lists. Inheritance tax is charged at ${h.pc(I.rate)} on the value above the nil-rate band of ${h.m(I.nrb)}, plus a residence nil-rate band of up to ${h.m(I.rnrb)} when a home goes to children or grandchildren, which is tapered away on estates above ${h.m(I.taperThreshold)}. Take an estate of ${h.m(CASE.estate)}, including a home of ${h.m(CASE.home)} left to the children, and a policy paying ${h.m(CASE.payout)}. Paid to the estate, the policy adds ${h.m(r.extra)} of inheritance tax, so the family keeps ${h.m(r.familyGetsInEstate)} of it. Written in trust, the payout goes to the trustees outside the estate, is not counted, and is usually available without waiting for probate. Anything left to a spouse or civil partner is free of inheritance tax, so the question matters most for unmarried couples and for the second death.`;
  },
  faqs: (h) => [
    { q: 'How do I put my life insurance in trust?', a: 'Most insurers provide trust forms for their policies, often free, and the trust can be set up when the policy starts or later. You choose trustees, who will claim the money, and beneficiaries, who receive it. The form and the type of trust matter, so read the insurer’s guidance or ask a solicitor if your family situation is complex.' },
    { q: 'Is there tax on a life insurance trust?', a: `Most trusts other than bare trusts are relevant property trusts. GOV.UK says tax can be due when assets leave the trust and at each ten-year anniversary, if the trust holds relevant property above the threshold. There is no exit charge on assets transferred out within three months of setting up the trust or of a ten-year anniversary. Trustees should check GOV.UK’s guide.` },
    { q: 'Does a life policy in trust help an unmarried partner?', a: 'Yes, on two counts. An unmarried partner does not inherit automatically under the intestacy rules and does not get the spouse exemption from inheritance tax. A policy in trust that names the partner as a beneficiary pays them directly, outside the estate and outside any will, which avoids both problems for that money.' },
  ],
  body: (h) => {
    const I = h.P.iht;
    const payouts = [100000, 200000, 300000, 500000];
    const rows = payouts.map((p) => { const r = h.E.ihtOnPayout({ ...CASE, payout: p }); return [h.m(p), h.m(r.taxInTrust), h.m(r.taxInEstate), h.m(r.extra), h.m(r.familyGetsInEstate)]; });
    const estates = [200000, 400000, 700000, 1500000, 2200000];
    const rows2 = estates.map((e) => { const r = h.E.ihtOnPayout({ ...CASE, estate: e, home: Math.min(e, CASE.home) }); return [h.m(e), h.m(r.thresholdInEstate), h.m(r.extra)]; });
    return `
<h2>Tax added by different payouts</h2>
<p>The estate is ${h.m(CASE.estate)} without the policy, including a home of ${h.m(CASE.home)} left to the children, and no spouse inherits. “Tax, policy in trust” is the tax on the estate alone, which is what the family pays with the policy in trust; “Tax, paid to the estate” is the tax with the payout added.</p>
${h.table(['Payout', 'Tax, policy in trust', 'Tax, paid to the estate', 'Extra tax', 'Family keeps of the payout'], rows, `Inheritance tax at ${h.pc(I.rate)} above the thresholds, ${h.P.taxYear}. No lifetime gifts. Read on ${h.src('gov_iht', 'GOV.UK')}.`, ['r', 'r', 'r', 'r', 'r'])}

<h2>When the payout pushes the estate past the taper</h2>
<p>The residence nil-rate band falls by one pound for every ${h.num(I.taperDivisor)} pounds of estate above ${h.m(I.taperThreshold)}. A large payout can push an estate over that line and cost part of the band as well as the tax on the payout itself.</p>
${h.table(['Estate without the policy', 'Threshold with the payout added', 'Extra tax on a payout of ' + h.m(CASE.payout)], rows2, 'Home up to the value shown left to children. No spouse exemption.', ['r', 'r', 'r'])}

<h2>What a trust changes, and what it does not</h2>
<p>A trust changes who owns the payout: the trustees claim it and pay it to the beneficiaries, so it is not part of the estate and not covered by the will. It does not change the policy’s price or the chance of a claim. The type of trust decides how flexible it is: in some, the beneficiaries are fixed; in a discretionary trust the trustees choose among a list. ${h.src('gov_trusts', 'GOV.UK’s page on trusts and taxes')} describes the types, and ${h.src('gov_trusts_iht', 'its guide to trusts and inheritance tax')} explains the charges on relevant property.</p>

<h2>Where it matters most</h2>
<p>For a married couple leaving everything to each other, the first death has no inheritance tax, so a payout to the estate is not taxed then; but it may raise the estate at the second death. For an unmarried couple, there is no spouse exemption at all, which is why the ${h.a('life-insurance-unmarried-couples', 'unmarried couples page')} treats a trust as the first step. ${h.src('gov_valuing', 'GOV.UK’s estate valuation guide')} lists life insurance payouts among the assets to count. A ${h.a('whole-of-life-insurance', 'whole of life policy')} in trust is a common way to provide the money to pay the bill.</p>
<h2>Choosing trustees</h2>
<p>Trustees are the people who claim the money from the insurer and pay it out. Many people name their partner and one or two others, such as an adult child or a close friend, so that the trust can still act if one trustee has died or cannot be reached. The person insured is often a trustee too, so that they can manage the trust while alive. Naming trustees who will be easy to contact and willing to act matters more than their legal knowledge.</p>
`;
  },
});
