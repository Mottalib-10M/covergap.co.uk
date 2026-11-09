import { definePage } from '../../lib/guide-types';

const FEES = 1100, OTHER = 3200;

export default definePage({
  id: 'funeral-expenses-payment',
  group: 'funeral',
  order: 310,
  tool: { kind: 'mini:fep', props: { fees: 1100, other: 3200, plan: 0 } },
  related: ['funeral-plans', 'over-50s-life-insurance', 'home', 'life-insurance-unmarried-couples'],
  sources: ['gov_funeral', 'gov_bsp', 'gov_uc'],
  slug: 'funeral-expenses-payment',
  nav: 'Funeral Expenses Payment',
  card: 'What the state pays towards a funeral for people on certain benefits, the cap on other costs and what is left.',
  title: 'Funeral Expenses Payment 2026: What the State Pays Towards',
  description: 'Funeral Expenses Payment in 2026: who can claim, the fees it pays in full, the cap on other funeral costs, the lower cap with a funeral plan, and the deadline.',
  h1: 'Funeral Expenses Payment: what it covers and what is left to pay',
  intro: 'The payment helps people on certain benefits who are arranging a funeral. Enter the fees and other costs from the funeral director’s quote.',
  resume: (h) => {
    const F = h.P.funeral;
    const r = h.E.funeralPayment(FEES, OTHER, false);
    return `The Funeral Expenses Payment, also called a Funeral Payment, helps with the cost of a funeral you are arranging if you or your partner get a qualifying benefit, such as Universal Credit, Pension Credit, income-related ESA or Housing Benefit. It can pay burial fees for a particular plot or cremation fees, including the doctor’s certificate, travel to arrange or attend the funeral, moving the body more than 50 miles within the UK, and death certificates. On top of that it pays up to ${h.m(F.otherExpenses)} for other costs such as the funeral director, flowers or the coffin, or only up to ${h.m(F.withPlan)} for items not covered if the person had a prepaid funeral plan. With ${h.m(FEES)} of fees and ${h.m(OTHER)} of other costs, the most it can cover is ${h.m(r.total)}, leaving ${h.m(r.gap)} to find. It is deducted from any money you later receive from the estate, and must be claimed within ${F.claimMonths} months of the funeral.`;
  },
  faqs: (h) => [
    { q: 'Who can claim the Funeral Expenses Payment?', a: 'The partner of the person who died, the parent of a child who died, or in some cases a close relative or friend, if they get a qualifying benefit and are arranging a funeral in the UK, the EEA or Switzerland. A close relative who is working or not on a qualifying benefit can stop a claim by someone else. GOV.UK sets out the exact rules.' },
    { q: 'Is there Funeral Expenses Payment in Scotland?', a: 'No. In Scotland it has been replaced by the Funeral Support Payment, run by Social Security Scotland, which has its own rules and amounts. Northern Ireland has a separate way to claim. The figures on this page are those GOV.UK gives for the Funeral Expenses Payment in England and Wales.' },
    { q: 'Can I claim before the funeral has been paid?', a: 'Yes, if you have an invoice or a signed contract from the funeral director; an estimate is not enough. If you have not paid yet, the money is paid directly to the funeral director. If you have paid, it goes into your account. You can claim by phone through the Bereavement Service helpline or by post with form SF200.' },
  ],
  body: (h) => {
    const F = h.P.funeral;
    const others = [1000, 2000, 3000, 4500];
    const rows = others.map((o) => { const n = h.E.funeralPayment(FEES, o, false), p = h.E.funeralPayment(FEES, o, true); return [h.m(o), h.m(n.total), h.m(n.gap), h.m(p.total), h.m(p.gap)]; });
    const bsp = h.E.bsp('married', true);
    return `
<h2>What is paid against different funeral costs</h2>
<p>The fees are paid in full in this example; other costs are capped. The two “with a plan” lines show the lower cap of ${h.m(F.withPlan)} when the person had a prepaid funeral plan, which assumes the plan pays for the rest.</p>
${h.table(['Other funeral costs', 'Most paid, no plan', 'Left to pay, no plan', 'Most paid, with a plan', 'Not covered by the payment, with a plan'], rows, `Burial or cremation fees ${h.m(FEES)}. Caps from ${h.src('gov_funeral', 'GOV.UK')}. Any money from the estate is taken back.`, ['r', 'r', 'r', 'r', 'r'])}

<h2>The estate comes first</h2>
<p>GOV.UK states that the payment is deducted from any money you get from the estate of the person who died. The estate here includes their money and property, but not a house or personal things left to a widow, widower or surviving civil partner. Money from an insurance policy can also reduce what is paid. So for a family with a life policy or savings, the payment is a bridge rather than a gift. A policy written in trust pays the beneficiaries directly and is not part of the estate.</p>

<h2>Other bereavement support</h2>
<p>A partner who was married or in a civil partnership, or living together with children, may also be able to claim ${h.src('gov_bsp', 'Bereavement Support Payment')}, up to ${h.m(bsp.total)} in all at the higher rate, if the person who died paid enough National Insurance and the partner is under State Pension age. It is a separate claim. ${h.src('gov_uc', 'Universal Credit')} is one of the qualifying benefits for the funeral payment; if you have applied for a qualifying benefit and are waiting, you can still claim.</p>

<h2>Planning ahead</h2>
<p>For people who will not be on a qualifying benefit, the state pays nothing towards a funeral, and costs fall on the estate or the family. The usual ways to prepare are savings, a ${h.a('funeral-plans', 'prepaid funeral plan')}, an ${h.a('over-50s-life-insurance', 'over 50s plan')} or a funeral budget inside a larger life policy, which the ${h.a('home', 'life cover calculator')} includes as a line. Claims must be made within ${F.claimMonths} months of the funeral.</p>
<h2>What to keep for the claim</h2>
<p>The claim asks for details of the person who died, the relationship, the benefits you get and the funeral costs. Keeping the funeral director’s invoice or signed contract, the death certificate and your benefit award letters together makes the claim quicker. If a decision goes against you, it can be appealed to the Social Security and Child Support Tribunal, as GOV.UK explains. The Bereavement Service helpline can also check whether you can claim other bereavement benefits in the same call.</p>
`;
  },
});
