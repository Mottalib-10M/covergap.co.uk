/**
 * Mini-calculators, one per subject (RECETTE §9.3). Each one calls the tested engine of
 * `lib/engine/protection.ts`; none computes on its own. A page sets its defaults with the `props` of its
 * ToolDef (same ids). No price is ever shown: a premium appears only when the user types their own quote.
 */
import type { MiniSpec } from './mini-types';
import { P } from './engine/params';
import * as E from './engine/protection';
import { formatMoney as fm, formatNumber } from './format';
import { pct, inWords } from './pct';
import { DEFAULT_AGE, SICK_DEFAULTS as SD, article } from './cover-defaults';

const m = (n: number) => fm(Math.round(n), 0);
const m2 = (n: number) => fm(n, 2);
const yrs = (n: number) => `${formatNumber(n, 1)} years`;
const age1 = (n: number) => (Number.isFinite(n) ? `age ${formatNumber(Math.floor(n), 0)}` : 'never');
/** Age with one decimal, as in the tables of the same pages (76.7, not 76 here and 76.7 there). */
// Testers of 2026-11-10: “age 76.7” read oddly; an age is said in whole years, “about age 77”.
const age1d = (n: number) => (Number.isFinite(n) ? `about age ${formatNumber(Math.round(n), 0)}` : 'never');
/** Life expectancy in one wording on every page: years left, then the age reached. */
const yearsLeft = (age: number, ex: number) => `${formatNumber(ex, 1)} more years (to about ${formatNumber(Math.round(age + ex), 0)})`;
const SEX = [{ value: '0', label: 'Male' }, { value: '1', label: 'Female' }];
/** “a man of 40 taking a 25-year policy”, for the “Example” mention. */
const whoTerm = (v: Record<string, number>) => `${v.sex === 1 ? 'a woman' : 'a man'} of ${formatNumber(v.age, 0)} taking ${article(v.term)} ${formatNumber(v.term, 0)}-year policy`;
const sx = (v: number): E.Sex => (v === 1 ? 'f' : 'm');
const AREA = E.AREAS.map((a, i) => ({ value: String(i), label: E.AREA_LABEL[a] }));
const ar = (v: number): E.Area => E.AREAS[Math.max(0, Math.min(E.AREAS.length - 1, Math.round(v)))];
const YESNO = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
const PARTNER = [{ value: '0', label: 'Married or civil partner' }, { value: '1', label: 'Living together' }, { value: '2', label: 'No partner' }];
const pt = (v: number) => (v === 1 ? 'cohabiting' : v === 2 ? 'none' : 'married') as 'married' | 'cohabiting' | 'none';
const money = (id: string, label: string, def: number, help?: string) => ({ id, label, def, unit: '£', max: 50_000_000, help });
const ageIn = (def: number, label = 'Your age today') => ({ id: 'age', label, def, unit: 'years', max: 90 });
const who = (v: Record<string, number>) => `${v.sex === 1 ? 'A woman' : 'A man'} of ${formatNumber(v.age, 0)}`;
const STATS = 'official UK death statistics (ONS, the Office for National Statistics, 2022-2024)';
const W = P.weeksPerYear, M = P.monthsPerYear;

const SPECS: Record<string, MiniSpec> = {
  odds: {
    // Testers of 2026-11-10: this tool repeated the term page (same fields, same 12%). It now answers the page's
    // own question, your age against the length of the policy, and no longer prints years left to live.
    title: 'Your age, your odds: the chance a policy pays out', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [ageIn(DEFAULT_AGE), { id: 'sex', label: 'Sex', def: 0, options: SEX }, { id: 'area', label: 'Where you live (UK nation)', def: 0, options: AREA, avance: true }],
    run: (v) => { const c = (a: number, t: number) => E.payoutChance(a, t, sx(v.sex), ar(v.area));
      return { head: ['Over 20 years, chance a policy starting now pays out', pct(c(v.age, 20))], sub: `${who(v)}, at today’s death rates. For everyone else the policy ends with nothing paid.`, rows: [['Over 10 years', pct(c(v.age, 10))], ['Over 25 years', pct(c(v.age, 25))], ['Over 20 years, starting 10 years later', pct(c(v.age + 10, 20))]], note: `From ${STATS}, whole population. Insurers price on their own data, and healthy applicants claim less often.` }; },
    exemple: (v) => `${v.sex === 1 ? 'a woman' : 'a man'} of ${formatNumber(v.age, 0)}`,
    portes: [{ label: 'Man of 40', v: { age: 40, sex: 0 } }, { label: 'Woman of 40', v: { age: 40, sex: 1 } }, { label: 'Aged 30', v: { age: 30, sex: 0 } }, { label: 'Aged 60', v: { age: 60, sex: 1 } }],
  },
  term: {
    title: 'Level term cover: claim or expiry', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [ageIn(DEFAULT_AGE), { id: 'term', label: 'Length of the policy', def: 25, unit: 'years', max: 60, help: 'Until the mortgage ends or the youngest child is 18. Not sure? Leave 25.' }, { id: 'sex', label: 'Sex', def: 0, options: SEX }],
    run: (v) => { const p = E.payoutChance(v.age, v.term, sx(v.sex)); const half = E.payoutChance(v.age, v.term / 2, sx(v.sex));
      return { head: [`Over the ${formatNumber(v.term, 0)} years, chance the policy pays out`, pct(p)], sub: `${who(v)}, at today’s death rates. The amount of cover does not change these odds.`, rows: [['In the first half of the term', pct(half)], ['In the second half', pct(p - half)], ['Ends with nothing paid', pct(1 - p)]], note: `The policy would pay out for ${inWords(p)}; for the others it ends without a claim. A level term policy pays the same sum whenever the claim happens within the term, and nothing after it. From ${STATS}.` }; },
    exemple: whoTerm,
    portes: [{ label: 'Man of 40, 25 years', v: { age: 40, sex: 0, term: 25 } }, { label: 'Woman of 40, 25 years', v: { age: 40, sex: 1, term: 25 } }, { label: 'Aged 30, 30 years', v: { age: 30, sex: 0, term: 30 } }, { label: 'Aged 60, 10 years', v: { age: 60, sex: 1, term: 10 } }],
  },
  mortgage: {
    title: 'Mortgage balance and decreasing cover', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [money('loan', 'Mortgage left to repay today', 180000, 'On your latest mortgage statement'), { id: 'rate', label: 'Interest rate', def: 4.5, unit: '%', max: 20, decimals: 2, help: 'Not sure? Leave 4.5%: change it once you have your statement' }, { id: 'years', label: 'Years left on the mortgage', def: 25, unit: 'years', max: 40 }, { id: 'at', label: 'Show what is owed after', def: 10, unit: 'years', max: 40, help: 'Pick any year of the loan' }],
    run: (v) => { const at = Math.min(v.at, v.years); const b = E.mortgageBalance(v.loan, v.rate / 100, v.years, at);
      // Testers of 2026-11-10: the big figure read as the cover to buy. Its title now says the year first.
      return { head: [`If you died in year ${formatNumber(at, 0)}, decreasing cover would pay (the loan still owed)`, m(b)], sub: `A ${m(v.loan)} repayment mortgage at ${formatNumber(v.rate, 1)}% over ${formatNumber(v.years, 0)} years. The cover to buy today is ${m(v.loan)}, falling to nothing by the last payment.`, rows: [['Your mortgage payment a month (not the cost of insurance)', m(E.mortgagePayment(v.loan, v.rate / 100, v.years))], [`Left for the family in year ${formatNumber(at, 0)} with fixed (level) cover of ${m(v.loan)} instead`, m(v.loan - b)]], note: 'Decreasing cover pays what is left on the loan; level cover pays the same sum all along and costs more. An interest-only loan does not fall, so it needs level cover.' }; },
    exemple: (v) => `a ${m(v.loan)} repayment mortgage at ${formatNumber(v.rate, 1)}% with ${formatNumber(v.years, 0)} years left`,
  },
  whole: {
    title: 'Whole of life: premiums against the payout', cta: 'Over 50s plans', ctaPage: 'over-50s-life-insurance',
    inputs: [ageIn(45), money('premium', 'Premium you were quoted, a month', 60), money('sum', 'Sum assured', 50000), { id: 'sex', label: 'Sex', def: 0, options: SEX }],
    run: (v) => { const r = E.over50({ age: v.age, sex: sx(v.sex), premium: v.premium, sum: v.sum });
      return { head: ['Age when your premiums reach the payout', age1d(r.breakEvenAge)], sub: `${who(v)} paying ${m(v.premium)} a month for ${m(v.sum)}, premiums paid for life.`, rows: [['Chance of being alive then', pct(r.aliveAtBreakEven)], ['Paid in if you live an average lifetime', m(r.paidToExpectancy)], ['Half of people your age live past', age1(r.median)]], note: 'Uses only the premium you type. Most whole of life policies pay out whenever death happens, so the question is how much is paid in first.' }; },
  },
  over50: {
    title: 'Over 50s plan: when premiums pass the payout', cta: 'Funeral plans compared', ctaPage: 'funeral-plans',
    inputs: [ageIn(60), money('premium', 'Your quoted premium, a month', 25, 'From an advert, a leaflet or a quote. Not sure? Leave £25'), money('sum', 'Fixed payout', 5000), { id: 'stop', label: 'Premiums stop at age', def: 90, unit: 'years', max: 120, help: 'In the plan’s leaflet. 0 if you pay for life' }, { id: 'sex', label: 'Sex', def: 0, options: SEX }],
    run: (v) => { const r = E.over50({ age: v.age, sex: sx(v.sex), premium: v.premium, sum: v.sum, stopAge: v.stop });
      const later = Number.isFinite(r.breakEvenAge) ? `By ${age1d(r.breakEvenAge)} you will have paid ${m(v.sum)}, as much as the plan pays out. About ${formatNumber(Math.round(r.aliveAtBreakEven * 10), 0)} in 10 people of your age and sex live past that age and pay in more than their family receives.` : 'Your premiums stop before they reach the payout.';
      return { head: ['Age when your premiums reach the payout', age1d(r.breakEvenAge)], sub: `${who(v)} paying ${m(v.premium)} a month for a ${m(v.sum)} payout, premiums stopping at ${formatNumber(v.stop, 0)}.`, rows: [['Chance of living past that age', pct(r.aliveAtBreakEven)], ['Paid in if you live an average lifetime', m(r.paidToExpectancy)], ['Most you can pay in', Number.isFinite(r.maxPaid) ? m(r.maxPaid) : 'no limit']], note: `${later} From ${STATS}. Uses only the premium you type.` }; },
    exemple: (v) => `${v.sex === 1 ? 'a woman' : 'a man'} of ${formatNumber(v.age, 0)} paying ${m(v.premium)} a month for a ${m(v.sum)} payout, premiums stopping at ${formatNumber(v.stop, 0)}`,
    portes: [{ label: 'Man of 60', v: { age: 60, sex: 0 } }, { label: 'Woman of 60', v: { age: 60, sex: 1 } }, { label: 'Starting at 50', v: { age: 50, sex: 0 } }, { label: 'Starting at 70', v: { age: 70, sex: 1 } }],
  },
  over60: {
    title: 'Ages your cover has to reach', cta: 'Over 50s plan break-even', ctaPage: 'over-50s-life-insurance',
    inputs: [ageIn(62), { id: 'sex', label: 'Sex', def: 1, options: SEX }, { id: 'area', label: 'Nation', def: 0, options: AREA }],
    run: (v) => { const s = (to: number) => E.survival(v.age, Math.max(0, to - v.age), sx(v.sex), ar(v.area));
      const ex = E.lifeExpectancy(v.age, sx(v.sex), ar(v.area));
      return { head: ['Years left on average', yrs(ex)], sub: `${who(v)}, at today’s death rates (${STATS}).`, rows: [['That is to about age', formatNumber(Math.round(v.age + ex), 0)], ['Chance of reaching 80', pct(s(80))], ['Chance of reaching 90', pct(s(90))], ['Chance a term to 80 pays out', pct(1 - s(80))]] }; },
  },
  ssp: {
    title: 'What Statutory Sick Pay leaves you short each month', cta: 'Income protection: how much, for the two years', ctaPage: 'income-protection-insurance',
    // Testers of 2026-11-10: £1,466 here against £1,590 on the income protection page read as a contradiction.
    // The big figure now names its period first: the weeks of Statutory Sick Pay only.
    inputs: [money('pay', 'Your pay a month, before tax', SD.pay, 'The top line of your payslip. Not sure? Your yearly salary divided by 12'), money('need', 'What you spend a month', SD.need, 'Rent or mortgage, bills, food. Not sure? Use your take-home pay: it errs on the safe side')],
    run: (v) => { const wk = (v.pay * M) / W; const s = E.sspWeekly(wk); const sm = (s * W) / M; const short = Math.max(0, v.need - sm);
      return { head: [`During the ${P.ssp.maxWeeks} weeks of Statutory Sick Pay only: short of your outgoings each month`, m(short)], sub: `On ${m(v.pay)} of pay and ${m(v.need)} of outgoings a month, with no company sick pay. After week ${P.ssp.maxWeeks}: see Income protection: how much.`, rows: [['Sick pay a month (Statutory Sick Pay, SSP)', m(sm)], [`Short of your outgoings over the ${P.ssp.maxWeeks} weeks`, m((short * M / W) * P.ssp.maxWeeks)], [`Pay lost against your usual pay over the ${P.ssp.maxWeeks} weeks`, m((wk - s) * P.ssp.maxWeeks)]], note: `Statutory Sick Pay is the legal minimum your employer must pay: ${m2(P.ssp.weekly)} a week or ${pct(P.ssp.earningsShare)} of your average weekly pay, whichever is lower, from the first day off sick. Before tax.` }; },
    exemple: (v) => `${m(v.pay)} a month of pay before tax and ${m(v.need)} a month of outgoings`,
  },
  gap: {
    title: 'Income during a long absence, first two years', cta: 'Deferred period that fits', ctaPage: 'income-protection-deferred-period',
    // Testers of 2026-11-10: “£1,590” in large type and “£2,000” in the note: which one to ask for? The big
    // figure is now the monthly benefit that still covers the outgoings once the state pays nothing, and the
    // smaller one is named beside it with its weeks. The age is asked in years (a reader of 24 kept the
    // “25 or over” default; one of 61 found nothing about retirement). The waiting time shows only once a
    // policy amount is typed.
    inputs: [money('pay', 'Your pay a month, before tax', SD.pay, 'The top line of your payslip. Not sure? Your yearly salary divided by 12'), money('need', 'What you spend a month', SD.need, 'Rent or mortgage, bills, food. Not sure? Use your take-home pay: it errs on the safe side'), { id: 'full', label: 'Weeks of full pay from your employer when off sick', def: SD.full, unit: 'weeks', max: 104, help: 'In your contract or staff handbook. Not sure? Enter 0: the legal minimum only, the safe side' }, { id: 'half', label: 'Then weeks of half pay', def: SD.half, unit: 'weeks', max: 104, help: '0 if your contract gives none' }, { ...ageIn(DEFAULT_AGE), help: 'Under 25 the state benefit is lower at first; close to State Pension age it stops' }, { ...money('ip', 'Income protection you already have, a month', 0, '0 if none'), avance: true }, { id: 'def', label: 'Weeks before your policy pays (the waiting time, called the deferred period)', def: 13, unit: 'weeks', max: 104, avance: true, si: (v) => v.ip > 0 }],
    run: (v) => {
      const g = E.sickGap({ monthlyPay: v.pay, monthlyNeed: v.need, fullWeeks: v.full, halfWeeks: v.half, age: v.age, employee: true, ipMonthly: v.ip, deferredWeeks: v.def });
      const esa = g.timeline.filter((p) => p.label.startsWith('New Style ESA'));
      const esaFrom = esa.length ? esa[0].fromWeek + 1 : 0, esaTo = esa.length ? esa[esa.length - 1].toWeek : 0;
      const esaMonth = (E.esaWeekly(v.age, 'wrag') * W) / M;
      const target = Math.max(0, Math.round((v.need - esaMonth) / 10) * 10);
      const late = v.age >= 60 ? ' Close to State Pension age: New Style ESA stops at that age, and a policy stops at the age chosen when it is bought, so check how many working years are left before buying.' : '';
      return { head: ['Once all sick pay and state benefit have stopped: income protection to ask for, a month', m(v.need)], sub: `It matches your ${m(v.need)} of outgoings from week ${formatNumber(esaTo + 1, 0)}, when the state pays nothing. Employee of ${formatNumber(v.age, 0)} on ${m(v.pay)} a month, first two years off work.`,
        rows: [[`Enough only while the state benefit, New Style ESA, is paid (weeks ${formatNumber(esaFrom, 0)} to ${formatNumber(esaTo, 0)})`, m(target)], [v.ip > 0 ? 'Short over 2 years, with your policy' : 'Short over 2 years, without a policy', m(g.shortfall)], ['Or savings to fill that gap', g.shortfall > 0 ? `${formatNumber(Math.round(g.shortfall / Math.max(1, v.need)), 0)} months of outgoings` : 'none']],
        note: `New Style ESA (Employment and Support Allowance) is the state benefit for people too ill to work, about ${m(esaMonth)} a month if your National Insurance record qualifies. Insurers cap the benefit at a share of your pay: the quote gives the limit.${late}` }; },
    exemple: (v) => `an employee of ${formatNumber(v.age, 0)} on ${m(v.pay)} a month before tax, with ${m(v.need)} a month of outgoings and ${formatNumber(v.full, 0)} weeks of full company sick pay`,
    portes: [{ label: 'Employee of 40, 4 weeks of company pay', v: { age: 40, full: SD.full, half: 0 } }, { label: 'Under 25', v: { age: 24, full: SD.full, half: 0 } }, { label: 'Generous employer: 13 weeks full, 13 half', v: { age: 40, full: 13, half: 13 } }, { label: 'Over 60', v: { age: 61, full: SD.full, half: 0 } }],
  },
  deferred: {
    title: 'Where company sick pay stops', cta: 'Full timeline with income protection', ctaPage: 'income-protection-insurance',
    inputs: [money('pay', 'Your pay a month, before tax', SD.pay, 'The top line of your payslip'), { id: 'full', label: 'Weeks of full company sick pay', def: 13, unit: 'weeks', max: 104, help: 'In your contract or staff handbook. Not sure? Enter 0' }, { id: 'half', label: 'Then weeks of half pay', def: 13, unit: 'weeks', max: 104 }, money('need', 'What you spend a month', SD.need, 'Rent or mortgage, bills, food. Not sure? Use your take-home pay'), money('sav', 'Savings set aside', 6000)],
    run: (v) => { const g = E.sickGap({ monthlyPay: v.pay, monthlyNeed: v.need, fullWeeks: v.full, halfWeeks: v.half, age: DEFAULT_AGE, employee: true, savings: v.sav });
      const fullEnd = Math.round(v.full);
      return { head: ['Savings run out in week', g.savingsGoneWeek === null ? 'not in 2 years' : formatNumber(g.savingsGoneWeek + 1, 0)], sub: `Counted from the first day off sick, over two years, for an employee of ${DEFAULT_AGE} spending ${m(v.need)} a month.`, rows: [['Full pay ends after', `${formatNumber(fullEnd, 0)} weeks`], ['All company pay ends after', `${formatNumber(fullEnd + Math.round(v.half), 0)} weeks`], ['Shortfall over 2 years', m(g.shortfall)]], note: 'A deferred period is usually chosen to start paying when full pay or savings stop, whichever comes first.' }; },
  },
  selfemp: {
    title: 'Self-employed: what the state pays while you cannot work', cta: 'Employees and sick pay', ctaPage: 'income-protection-insurance',
    inputs: [ageIn(DEFAULT_AGE), money('need', 'What you spend a month', SD.need, 'Rent or mortgage, bills, food. Not sure? Use what you take home in a month'), money('sav', 'Savings set aside', 8000), { id: 'sup', label: 'Placed in the support group (the most severely ill) after the assessment', def: 0, options: YESNO, help: 'Not sure? Leave No: most people are not' }],
    run: (v) => { const g = E.sickGap({ monthlyPay: 0, monthlyNeed: v.need, fullWeeks: 0, halfWeeks: 0, age: v.age, employee: false, support: v.sup === 1, savings: v.sav });
      const ass = E.esaWeekly(v.age, 'assessment'), grp = E.esaWeekly(v.age, v.sup === 1 ? 'support' : 'wrag');
      return { head: [`New Style ESA (the state benefit for people too ill to work) a month, first ${P.esa.assessmentWeeks} weeks`, m((ass * W) / M)], sub: `Self-employed person of ${formatNumber(v.age, 0)} whose National Insurance record qualifies.`, rows: [['Then a month', m((grp * W) / M)], ['Savings last until week', g.savingsGoneWeek === null ? 'beyond 2 years' : formatNumber(g.savingsGoneWeek + 1, 0)], ['Shortfall over 2 years', m(g.shortfall)]], note: `No Statutory Sick Pay when self-employed. New Style ESA needs enough National Insurance contributions; in the work-related activity group it stops after ${P.esa.wragDays} days.` }; },
  },
  ci: {
    title: 'A lump sum or a monthly income', cta: 'Income protection timeline', ctaPage: 'income-protection-insurance',
    // Testers of 2026-11-09 (second round): “paid over those months” read as 28.6 months when it was 24.
    // Every income protection line now names its own months, and one sentence compares the two.
    inputs: [money('lump', 'Critical illness lump sum', 60000, 'The sum on the quote. Not sure? Leave the example'), money('need', 'What you spend a month', SD.need, 'Rent or mortgage, bills, food. Not sure? Use your take-home pay'), money('ip', 'Income protection a month', 1500), { id: 'months', label: 'Months income protection pays', def: 24, unit: 'months', max: 600, help: 'Once a waiting time you choose has passed (the deferred period), while you cannot work' }],
    run: (v) => { const r = E.lumpVsIncome(v.lump, v.need, v.ip, v.months); const n = formatNumber(v.months, 0);
      const short = Math.max(0, v.need - v.ip);
      const lumpM = Number.isFinite(r.lumpMonths) ? formatNumber(r.lumpMonths, 1) : '';
      const verdict = !Number.isFinite(r.lumpMonths) ? '' : r.lumpMonths > v.months ? `Here the lump sum covers more months (${lumpM} against ${n}); income protection keeps paying each month while you cannot work, up to its limit. ` : `Here income protection pays for longer (${n} months against ${lumpM}); the lump sum comes at once and can clear a debt. `;
      return { head: ['The lump sum pays your outgoings for', Number.isFinite(r.lumpMonths) ? `${lumpM} months` : 'any length'], sub: `${m(v.lump)} spent at ${m(v.need)} a month, with no interest and no other income.`, rows: [[`Income protection, paid for ${n} months`, `${m(r.ipTotal)} in total`], ['Short each month with income protection', m(short)], [`So short over those ${n} months`, m(short * v.months)]], note: `${verdict}A lump sum pays once if your illness is on the policy’s list of conditions; income protection pays after the waiting time and only while you cannot work.` }; },
    exemple: (v) => `a ${m(v.lump)} lump sum, or ${m(v.ip)} a month for ${formatNumber(v.months, 0)} months, against ${m(v.need)} a month of outgoings`,
  },
  lifeci: {
    title: 'Combined life and critical illness: what is paid', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [money('life', 'Life cover', 200000), money('ci', 'Critical illness cover', 200000), { id: 'combined', label: 'One combined policy', def: 1, options: YESNO }],
    run: (v) => { const both = v.combined === 1 ? Math.max(v.life, v.ci) : v.life + v.ci;
      return { head: ['Paid if a claim is made on both', m(both)], sub: v.combined === 1 ? 'One combined policy: it pays once, on the first claim.' : 'Two separate policies: each can pay.', rows: [['Critical illness claim alone', m(v.ci)], ['Life cover left after that claim', m(v.combined === 1 ? Math.max(0, v.life - v.ci) : v.life)], ['Death claim alone', m(v.life)]], note: 'A combined (accelerated) policy pays once, on whichever claim comes first. Separate policies can each pay.' }; },
  },
  fib: {
    title: 'Family income benefit: what a claim pays', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [money('monthly', 'Monthly benefit', 2000), { id: 'term', label: 'Term', def: 20, unit: 'years', max: 50 }, { id: 'claim', label: 'Claim in year', def: 5, unit: '', max: 50 }],
    run: (v) => { const left = Math.max(0, v.term - v.claim);
      return { head: [`Paid out in total, for a claim in year ${formatNumber(v.claim, 0)}`, m(E.fibTotal(v.monthly, v.term, v.claim))], sub: `${m(v.monthly)} a month from the claim until the ${formatNumber(v.term, 0)}-year term ends.`, rows: [['Years of payments left', formatNumber(left, 0)], ['Claim in year 1', m(E.fibTotal(v.monthly, v.term, 0))], ['Claim in the last year', m(E.fibTotal(v.monthly, v.term, Math.max(0, v.term - 1)))]], note: 'Payments run from the claim to the end of the term, so the total falls as the term goes on.' }; },
  },
  joint: {
    title: 'Joint policy or two single ones', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [{ id: 'a1', label: 'First person’s age', def: 40, unit: 'years', max: 90 }, { id: 's1', label: 'First person', def: 0, options: SEX }, { id: 'a2', label: 'Second person’s age', def: 38, unit: 'years', max: 90 }, { id: 's2', label: 'Second person', def: 1, options: SEX }, { id: 'term', label: 'Term', def: 25, unit: 'years', max: 60 }],
    run: (v) => { const j = E.jointChances(v.a1, sx(v.s1), v.a2, sx(v.s2), v.term);
      return { head: [`Over ${formatNumber(v.term, 0)} years, a joint policy pays out in`, pct(j.atLeastOne)], sub: `Ages ${formatNumber(v.a1, 0)} and ${formatNumber(v.a2, 0)} today, at today’s death rates (${STATS}).`, rows: [['First person’s own policy pays', pct(j.first)], ['Second person’s own policy pays', pct(j.second)], ['Two single policies both pay', pct(j.both)]], note: 'A joint policy pays once, at the first death, then ends. Two single policies can both pay.' }; },
  },
  trust: {
    title: 'Inheritance tax on a payout outside a trust', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [money('estate', 'Estate without the policy', 400000, 'Home, savings, after debts'), money('payout', 'Life policy payout', 250000), money('home', 'of which the home', 300000), { id: 'desc', label: 'Home to children or grandchildren', def: 1, options: YESNO }, { id: 'spouse', label: 'All left to a spouse', def: 0, options: YESNO }],
    run: (v) => { const r = E.ihtOnPayout({ estate: v.estate, payout: v.payout, home: v.home, toDescendants: v.desc === 1, toSpouse: v.spouse === 1 });
      return { head: ['Extra inheritance tax if the payout goes into the estate', m(r.extra)], sub: `Estate of ${m(v.estate)} plus a ${m(v.payout)} payout, at the ${P.taxYear} tax-free thresholds.`, rows: [['Family keeps, policy in trust', m(r.familyGetsInTrust)], ['Family keeps, paid to the estate', m(r.familyGetsInEstate)], ['Threshold used', m(r.thresholdInEstate)]], note: `Tax at ${pct(P.iht.rate)} above the threshold. A spouse or civil partner inherits free of inheritance tax.` }; },
  },
  dis: {
    title: 'Death in service and the gap it leaves', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [money('salary', 'Salary', 38000), { id: 'mult', label: 'Multiple of salary', def: 4, unit: '×', max: 10, decimals: 1 }, money('need', 'Cover the family would need', 300000)],
    run: (v) => { const lump = v.salary * v.mult;
      return { head: ['Life cover from your job (death in service)', m(lump)], sub: `${formatNumber(v.mult, 1)} times a ${m(v.salary)} salary, paid only while you work there.`, rows: [['Gap to the need', m(Math.max(0, v.need - lump))], ['If you leave this job', m(0)], ['Share of the need covered', pct(v.need > 0 ? Math.min(1, lump / v.need) : 0)]], note: 'Paid only while you work for this employer, at the multiple the scheme sets.' }; },
  },
  keyperson: {
    title: 'Key person cover from lost profit', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [money('profit', 'Gross profit the person brings in, a year', 150000), { id: 'months', label: 'Months to replace them', def: 12, unit: 'months', max: 60 }, money('recruit', 'Recruitment and training cost', 25000), money('lost', 'Contracts or loans at risk', 0)],
    run: (v) => { const r = E.keyPerson(v.profit, v.months, v.recruit, v.lost);
      return { head: ['Cover a business might set', m(r.cover)], sub: `Lost profit over ${formatNumber(v.months, 0)} months, plus the cost of replacing the person.`, rows: [['Lost profit over the period', m(r.profitPart)], ['Recruitment and training', m(v.recruit)], ['Contracts or loans', m(v.lost)]], note: 'HMRC (the UK tax office) lets a business deduct the premiums from its profits only for term cover taken out to replace lost trading income; the payout is then taxed as trading income.' }; },
  },
  funeralplan: {
    title: 'Funeral plan: one payment or instalments', cta: 'What the state pays towards a funeral', ctaPage: 'funeral-expenses-payment',
    inputs: [money('price', 'Plan price paid in one go', 4200, 'From the provider’s quote'), money('monthly', 'Instalment a month', 125), { id: 'months', label: 'Number of instalments', def: 36, unit: 'months', max: 600 }],
    run: (v) => { const r = E.planInstalments(v.price, v.monthly, v.months);
      return { head: ['Paid in total by instalments', m(r.total)], sub: `${formatNumber(v.months, 0)} instalments of ${m(v.monthly)}, against ${m(v.price)} paid in one go.`, rows: [['Extra over the single price', m(r.extra)], ['Extra in percent', pct(Math.max(0, r.extraShare))], ['State help with a plan in place', `up to ${m(P.funeral.withPlan)}`]], note: 'Uses only the prices you type. Ask the provider what happens if instalments stop before the end.' }; },
  },
  fep: {
    title: 'Funeral Expenses Payment', cta: 'Funeral plans: what the regulator checks', ctaPage: 'funeral-plans',
    inputs: [money('fees', 'Burial or cremation fees', 1100, 'Including the doctor’s certificate'), money('other', 'Other funeral costs', 3200, 'Funeral director, coffin, flowers'), { id: 'plan', label: 'The person had a funeral plan', def: 0, options: YESNO }],
    run: (v) => { const r = E.funeralPayment(v.fees, v.other, v.plan === 1);
      return { head: ['Most the payment can cover', m(r.total)], sub: 'Only for someone on a qualifying benefit who arranges the funeral.', rows: [['Burial or cremation fees', m(r.fees)], ['Other costs, capped', `${m(r.other)} of ${m(r.cap)}`], ['Left to pay', m(r.gap)]], note: `Only for someone getting a qualifying benefit and arranging the funeral; claim within ${P.funeral.claimMonths} months. Any money in the estate is taken back.` }; },
  },
  bsp: {
    title: 'Bereavement Support Payment for your partner', cta: 'Life cover calculator: how much cover your family needs', ctaPage: 'home',
    inputs: [{ id: 'partner', label: 'You and your partner', def: 1, options: PARTNER }, { id: 'kids', label: 'Child Benefit for a child at home', def: 1, options: YESNO }],
    run: (v) => { const b = E.bsp(pt(v.partner), v.kids === 1);
      return { head: ['Paid to your partner in total', m(b.total)], sub: `For a claim within ${P.bsp.fullClaimMonths} months of the death, spread over ${P.bsp.months} months.`, rows: [['One-off payment', m(b.lump)], [`Then ${P.bsp.months} monthly payments of`, m(b.monthly)], ['Rate', b.rate === 'none' ? 'not due' : b.rate]], note: `Claim within ${P.bsp.fullClaimMonths} months of the death for the full amount; the person who died must have paid enough National Insurance.` }; },
  },
};

export function getSpec(kind: string, _lang = 'en'): MiniSpec {
  const s = SPECS[kind];
  if (!s) throw new Error(`Unknown mini spec ${kind}`);
  return s;
}
export const SPEC_IDS = Object.keys(SPECS);
