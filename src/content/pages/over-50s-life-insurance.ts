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
  card: 'The age at which your premiums add up to the fixed payout, and the chance of living past it, from official UK death statistics.',
  title: 'Over 50s Life Insurance 2026: When Premiums Pass the Payout',
  description: 'Over 50s life insurance in 2026: type your premium and payout to see the age at which you have paid in more than it pays, and the ONS odds of reaching it.',
  h1: 'Over 50s life insurance: the age you pay in more than it pays out',
  intro: 'Over 50s life insurance pays a fixed sum on death for a fixed monthly premium. No quote yet? Leave the example, or try the price from an advert or leaflet: the calculator uses only the figures you type and official UK death statistics.',
  resume: (h) => {
    const r = h.E.over50({ age: AGE, sex: 'm', premium: PREM, sum: SUM, stopAge: STOP });
    // Brief of 2026-11-10 (rules 1 and 3): the calculator's case, one figure per sentence, ages in whole years.
    return `An over 50s plan is a whole of life policy sold from age 50, usually with guaranteed acceptance and no health questions. In return, the payout is small and fixed. Plans commonly pay back only the premiums if death from natural causes comes during a first period set out in the policy, called the qualifying period. The question that decides its value is simple: how long until the premiums you pay add up to the sum your family receives? Take the example in the calculator: a man of ${AGE} paying ${h.m(PREM)} a month for a fixed ${h.m(SUM)}. He has paid in the whole payout by about age ${h.num(Math.round(r.breakEvenAge))}. The official UK death statistics (the ONS life tables for 2022 to 2024) give him a ${h.pc(r.aliveAtBreakEven)} chance of living past that age. Past that point, every further premium is money the family would have had anyway.`;
  },
  faqs: (h) => [
    { q: 'Is an over 50s plan worth it?', a: 'It is worth it for the family if death comes before the break-even age, and costs more than it pays if it comes after. The calculator gives both the age and the chance of living past it for your age and sex. Someone who simply wants money for a funeral can also compare putting the same premium into savings, which stay theirs if they need them.' },
    { q: 'What happens if I stop paying an over 50s plan?', a: 'With most plans the cover ends and nothing is paid back, however long you have paid. That is the main risk for people who start young: a premium that is affordable at 55 may not be at 85, and stopping then loses everything paid in. Read what the policy says about missed premiums and whether it has a cash-in value.' },
    { q: 'Does the payout of an over 50s plan go up with inflation?', a: 'Most plans pay a fixed sum that never changes, so its value falls over time as prices rise. Some offer a payout that rises each year in return for a rising premium. The calculator works with a fixed sum and a fixed premium; for a rising plan, run it with the figures for each year shown in the policy documents.' },
  ],
  body: (h) => {
    const ages = [50, 55, 60, 65, 70, 75, 80];
    // Testers of 2026-11-10: “76.7” as an age, “n/a” and “average age at death” lost the reader of 61. Ages in
    // whole years, a sentence instead of “n/a”, and the table keeps the chance of living past break-even only.
    const rows = ages.map((a) => { const m = h.E.over50({ age: a, sex: 'm', premium: PREM, sum: SUM, stopAge: STOP }); const f = h.E.over50({ age: a, sex: 'f', premium: PREM, sum: SUM, stopAge: STOP }); const ok = Number.isFinite(m.breakEvenAge); return [h.num(a), ok ? `about ${h.num(Math.round(m.breakEvenAge))}` : `never: premiums stop at ${STOP} first`, ok ? h.pc(m.aliveAtBreakEven) : 'no one pays in more', ok ? h.pc(f.aliveAtBreakEven) : 'no one pays in more']; });
    return `
<h2>When you have paid in the payout, by starting age</h2>
<p>The table keeps ${h.m(PREM)} a month and a fixed ${h.m(SUM)} and changes only the starting age. Real plans charge more the older you start, so for an older applicant, type the premium you were actually quoted. Past the age in the second column, every premium is money the family would have had anyway.</p>
${h.table(['Starting age', 'You have paid in the payout by', 'Chance a man lives past it', 'Chance a woman lives past it'], rows, `Premium ${h.m(PREM)} a month, payout ${h.m(SUM)}, premiums stop at ${STOP}. Official UK death statistics (${h.src('ons_nlt', 'ONS life tables')}) 2022-2024.`, ['r', 'r', 'r', 'r'])}

<h2>What over 50s life insurance is for</h2>
<p>Over 50s plans are often sold as a way to pay for a funeral. They are not funeral plans: the payout is cash to the estate or a named person, and nothing fixes what a funeral will cost when it happens. A ${h.a('funeral-plans', 'prepaid funeral plan')} buys the service itself from a provider authorised by the FCA (Financial Conduct Authority, the UK regulator). For people on certain benefits, the ${h.a('funeral-expenses-payment', 'Funeral Expenses Payment')} from the state can cover part of the costs, though the estate pays it back first if it can.</p>

<h2>Before signing</h2>
<p>Four checks, all in the plan’s leaflet:</p>
<ul><li>how long the first period is during which only the premiums are paid back (the qualifying period), and how long it lasts;</li><li>whether premiums stop at an age or run for life;</li><li>whether the payout is fixed or rises;</li><li>whether a free gift or a voucher is tied to the first premiums.</li></ul>
<p>The insurer should appear on the ${h.src('fca_register', 'FCA register')}, the regulator’s public list. If you already hold a term or whole of life policy, the ${h.a('whole-of-life-insurance', 'whole of life calculator')} runs the same break-even on a larger sum.</p>

<p>Saving instead is the other way to look at it. One way to judge an over 50s plan is to compare it with putting the same monthly sum into a savings account. Saved, the money builds up at the same pace as the premiums and remains available, and at the break-even age the savings equal the plan’s payout before any interest. Before that age, the plan pays more than the savings would hold; after it, the savings hold more. The plan’s advantage is the early years and the certainty of a fixed sum for the family; the saver’s advantage is that the money stays theirs to use. The first table shows how long the early years last at each starting age.</p>

`;
  },
});
