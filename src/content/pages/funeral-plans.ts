import { definePage } from '../../lib/guide-types';

const PRICE = 4200, MONTHLY = 125, MONTHS = 36;

export default definePage({
  id: 'funeral-plans',
  group: 'funeral',
  order: 300,
  tool: { kind: 'mini:funeralplan', props: { price: 4200, monthly: 125, months: 36 } },
  related: ['funeral-expenses-payment', 'over-50s-life-insurance', 'whole-of-life-insurance', 'life-insurance-over-60s'],
  sources: ['fca_funeral', 'fca_ps2115', 'fca_register', 'gov_funeral'],
  slug: 'funeral-plans',
  nav: 'Funeral plans',
  card: 'What FCA regulation changed, how to check a provider, and what instalments cost against paying in one go.',
  title: 'Funeral Plans 2026: FCA Checks and the Cost of Instalments',
  description: 'Funeral plans in 2026: why the provider must be FCA-authorised, what the Ombudsman and FSCS cover, and how much more instalments cost than paying in one go.',
  h1: 'Funeral plans: the FCA checks and the price of paying monthly',
  intro: 'A prepaid funeral plan buys a funeral at today’s price. Type the single price and the instalment offer from a quote to see the difference.',
  resume: (h) => {
    const r = h.E.planInstalments(PRICE, MONTHLY, MONTHS);
    return `A prepaid funeral plan is a contract to provide a funeral in the future, paid for now, in one go or by instalments. Since ${h.date(h.P.funeral.fcaFrom)} the Financial Conduct Authority regulates the providers. A provider must be authorised by the FCA and hold the right permissions; if it is not, the buyer has no access to the Financial Ombudsman Service for complaints and no protection from the Financial Services Compensation Scheme if the firm fails, so getting the money back is unlikely. The FCA’s Firm Checker shows whether a provider is authorised. The plan money is held in a trust or backed by a whole of life insurance policy, under the FCA’s rules. Paying monthly usually costs more: on a single price of ${h.m(PRICE)}, ${MONTHS} instalments of ${h.m(MONTHLY)} add up to ${h.m(r.total)}, or ${h.m(r.extra)} more. This site shows no plan prices; the calculator uses only the figures from your own quote.`;
  },
  faqs: (h) => [
    { q: 'How do I check a funeral plan provider is FCA authorised?', a: 'Use the FCA Firm Checker: search for the provider by name, select the funeral plan service and check that it can enter into funeral plan contracts and administer claims. A funeral director may sell a plan as an appointed representative of another firm, its principal, which is the provider to check. Your paperwork names the provider.' },
    { q: 'What happens to my funeral plan if the provider stops trading?', a: 'If the provider was authorised, you have access to the Financial Services Compensation Scheme, and the FCA rules on trusts and insurance arrangements are designed to protect customers when a firm fails. If you cannot find your provider on the Firm Checker, the FCA says it has either transferred its plans to an authorised provider or wound down, and points to a tracing service.' },
    { q: 'Is a funeral plan better than an over 50s plan?', a: 'They do different things. A funeral plan pays for a set list of funeral services, whatever they cost when they are needed. An over 50s plan pays a fixed sum of cash, which may or may not cover a funeral by then. Comparing the price of each, the list of what is included and what happens if payments stop is the fair test.' },
    { q: 'Does a funeral plan affect the Funeral Expenses Payment?', a: `Yes. If the person who died had a prepaid funeral plan, the Funeral Expenses Payment can pay only up to ${h.m(h.P.funeral.withPlan)} for items the plan does not cover, instead of up to ${h.m(h.P.funeral.otherExpenses)} for other funeral costs. The payment is also reduced by money from the estate.` },
  ],
  body: (h) => {
    const counts = [12, 24, 36, 60, 120];
    const rows = counts.map((n) => { const r = h.E.planInstalments(PRICE, MONTHLY, n); return [`${n} months`, h.m(r.total), h.m(r.extra), h.pc(Math.max(0, r.extraShare))]; });
    return `
<h2>What instalments add, for different lengths</h2>
<p>The table keeps a single price of ${h.m(PRICE)} and an instalment of ${h.m(MONTHLY)}, and changes only the number of payments. A real offer sets both the instalment and the number together; type yours into the calculator. A negative extra means the instalments add up to less than the single price.</p>
${h.table(['Instalments', 'Total paid', 'Extra over the single price', 'Extra in percent'], rows, `Single price ${h.m(PRICE)}, instalment ${h.m(MONTHLY)} a month. Example figures, not a price.`, ['l', 'r', 'r', 'r'])}

<h2>What changed with FCA regulation</h2>
<p>The FCA began regulating prepaid funeral plans on ${h.date(h.P.funeral.fcaFrom)}. Its ${h.src('fca_ps2115', 'policy statement PS21/15')} set rules on how providers hold the money through trust and insurance arrangements, on what happens if a provider fails, and on access to the Financial Services Compensation Scheme. Before that date, plans were not regulated and customers had no access to the Ombudsman or to the compensation scheme. The ${h.src('fca_funeral', 'FCA’s consumer page')} explains how to check a provider and what to do if yours no longer appears.</p>

<h2>Checking a provider</h2>
<p>Search the provider’s name on the ${h.src('fca_register', 'FCA register')}, select the funeral plan service, and look under what the firm can do for two permissions: entering into a funeral plan contract, and administering claims on an existing plan. Where the firm that sold the plan is an appointed representative, the provider is its principal, and that is the firm to look up.</p>

<h2>Reading the plan</h2>
<p>Plans differ in what they include. Check whether the price covers the third-party costs, such as the cremation or burial fee and the doctor’s certificate, or only the funeral director’s services; whether a burial plot is included; what happens if instalments stop before the end; whether the plan can be cancelled and what is refunded; and whether the funeral director can be changed or the plan moved if you move house. The plan only fixes the services it lists. For people on certain benefits, the ${h.a('funeral-expenses-payment', 'Funeral Expenses Payment')} can help with costs a plan does not cover, within a lower limit, as shown on ${h.src('gov_funeral', 'GOV.UK')}.</p>
<h2>Who the plan is with</h2>
<p>A funeral plan may be sold by one firm and provided by another, and delivered by a funeral director who is neither. The FCA points out that a funeral director who is an appointed representative may sell a plan from its principal, even if it will carry out the funeral. Your paperwork names the provider; if it does not, the firm that sold the plan can tell you.</p>
`;
  },
});
