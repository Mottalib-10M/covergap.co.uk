/**
 * Mini-calculators, one per subject (RECETTE §9.3). Each one calls the tested engine of
 * `lib/engine/protection.ts`; none computes on its own. A page sets its defaults with the `props` of its
 * ToolDef (same ids). No price is ever shown: a premium appears only when the user types their own quote.
 */
import type { MiniSpec } from './mini-types';
import { P } from './engine/params';
import * as E from './engine/protection';
import { formatMoney as fm, formatNumber } from './format';
import { pct } from './pct';

const m = (n: number) => fm(Math.round(n), 0);
const m2 = (n: number) => fm(n, 2);
const yrs = (n: number) => `${formatNumber(n, 1)} years`;
const age1 = (n: number) => (Number.isFinite(n) ? `age ${formatNumber(Math.floor(n), 0)}` : 'never');
const SEX = [{ value: '0', label: 'Male' }, { value: '1', label: 'Female' }];
const sx = (v: number): E.Sex => (v === 1 ? 'f' : 'm');
const AREA = E.AREAS.map((a, i) => ({ value: String(i), label: E.AREA_LABEL[a] }));
const ar = (v: number): E.Area => E.AREAS[Math.max(0, Math.min(E.AREAS.length - 1, Math.round(v)))];
const YESNO = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
const PARTNER = [{ value: '0', label: 'Married or civil partner' }, { value: '1', label: 'Living together' }, { value: '2', label: 'No partner' }];
const pt = (v: number) => (v === 1 ? 'cohabiting' : v === 2 ? 'none' : 'married') as 'married' | 'cohabiting' | 'none';
const money = (id: string, label: string, def: number, help?: string) => ({ id, label, def, unit: '£', max: 50_000_000, help });
const ageIn = (def: number, label = 'Age today') => ({ id: 'age', label, def, unit: 'yrs', max: 90 });
const W = P.weeksPerYear, M = P.monthsPerYear;

const SPECS: Record<string, MiniSpec> = {
  odds: {
    title: 'Chance a term policy pays out', cta: 'How much cover the family would need', ctaPage: 'home',
    inputs: [ageIn(35), { id: 'term', label: 'Term', def: 25, unit: 'yrs', max: 60 }, { id: 'sex', label: 'Sex', def: 0, options: SEX }, { id: 'area', label: 'Nation', def: 0, options: AREA }],
    run: (v) => { const p = E.payoutChance(v.age, v.term, sx(v.sex), ar(v.area));
      return { head: ['Pays out in', pct(p)], rows: [['Ends with no claim', pct(1 - p)], ['Odds', p > 0 ? `1 in ${formatNumber(Math.round(1 / p), 0)}` : 'none'], ['Policy ends at', age1(v.age + v.term)], ['Life expectancy now', yrs(E.lifeExpectancy(v.age, sx(v.sex), ar(v.area)))]], note: 'ONS national life tables 2022-2024, whole population. Insurers price on their own data.' }; },
  },
  term: {
    title: 'Level term cover: claim or expiry', cta: 'Size the cover first', ctaPage: 'home',
    inputs: [ageIn(32), money('sum', 'Cover amount', 250000), { id: 'term', label: 'Term', def: 30, unit: 'yrs', max: 60 }, { id: 'sex', label: 'Sex', def: 1, options: SEX }],
    run: (v) => { const p = E.payoutChance(v.age, v.term, sx(v.sex)); const half = E.payoutChance(v.age, v.term / 2, sx(v.sex));
      return { head: ['Chance of a claim', pct(p)], rows: [['In the first half of the term', pct(half)], ['Paid on a claim', m(v.sum)], ['Expires unused', pct(1 - p)]], note: 'A level term policy pays the same sum whenever the death happens in the term, and nothing after it.' }; },
  },
  mortgage: {
    title: 'Mortgage balance and decreasing cover', cta: 'Cover for the whole family', ctaPage: 'home',
    inputs: [money('loan', 'Mortgage today', 200000), { id: 'rate', label: 'Interest rate', def: 4.5, unit: '%', max: 20, decimals: 2 }, { id: 'years', label: 'Years left', def: 25, unit: 'yrs', max: 40 }, { id: 'at', label: 'Balance after', def: 10, unit: 'yrs', max: 40 }],
    run: (v) => { const b = E.mortgageBalance(v.loan, v.rate / 100, v.years, v.at);
      return { head: ['Still owed', m(b)], rows: [['Monthly repayment', m(E.mortgagePayment(v.loan, v.rate / 100, v.years))], ['Level cover of the full loan pays', m(v.loan)], ['Left over after clearing the loan', m(v.loan - b)]], note: 'Capital repayment mortgage. Interest-only loans do not fall, so decreasing cover does not fit them.' }; },
  },
  whole: {
    title: 'Whole of life: premiums against the payout', cta: 'Over 50s plans', ctaPage: 'over-50s-life-insurance',
    inputs: [ageIn(45), money('premium', 'Premium you were quoted, a month', 60), money('sum', 'Sum assured', 50000), { id: 'sex', label: 'Sex', def: 0, options: SEX }],
    run: (v) => { const r = E.over50({ age: v.age, sex: sx(v.sex), premium: v.premium, sum: v.sum });
      return { head: ['Premiums equal the payout at', age1(r.breakEvenAge)], rows: [['Chance of being alive then', pct(r.aliveAtBreakEven)], ['Paid if you live to life expectancy', m(r.paidToExpectancy)], ['Half of people your age live past', age1(r.median)]], note: 'Uses only the premium you type. Most whole of life policies pay out whenever death happens, so the question is how much is paid in first.' }; },
  },
  over50: {
    title: 'Over 50s plan: when premiums pass the payout', cta: 'Funeral plans compared', ctaPage: 'funeral-plans',
    inputs: [ageIn(60), money('premium', 'Your quoted premium, a month', 25), money('sum', 'Fixed payout', 5000), { id: 'stop', label: 'Premiums stop at', def: 90, unit: 'yrs', max: 120, help: '0 if paid for life' }, { id: 'sex', label: 'Sex', def: 0, options: SEX }],
    run: (v) => { const r = E.over50({ age: v.age, sex: sx(v.sex), premium: v.premium, sum: v.sum, stopAge: v.stop });
      return { head: ['You have paid in the payout by', age1(r.breakEvenAge)], rows: [['Chance of living past that age', pct(r.aliveAtBreakEven)], ['Paid if you reach life expectancy', m(r.paidToExpectancy)], ['Most you can pay in', Number.isFinite(r.maxPaid) ? m(r.maxPaid) : 'no limit']], note: 'ONS 2022-2024 rates for the whole population of your age and sex. Uses only the premium you type.' }; },
  },
  over60: {
    title: 'Ages your cover has to reach', cta: 'Over 50s plan break-even', ctaPage: 'over-50s-life-insurance',
    inputs: [ageIn(62), { id: 'sex', label: 'Sex', def: 1, options: SEX }, { id: 'area', label: 'Nation', def: 0, options: AREA }],
    run: (v) => { const s = (to: number) => E.survival(v.age, Math.max(0, to - v.age), sx(v.sex), ar(v.area));
      return { head: ['Life expectancy', yrs(E.lifeExpectancy(v.age, sx(v.sex), ar(v.area)))], rows: [['Chance of reaching 80', pct(s(80))], ['Chance of reaching 90', pct(s(90))], ['Chance a term to 80 pays out', pct(1 - s(80))]] }; },
  },
  ssp: {
    title: `Statutory Sick Pay from ${P.ssp.reformFrom.slice(0, 4)}`, cta: 'The whole sick pay timeline', ctaPage: 'income-protection-insurance',
    inputs: [money('weekly', 'Average weekly earnings', 450, 'Before tax, over the last 8 weeks')],
    run: (v) => { const s = E.sspWeekly(v.weekly);
      return { head: ['SSP a week', m2(s)], rows: [[`${pct(P.ssp.earningsShare)} of your earnings`, m2(P.ssp.earningsShare * v.weekly)], ['Flat rate cap', m2(P.ssp.weekly)], [`Over ${P.ssp.maxWeeks} weeks`, m(s * P.ssp.maxWeeks)]], note: 'Paid from the first day off sick. Taxed like wages.' }; },
  },
  gap: {
    title: 'Income during a long absence, first two years', cta: 'Deferred period that fits', ctaPage: 'income-protection-deferred-period',
    inputs: [money('pay', 'Gross pay a month', 2800), money('need', 'Monthly outgoings', 2000), { id: 'full', label: 'Full company sick pay', def: 4, unit: 'wks', max: 104 }, { id: 'half', label: 'Then half pay', def: 0, unit: 'wks', max: 104 }, money('ip', 'Income protection a month', 0, '0 if none'), { id: 'def', label: 'Deferred period', def: 13, unit: 'wks', max: 104 }],
    run: (v) => { const g = E.sickGap({ monthlyPay: v.pay, monthlyNeed: v.need, fullWeeks: v.full, halfWeeks: v.half, age: 40, employee: true, ipMonthly: v.ip, deferredWeeks: v.def });
      return { head: ['Shortfall over 104 weeks', m(g.shortfall)], rows: [['Income received, before tax', m(g.income)], ['SSP a week', m2(g.sspWeekly)], ['Savings would need to last', g.shortfall > 0 ? `${formatNumber(Math.round(g.shortfall / Math.max(1, v.need)), 0)} months of outgoings` : 'nothing']], note: 'New Style ESA work-related activity group assumed after the assessment, if your National Insurance record qualifies.' }; },
  },
  deferred: {
    title: 'Where company sick pay stops', cta: 'Full timeline with income protection', ctaPage: 'income-protection-insurance',
    inputs: [money('pay', 'Gross pay a month', 3200), { id: 'full', label: 'Full company sick pay', def: 13, unit: 'wks', max: 104 }, { id: 'half', label: 'Then half pay', def: 13, unit: 'wks', max: 104 }, money('need', 'Monthly outgoings', 2300), money('sav', 'Savings set aside', 6000)],
    run: (v) => { const g = E.sickGap({ monthlyPay: v.pay, monthlyNeed: v.need, fullWeeks: v.full, halfWeeks: v.half, age: 40, employee: true, savings: v.sav });
      const fullEnd = Math.round(v.full);
      return { head: ['Savings run out in week', g.savingsGoneWeek === null ? 'not in 2 years' : formatNumber(g.savingsGoneWeek + 1, 0)], rows: [['Full pay ends after', `${formatNumber(fullEnd, 0)} weeks`], ['All company pay ends after', `${formatNumber(fullEnd + Math.round(v.half), 0)} weeks`], ['Shortfall over 2 years', m(g.shortfall)]], note: 'A deferred period is usually chosen to start paying when full pay or savings stop, whichever comes first.' }; },
  },
  selfemp: {
    title: 'Self-employed: what the state pays while you cannot work', cta: 'Employees and sick pay', ctaPage: 'income-protection-insurance',
    inputs: [ageIn(42, 'Your age'), money('need', 'Monthly outgoings', 2200), money('sav', 'Savings set aside', 8000), { id: 'sup', label: 'Support group after assessment', def: 0, options: YESNO }],
    run: (v) => { const g = E.sickGap({ monthlyPay: 0, monthlyNeed: v.need, fullWeeks: 0, halfWeeks: 0, age: v.age, employee: false, support: v.sup === 1, savings: v.sav });
      const ass = E.esaWeekly(v.age, 'assessment'), grp = E.esaWeekly(v.age, v.sup === 1 ? 'support' : 'wrag');
      return { head: ['New Style ESA a month, first 13 weeks', m((ass * W) / M)], rows: [['Then a month', m((grp * W) / M)], ['Savings last until week', g.savingsGoneWeek === null ? 'beyond 2 years' : formatNumber(g.savingsGoneWeek + 1, 0)], ['Shortfall over 2 years', m(g.shortfall)]], note: `No Statutory Sick Pay when self-employed. New Style ESA needs enough National Insurance contributions; in the work-related activity group it stops after ${P.esa.wragDays} days.` }; },
  },
  ci: {
    title: 'A lump sum or a monthly income', cta: 'Income protection timeline', ctaPage: 'income-protection-insurance',
    inputs: [money('lump', 'Critical illness lump sum', 60000), money('need', 'Monthly outgoings', 2100), money('ip', 'Income protection a month', 1500), { id: 'months', label: 'Months off work', def: 24, unit: 'mths', max: 600 }],
    run: (v) => { const r = E.lumpVsIncome(v.lump, v.need, v.ip, v.months);
      return { head: ['The lump sum pays outgoings for', Number.isFinite(r.lumpMonths) ? `${formatNumber(r.lumpMonths, 1)} months` : 'any length'], rows: [['Income protection over the absence', m(r.ipTotal)], ['Share of outgoings it covers', pct(r.ipCoverShare)], ['Lump sum minus income paid', m(v.lump - r.ipTotal)]], note: 'Income protection pays after the deferred period and only while you cannot work; a lump sum pays once if the policy definition is met.' }; },
  },
  lifeci: {
    title: 'Combined life and critical illness: what is paid', cta: 'Size the life cover', ctaPage: 'home',
    inputs: [money('life', 'Life cover', 200000), money('ci', 'Critical illness cover', 200000), { id: 'combined', label: 'One combined policy', def: 1, options: YESNO }],
    run: (v) => { const both = v.combined === 1 ? Math.max(v.life, v.ci) : v.life + v.ci;
      return { head: ['Paid if a claim is made on both', m(both)], rows: [['Critical illness claim alone', m(v.ci)], ['Life cover left after that claim', m(v.combined === 1 ? Math.max(0, v.life - v.ci) : v.life)], ['Death claim alone', m(v.life)]], note: 'A combined (accelerated) policy pays once, on whichever claim comes first. Separate policies can each pay.' }; },
  },
  fib: {
    title: 'Family income benefit: what a claim pays', cta: 'Lump sum needed instead', ctaPage: 'home',
    inputs: [money('monthly', 'Monthly benefit', 2000), { id: 'term', label: 'Term', def: 20, unit: 'yrs', max: 50 }, { id: 'claim', label: 'Claim in year', def: 5, unit: '', max: 50 }],
    run: (v) => { const left = Math.max(0, v.term - v.claim);
      return { head: ['Paid out in total', m(E.fibTotal(v.monthly, v.term, v.claim))], rows: [['Years of payments left', formatNumber(left, 0)], ['Claim in year 1', m(E.fibTotal(v.monthly, v.term, 0))], ['Claim in the last year', m(E.fibTotal(v.monthly, v.term, Math.max(0, v.term - 1)))]], note: 'Payments run from the claim to the end of the term, so the total falls as the term goes on.' }; },
  },
  joint: {
    title: 'Joint policy or two single ones', cta: 'Size the cover', ctaPage: 'home',
    inputs: [{ id: 'a1', label: 'First person’s age', def: 40, unit: 'yrs', max: 90 }, { id: 's1', label: 'First person', def: 0, options: SEX }, { id: 'a2', label: 'Second person’s age', def: 38, unit: 'yrs', max: 90 }, { id: 's2', label: 'Second person', def: 1, options: SEX }, { id: 'term', label: 'Term', def: 25, unit: 'yrs', max: 60 }],
    run: (v) => { const j = E.jointChances(v.a1, sx(v.s1), v.a2, sx(v.s2), v.term);
      return { head: ['A joint first-death policy pays out in', pct(j.atLeastOne)], rows: [['First person’s own policy pays', pct(j.first)], ['Second person’s own policy pays', pct(j.second)], ['Two single policies both pay', pct(j.both)]], note: 'A joint policy pays once, at the first death, then ends. Two single policies can both pay.' }; },
  },
  trust: {
    title: 'Inheritance tax on a payout outside a trust', cta: 'Size the cover', ctaPage: 'home',
    inputs: [money('estate', 'Estate without the policy', 400000, 'Home, savings, after debts'), money('payout', 'Life policy payout', 250000), money('home', 'of which the home', 300000), { id: 'desc', label: 'Home to children or grandchildren', def: 1, options: YESNO }, { id: 'spouse', label: 'All left to a spouse', def: 0, options: YESNO }],
    run: (v) => { const r = E.ihtOnPayout({ estate: v.estate, payout: v.payout, home: v.home, toDescendants: v.desc === 1, toSpouse: v.spouse === 1 });
      return { head: ['Extra inheritance tax if paid to the estate', m(r.extra)], rows: [['Family keeps, policy in trust', m(r.familyGetsInTrust)], ['Family keeps, paid to the estate', m(r.familyGetsInEstate)], ['Threshold used', m(r.thresholdInEstate)]], note: `Tax at ${pct(P.iht.rate)} above the threshold. A spouse or civil partner inherits free of inheritance tax.` }; },
  },
  dis: {
    title: 'Death in service and the gap it leaves', cta: 'Full life cover calculation', ctaPage: 'home',
    inputs: [money('salary', 'Salary', 38000), { id: 'mult', label: 'Multiple of salary', def: 4, unit: '×', max: 10, decimals: 1 }, money('need', 'Cover the family would need', 300000)],
    run: (v) => { const lump = v.salary * v.mult;
      return { head: ['Death in service lump sum', m(lump)], rows: [['Gap to the need', m(Math.max(0, v.need - lump))], ['If you leave this job', m(0)], ['Share of the need covered', pct(v.need > 0 ? Math.min(1, lump / v.need) : 0)]], note: 'Paid only while you work for this employer, at the multiple the scheme sets.' }; },
  },
  keyperson: {
    title: 'Key person cover from lost profit', cta: 'Personal life cover', ctaPage: 'home',
    inputs: [money('profit', 'Gross profit the person brings in, a year', 150000), { id: 'months', label: 'Months to replace them', def: 12, unit: 'mths', max: 60 }, money('recruit', 'Recruitment and training cost', 25000), money('lost', 'Contracts or loans at risk', 0)],
    run: (v) => { const r = E.keyPerson(v.profit, v.months, v.recruit, v.lost);
      return { head: ['Cover a business might set', m(r.cover)], rows: [['Lost profit over the period', m(r.profitPart)], ['Recruitment and training', m(v.recruit)], ['Contracts or loans', m(v.lost)]], note: 'HMRC allows the premiums against profits only for term cover taken out to replace lost trading income (BIM45525); the payout is then taxed as trading income.' }; },
  },
  funeralplan: {
    title: 'Funeral plan: one payment or instalments', cta: 'What the state pays towards a funeral', ctaPage: 'funeral-expenses-payment',
    inputs: [money('price', 'Plan price paid in one go', 4200, 'From the provider’s quote'), money('monthly', 'Instalment a month', 125), { id: 'months', label: 'Number of instalments', def: 36, unit: 'mths', max: 600 }],
    run: (v) => { const r = E.planInstalments(v.price, v.monthly, v.months);
      return { head: ['Paid in total by instalments', m(r.total)], rows: [['Extra over the single price', m(r.extra)], ['Extra in percent', pct(Math.max(0, r.extraShare))], ['State help with a plan in place', `up to ${m(P.funeral.withPlan)}`]], note: 'Uses only the prices you type. Ask the provider what happens if instalments stop before the end.' }; },
  },
  fep: {
    title: 'Funeral Expenses Payment', cta: 'Funeral plans and the FCA', ctaPage: 'funeral-plans',
    inputs: [money('fees', 'Burial or cremation fees', 1100, 'Including the doctor’s certificate'), money('other', 'Other funeral costs', 3200, 'Funeral director, coffin, flowers'), { id: 'plan', label: 'The person had a funeral plan', def: 0, options: YESNO }],
    run: (v) => { const r = E.funeralPayment(v.fees, v.other, v.plan === 1);
      return { head: ['Most the payment can cover', m(r.total)], rows: [['Burial or cremation fees', m(r.fees)], ['Other costs, capped', `${m(r.other)} of ${m(r.cap)}`], ['Left to pay', m(r.gap)]], note: `Only for someone getting a qualifying benefit and arranging the funeral; claim within ${P.funeral.claimMonths} months. Any money in the estate is taken back.` }; },
  },
  bsp: {
    title: 'Bereavement Support Payment for your partner', cta: 'Cover on top of it', ctaPage: 'home',
    inputs: [{ id: 'partner', label: 'You and your partner', def: 1, options: PARTNER }, { id: 'kids', label: 'Child Benefit for a child at home', def: 1, options: YESNO }],
    run: (v) => { const b = E.bsp(pt(v.partner), v.kids === 1);
      return { head: ['Paid to your partner in total', m(b.total)], rows: [['One-off payment', m(b.lump)], [`Then ${P.bsp.months} monthly payments of`, m(b.monthly)], ['Rate', b.rate === 'none' ? 'not due' : b.rate]], note: `Claim within ${P.bsp.fullClaimMonths} months of the death for the full amount; the person who died must have paid enough National Insurance.` }; },
  },
};

export function getSpec(kind: string, _lang = 'en'): MiniSpec {
  const s = SPECS[kind];
  if (!s) throw new Error(`Unknown mini spec ${kind}`);
  return s;
}
export const SPEC_IDS = Object.keys(SPECS);
