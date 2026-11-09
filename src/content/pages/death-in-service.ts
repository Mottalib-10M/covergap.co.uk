import { definePage } from '../../lib/guide-types';

const SAL = 38000, MULT = 4, NEED = 300000;

export default definePage({
  id: 'death-in-service',
  group: 'life',
  order: 70,
  tool: { kind: 'mini:dis', props: { salary: 38000, mult: 4, need: 300000 } },
  related: ['home', 'life-insurance-unmarried-couples', 'term-life-insurance', 'income-protection-insurance'],
  sources: ['gov_valuing', 'gov_bsp', 'ons_nlt'],
  slug: 'death-in-service',
  nav: 'Death in service',
  card: 'The lump sum an employer pays, the gap it leaves against what the family needs, and what happens when you change job.',
  title: 'Death in Service Benefit 2026: Is Work Life Cover Enough',
  description: 'Death in service benefit in 2026: what a multiple of salary pays, the gap it leaves against what a family needs, and why the cover stops when you leave the job.',
  h1: 'Death in service: how far work life cover goes',
  intro: 'Many employers pay a lump sum, usually a multiple of salary, if you die while you work for them. Enter yours and the cover your family would need.',
  resume: (h) => {
    const lump = SAL * MULT;
    return `Death in service is life cover provided through an employer, usually as part of its pension scheme or a group life policy. If an employee dies while employed, the scheme pays a lump sum, most often a multiple of salary, to the family or to whoever the trustees choose. On a salary of ${h.m(SAL)}, a four times multiple pays ${h.m(lump)}. Against a family need of ${h.m(NEED)}, which covers a mortgage, some years of income and the children’s costs, that leaves a gap of ${h.m(Math.max(0, NEED - lump))}. The benefit costs the employee nothing directly, but it has two limits that a personal policy does not. It ends the day the job ends, whether through a new job, redundancy, a career break or retirement. And the amount moves with salary and with the scheme’s rules, which the employer can change.`;
  },
  faqs: (h) => [
    { q: 'Do I need life insurance if I have death in service at work?', a: 'Only if the work benefit does not cover what your family would need, or if you might leave the job while they still depend on you. Enter the multiple in the calculator against your need. If it covers the gap today, a personal policy adds a second payout; if it falls short, a smaller personal policy can fill the difference and stays with you between jobs.' },
    { q: 'What happens to death in service if I go part-time or on long-term sick leave?', a: 'The benefit is usually linked to your current salary, so going part-time can cut it in proportion. On long-term sick leave, many schemes keep cover going while you remain an employee, but some cap it or stop it after a set time. The scheme booklet or the HR team states the rules for your employer; nothing is fixed by law.' },
    { q: 'Who gets my death in service payment?', a: 'In many schemes the trustees decide, guided by the expression of wishes form you fill in, which is why it often reaches a partner quickly and outside probate. A form that is out of date, naming a former partner for example, can lead to delays or a decision you would not have chosen. Updating it is free and takes minutes.' },
  ],
  body: (h) => {
    const mults = [1, 2, 3, 4];
    const rows = mults.map((x) => [`${x} × salary`, h.m(SAL * x), h.m(Math.max(0, NEED - SAL * x)), h.pc(Math.min(1, (SAL * x) / NEED))]);
    const r = h.E.coverNeed({ mortgage: 160000, debts: 5000, funeral: 5000, income: 20000, years: 12, extra: 10000, savings: 10000, deathInService: SAL * MULT, existing: 0, partner: 'married', children: true, countBsp: true });
    const without = h.E.coverNeed({ mortgage: 160000, debts: 5000, funeral: 5000, income: 20000, years: 12, extra: 10000, savings: 10000, deathInService: 0, existing: 0, partner: 'married', children: true, countBsp: true });
    return `
<h2>Common multiples against one family’s need</h2>
<p>Each employer sets its own multiple, and it is printed in the scheme booklet. The table sets each one against a need of ${h.m(NEED)} for an employee on ${h.m(SAL)}.</p>
${h.table(['Multiple', 'Lump sum', 'Gap left', 'Share of the need covered'], rows, `Salary ${h.m(SAL)}, family need ${h.m(NEED)}. The need is your own figure.`, ['l', 'r', 'r', 'r'])}

<h2>The same family, with and without the job</h2>
<p>Put a family through the ${h.a('home', 'life cover calculator')}: a married parent with a child at home, ${h.m(160000)} left on the mortgage, ${h.m(20000)} a year of income needed for twelve years and ${h.m(10000)} of savings. With death in service of four times salary, and ${h.src('gov_bsp', 'Bereavement Support Payment')} counted, the cover still needed is ${h.m(r.need)}. If the same parent leaves the job, or the new employer offers no death in service, the need jumps to ${h.m(without.need)}. A personal policy priced at today’s age and health is cheaper than the same policy bought after a gap, so some people buy enough personal cover to bridge a job change rather than relying on the next employer.</p>

<h2>What death in service usually is, and is not</h2>
<p>It is normally a lump sum, sometimes with a spouse’s or dependant’s pension on top in a defined benefit scheme. It is not income protection: if you are alive but cannot work, death in service pays nothing. And it is not an asset you own. Benefits paid at the trustees’ discretion are usually outside your estate; a lump sum paid to the estate would be counted in it, as ${h.src('gov_valuing', 'GOV.UK’s guide to valuing an estate')} shows for any payment made on death.</p>

<h2>Checking your own cover</h2>
<p>The figure is in the scheme booklet, the benefits portal or the annual benefit statement. Three things are worth noting at the same time: the multiple, whether it is of basic salary or of total pay including bonuses, and whether the cover stops at a set age. For most people the odds of the benefit ever being paid are low, as the ${h.src('ons_nlt', 'ONS life tables')} show, but the families who do rely on it rely on it entirely.</p>
<h2>Changing jobs with a family to protect</h2>
<p>Before leaving a job, it helps to check whether the new employer offers death in service, from what date and at what multiple; some schemes start only after a probation period. The weeks between the two jobs are covered by neither. A personal term policy taken out while still employed, sized on the gap the ${h.a('home', 'calculator')} shows without the work benefit, removes that risk for the length of the term. It also keeps cover in place through a career break or redundancy, which is when a family is least able to absorb a loss.</p>
`;
  },
});
