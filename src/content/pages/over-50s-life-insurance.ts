import { definePage } from '../../lib/guide-types';

const AGE = 60, PREM = 25, SUM = 5000, STOP = 90;

export default definePage({
  id: 'over-50s-life-insurance',
  group: 'later',
  order: 200,
  tool: { kind: 'mini:over50', props: { age: 60, premium: 25, sum: 5000, stop: 90, sex: 0 } },
  related: ['whole-of-life-insurance', 'life-insurance-over-60s', 'funeral-plans', 'funeral-expenses-payment'],
  sources: ['ons_nlt', 'fca_register', 'gov_funeral'],
  slug: 'over-50s-life-insurance',
  nav: 'Over 50s plans',
  card: 'The age at which your premiums add up to the fixed payout, and the ONS chance of living past it.',
  title: 'Over 50s Life Insurance 2026: When Premiums Pass the Payout',
  description: 'Over 50s life insurance in 2026: type your premium and payout to see the age at which you have paid in more than it pays, and the ONS odds of reaching it.',
  h1: 'Over 50s life insurance: the age you pay in more than it pays out',
  intro: 'Over 50s life insurance pays a fixed sum on death for a fixed monthly premium. No quote yet? Leave the example, or try the price from an advert or leaflet: the calculator uses only the figures you type and official UK death statistics.',
  resume: (h) => {
    const r = h.E.over50({ age: AGE, sex: 'm', premium: PREM, sum: SUM, stopAge: STOP });
    const f = h.E.over50({ age: AGE, sex: 'f', premium: PREM, sum: SUM, stopAge: STOP });
    return `An over 50s plan is a whole of life policy sold from age 50 up to an upper age each insurer sets, usually with guaranteed acceptance and no health questions. In return, the payout is small and fixed, and plans commonly pay back only the premiums if death from natural causes happens during a qualifying period at the start, set out in the policy. The question that decides its value is simple: how long until the premiums you pay add up to the sum your family receives. At ${h.m(PREM)} a month for a fixed ${h.m(SUM)}, a person who starts at ${AGE} has paid in the full payout by age ${h.num1(r.breakEvenAge)}. On the ONS National life tables for 2022 to 2024, the chance of living past that age is ${h.pc(r.aliveAtBreakEven)} for a man of ${AGE} and ${h.pc(f.aliveAtBreakEven)} for a woman of the same age. Past that point every further premium is money the family would have had anyway. A plan whose premiums stop at ${STOP} limits the total to ${h.m(r.maxPaid)}.`;
  },
  faqs: (h) => [
    { q: 'Is an over 50s plan worth it?', a: 'It is worth it for the family if death comes before the break-even age, and costs more than it pays if it comes after. The calculator gives both the age and the chance of living past it for your age and sex. Someone who simply wants money for a funeral can also compare putting the same premium into savings, which stay theirs if they need them.' },
    { q: 'What happens if I stop paying an over 50s plan?', a: 'With most plans the cover ends and nothing is paid back, however long you have paid. That is the main risk for people who start young: a premium that is affordable at 55 may not be at 85, and stopping then loses everything paid in. Read what the policy says about missed premiums and whether it has a cash-in value.' },
    { q: 'Does the payout of an over 50s plan go up with inflation?', a: 'Most plans pay a fixed sum that never changes, so its value falls over time as prices rise. Some offer a payout that rises each year in return for a rising premium. The calculator works with a fixed sum and a fixed premium; for a rising plan, run it with the figures for each year shown in the policy documents.' },
  ],
  body: (h) => {
    const ages = [50, 55, 60, 65, 70, 75, 80];
    const rows = ages.map((a) => { const m = h.E.over50({ age: a, sex: 'm', premium: PREM, sum: SUM, stopAge: STOP }); const f = h.E.over50({ age: a, sex: 'f', premium: PREM, sum: SUM, stopAge: STOP }); const ok = Number.isFinite(m.breakEvenAge); return [h.num(a), ok ? h.num1(m.breakEvenAge) : `not reached by ${STOP}`, ok ? h.pc(m.aliveAtBreakEven) : 'n/a', ok ? h.pc(f.aliveAtBreakEven) : 'n/a', h.num1(a + m.expectancy), h.num1(a + f.expectancy)]; });
    // The calculator's own premium (PREM) is one of the lines, so the reader finds the example again.
    const prems = [...new Set([15, 20, PREM, 30, 40, 60])].sort((x, y) => x - y);
    const rows2 = prems.map((p) => { const r = h.E.over50({ age: AGE, sex: 'm', premium: p, sum: SUM, stopAge: STOP }); return [h.m(p), Number.isFinite(r.breakEvenAge) ? h.num1(r.breakEvenAge) : 'not reached', h.pc(r.aliveAtBreakEven), h.m(r.paidToExpectancy)]; });
    return `
<h2>Break-even by starting age, same premium and payout</h2>
<p>The table keeps ${h.m(PREM)} a month and a fixed ${h.m(SUM)} and changes only the starting age. Real plans charge more the older you start, so for an older applicant, type the premium you were actually quoted. The “average age at death” lines give the age that someone already that age reaches on average (their age plus the years they have left), from the ${h.src('ons_nlt', 'ONS tables')}.</p>
${h.table(['Starting age', 'Premiums reach the payout at', 'Man alive then', 'Woman alive then', 'Average age at death, man', 'Average age at death, woman'], rows, `Premium ${h.m(PREM)} a month, payout ${h.m(SUM)}, premiums stop at ${STOP}. ONS 2022-2024, United Kingdom.`, ['r', 'r', 'r', 'r', 'r', 'r'])}

<h2>The premium you were quoted changes everything</h2>
<p>Break-even is the payout divided by the monthly premium, so a higher premium brings it closer. The “paid in by the average age at death” line is what a man starting at ${AGE} would have paid in by the age a man of ${AGE} reaches on average.</p>
${h.table(['Premium a month', 'Premiums reach the payout at', 'Chance of living past it', 'Paid in by the average age at death'], rows2, `Man aged ${AGE}, payout ${h.m(SUM)}, premiums stop at ${STOP}.`, ['r', 'r', 'r', 'r'])}

<h2>What over 50s life insurance is for</h2>
<p>Over 50s plans are often sold as a way to pay for a funeral. They are not funeral plans: the payout is cash to the estate or a named person, and nothing fixes what a funeral will cost when it happens. A ${h.a('funeral-plans', 'prepaid funeral plan')} buys the service itself from an FCA-authorised provider. For people on certain benefits, the ${h.a('funeral-expenses-payment', 'Funeral Expenses Payment')} from the state can cover part of the costs, though the estate pays it back first if it can.</p>

<h2>Before signing</h2>
<p>Check the length of the qualifying period and what is paid if death happens during it; whether premiums stop at an age or run for life; whether the payout is fixed or rising; and whether a free gift or a voucher is tied to the first premiums. The insurer should appear on the ${h.src('fca_register', 'FCA register')}. If you already hold a term or whole of life policy, the ${h.a('whole-of-life-insurance', 'whole of life calculator')} runs the same break-even on a larger sum.</p>
<h2>An alternative test: saving the premium</h2>
<p>One way to judge an over 50s plan is to compare it with putting the same monthly sum into a savings account. Saved, the money builds up at the same pace as the premiums and remains available, and at the break-even age the savings equal the plan’s payout before any interest. Before that age, the plan pays more than the savings would hold; after it, the savings hold more. The plan’s advantage is the early years and the certainty of a fixed sum for the family; the saver’s advantage is that the money stays theirs to use. The first table shows how long the early years last at each starting age.</p>
`;
  },
});
