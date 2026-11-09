import { definePage } from '../../lib/guide-types';

const PROFIT = 150000, MONTHS = 12, RECRUIT = 25000;

export default definePage({
  id: 'key-person-insurance',
  group: 'tax',
  order: 410,
  tool: { kind: 'mini:keyperson', props: { profit: 150000, months: 12, recruit: 25000, lost: 0 } },
  related: ['self-employed-income-protection', 'life-insurance-in-trust', 'term-life-insurance', 'death-in-service'],
  sources: ['bim45525', 'ons_nlt'],
  slug: 'key-person-insurance',
  nav: 'Key person cover',
  card: 'Cover a business might set from the profit a person brings in, and the HMRC conditions for the premiums.',
  title: 'Key Person Insurance 2026: Sizing Cover and the HMRC Rules',
  description: 'Key person insurance in 2026: size the cover from the profit a person brings in and the cost of replacing them, and when HMRC lets the premiums be deducted.',
  h1: 'Key person insurance: how much cover, and how HMRC treats it',
  intro: 'A business can insure the life of someone whose loss would cut its profits. Enter the profit they bring in and the time it would take to replace them.',
  resume: (h) => {
    const r = h.E.keyPerson(PROFIT, MONTHS, RECRUIT, 0);
    return `Key person insurance is a policy a business takes out on the life of a director, employee or other person whose death or long absence would cut its profits. The business owns the policy, pays the premiums and receives the payout. One common way to size it is the profit the person brings in over the time it would take to replace them, plus the cost of finding and training a successor, plus any loans or contracts that depend on them. On ${h.m(PROFIT)} a year of gross profit, ${MONTHS} months to replace the person and ${h.m(RECRUIT)} of recruitment costs, that gives ${h.m(r.cover)}. HMRC’s Business Income Manual, at BIM45525, says the premiums are allowable against profits only if the sole purpose is to meet a loss of trading income from losing the person’s services, not a capital loss, and if a life policy is term insurance with no other benefits. Where the premiums are allowed, the payout is taxed as income of the trade.`;
  },
  faqs: (h) => [
    { q: 'Are key person insurance premiums tax deductible?', a: 'They can be. HMRC’s manual allows them when the sole purpose is to replace lost trading income from losing the key person, and when a life policy is term cover with no other benefits, for a term no longer than the person’s usefulness to the business. Premiums on whole of life or endowment policies are capital and are not deductible.' },
    { q: 'Is a key person insurance payout taxable?', a: 'If the premiums were allowed as a deduction, the payout is income of the trade, taxed under section 106 of ITTOIA 2005 for unincorporated businesses and section 103 of the Corporation Tax Act 2009 for companies. HMRC’s manual covers the case where the premiums were not allowed. An accountant can confirm the treatment for a given policy.' },
    { q: 'What is the difference between key person cover and shareholder protection?', a: 'Key person cover protects the business against lost profit, and the business receives the money. Shareholder protection lets the remaining owners buy the shares of an owner who dies, so the money goes to buying out the family. They answer different risks and are set up differently, with different tax treatment, so many businesses consider both.' },
  ],
  body: (h) => {
    const months = [6, 12, 18, 24];
    const rows = months.map((mo) => { const r = h.E.keyPerson(PROFIT, mo, RECRUIT, 0); return [`${mo} months`, h.m(r.profitPart), h.m(RECRUIT), h.m(r.cover)]; });
    const ages = [35, 45, 55];
    const rows2 = ages.map((a) => [h.num(a), h.pc(h.odds(a, 5, 'm')), h.pc(h.odds(a, 5, 'f'))]);
    return `
<h2>Cover by time to replace the person</h2>
<p>The table keeps ${h.m(PROFIT)} a year of gross profit and ${h.m(RECRUIT)} of recruitment and training, and changes only the months it would take to bring profit back to its level. A business that depends on one person’s clients or skills may need longer; one with a deputy ready may need less.</p>
${h.table(['Time to replace', 'Lost profit', 'Recruitment and training', 'Cover'], rows, 'Profit-based method, before any loans or contracts at risk. The figures are your own estimates.', ['l', 'r', 'r', 'r'])}

<h2>The HMRC conditions in plain terms</h2>
<p>${h.src('bim45525', 'BIM45525')} sets two conditions for the premiums to be allowable. First, the sole purpose of the insurance is to meet a loss of trading income that may result from losing the key person’s services, not a capital loss; HMRC gives guidance on non-trade purposes in the next section of the manual. Second, a life policy is term insurance, covering only the risk of death within the term with no other benefits, and the term should not extend beyond the period of the person’s usefulness to the company. Premiums on whole of life or endowment policies, or on critical illness or accident policies with an investment content, are capital expenditure and not deductible. Endowment policies taken out as a condition of a long-term loan are not deductible either.</p>
<p>When both conditions are met, the premiums are deducted and the payout is taxed as income of the trade. The two go together: a business cannot deduct the premiums and receive the payout free of tax.</p>

<h2>How often a short term pays</h2>
<p>Key person policies tend to run for short terms, in line with the condition on the person’s usefulness. The chance of a death claim within five years, on the ${h.src('ons_nlt', 'ONS life tables')}, is small at working ages, which is part of why the cover is affordable relative to the sum.</p>
${h.table(['Age of the key person', 'Death within 5 years, man', 'Death within 5 years, woman'], rows2, 'ONS 2022-2024, United Kingdom. Long absences through illness are a separate risk and are not counted here.', ['r', 'r', 'r'])}

<h2>Personal cover is separate</h2>
<p>A key person policy protects the business, not the person’s family. The family’s own need is sized on the ${h.a('home', 'life cover calculator')}; a director with no employer sick pay can look at the ${h.a('self-employed-income-protection', 'self-employed income protection')} page for the income side.</p>
<p>The figures in the calculator are the business’s own estimates. Writing down how each was reached, and keeping that note with the policy, keeps the reasoning clear for the insurer, for the accountant and for HMRC.</p>
`;
  },
});
