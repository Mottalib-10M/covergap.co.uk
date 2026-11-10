import { definePage } from '../../lib/guide-types';

export default definePage({
  id: 'joint-life-insurance',
  group: 'life',
  order: 50,
  tool: { kind: 'mini:joint', props: { a1: 40, s1: 0, a2: 38, s2: 1, term: 25 } },
  related: ['mortgage-life-insurance', 'life-insurance-unmarried-couples', 'term-life-insurance', 'home'],
  sources: ['ons_nlt', 'gov_bsp', 'gov_iht'],
  slug: 'joint-life-insurance',
  nav: 'Joint or single policies',
  card: 'The odds that a joint first-death policy pays, against two single policies that can both pay.',
  title: 'Joint Life Insurance 2026: One Policy or Two Single Ones',
  description: 'Joint life insurance in 2026: how often a joint first-death policy pays out for a couple, what two single policies add, and what is left for the survivor.',
  h1: 'Joint life insurance or two single policies',
  intro: 'Joint life insurance is one policy for two people that pays on the first death. Enter both ages and the term. The calculator gives the chance each policy design pays out, from official UK death statistics (ONS life tables).',
  resume: (h) => {
    const j = h.E.jointChances(40, 'm', 38, 'f', 25);
    return `A joint life policy covers two people and pays once, normally at the first death within the term, after which the cover ends. Two single policies cover each person separately, so both can pay, and the survivor still has cover after the first claim. For a man of 40 and a woman of 38 over 25 years, the ONS life tables for 2022 to 2024 give a ${h.pc(j.atLeastOne)} chance that at least one of them dies within the term, which is when a joint first-death policy pays. His own policy would pay with a ${h.pc(j.first)} chance, hers with ${h.pc(j.second)}, and the chance that both single policies pay is ${h.pc(j.both)}. A joint policy usually costs less than two single ones of the same sum, because it can pay only once; the second death in the term goes uncovered.`;
  },
  faqs: (h) => [
    { q: 'What happens to a joint life policy if we separate?', a: 'A joint policy belongs to both of you, and splitting it is not always possible: some insurers let it be divided into two single policies without new health questions, others only allow it to be cancelled. Two single policies avoid the question, because each person owns their own cover. The policy terms say which applies before you buy.' },
    { q: 'Does a joint policy pay out twice if we both die?', a: `A first-death joint policy pays once, then ends, even if both die at the same time in an accident; some policies add a second payment for that case. Two single policies pay twice. On the ONS tables the chance of both dying within a 25-year term from 40 and 38 is ${h.pc(h.E.jointChances(40, 'm', 38, 'f', 25).both)}, small but not nothing for parents of young children.` },
    { q: 'Can unmarried partners take out a joint life policy?', a: 'Yes. Insurers accept joint policies for couples who are not married, and for business partners, as long as each has a financial interest in the other’s life. What changes is around the policy: an unmarried survivor inherits without the spouse exemption from inheritance tax, and gets Bereavement Support Payment only with a child for whom Child Benefit is paid.' },
  ],
  body: (h) => {
    const pairs: Array<[number, number]> = [[30, 30], [35, 33], [40, 38], [45, 45], [50, 48]];
    const rows = pairs.map(([a, b]) => { const j = h.E.jointChances(a, 'm', b, 'f', 20); return [`${a} and ${b}`, h.pc(j.atLeastOne), h.pc(j.first), h.pc(j.second), h.pc(j.both)]; });
    return `
<h2>The odds for couples of different ages</h2>
<p>The table gives, for a man and a woman over 20 years, the chance that a joint first-death policy pays, the chance that each single policy pays, and the chance both singles pay. The joint figure is always higher than either single one, because it covers two lives, and lower than their sum, because it can only pay once. The ${h.src('ons_nlt', 'ONS national life tables')} are applied to each person independently.</p>
${h.table(['Ages', 'Joint first death pays', 'His single policy', 'Her single policy', 'Both singles pay'], rows, '20-year term, United Kingdom, ONS national life tables 2022 to 2024.', ['l', 'r', 'r', 'r', 'r'])}

<h2>What the survivor is left with</h2>
<p>After a joint policy pays, the survivor has no cover. If they still have children at home or debts of their own, they would have to buy a new policy at their new age, and any change in health since the first purchase counts against them. Two single policies leave the survivor with their own cover intact. That matters most for younger couples with long terms; for a couple whose only concern is clearing the mortgage at the first death, a joint policy does the job for less.</p>

<h2>When joint life insurance ends early</h2>
<p>A joint policy is a single contract for two people. If the couple separate, it cannot usually be split into two single policies, so the choice is to keep it going, with both still covered and one claim between them, or to cancel it and apply again, each at an older age and with any change in health since the start. Some insurers offer a separation option that lets each person take out a new single policy without fresh medical questions within a set time; it is worth asking whether one exists before buying. Two single policies avoid the question altogether, because each one belongs to the person it covers and continues whatever happens to the relationship.</p>

<p>A joint policy pays the same sum whoever dies first. Two single policies can be sized to each person: more on the higher earner, enough on the partner who does most of the childcare to pay for it. The ${h.a('home', 'life cover calculator')} can be run twice, once for each death, to see the two amounts.</p>

<p>A married survivor with a child for whom Child Benefit is paid can claim ${h.src('gov_bsp', 'Bereavement Support Payment')} at the higher rate after either death. A spouse or civil partner inherits free of ${h.src('gov_iht', 'inheritance tax')}; an unmarried partner does not, which is one reason to put either kind of policy in trust. Those rules apply in the same way to a joint or a single policy, so they do not decide between them. The choice comes down to cost against the cover the survivor keeps.</p>
`;
  },
});
