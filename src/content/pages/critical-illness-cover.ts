import { definePage } from '../../lib/guide-types';

const LUMP = 60000, NEED = 2100, IP = 1500;

export default definePage({
  id: 'critical-illness-cover',
  group: 'income',
  order: 140,
  tool: { kind: 'mini:ci', props: { lump: 60000, need: 2100, ip: 1500, months: 24 } },
  related: ['life-and-critical-illness-cover', 'income-protection-insurance', 'self-employed-income-protection', 'income-protection-deferred-period'],
  sources: ['gov_ssp', 'gov_esa', 'ittoia_735'],
  slug: 'critical-illness-cover',
  nav: 'Critical illness or income protection',
  card: 'A one-off lump sum against a monthly income: how many months each one pays for, set against your outgoings.',
  title: 'Critical Illness Cover 2026: Lump Sum or Monthly Income',
  description: 'Critical illness cover in 2026 against income protection: how many months of outgoings a lump sum pays for, and what a monthly benefit adds up to over time.',
  h1: 'Critical illness cover or income protection: a lump sum or an income',
  intro: 'Both policies pay when you are alive but your finances are hit. Enter a lump sum, your outgoings and a monthly benefit to compare them in months.',
  resume: (h) => {
    const r = h.E.lumpVsIncome(LUMP, NEED, IP, 24);
    return `Critical illness cover pays a single tax-free lump sum if the insured person meets one of the definitions listed in the policy, whether or not they can still work. Income protection pays a monthly benefit only while they cannot work, after a deferred period, until they recover or the claim period ends. They answer different questions. A lump sum of ${h.m(LUMP)} pays ${h.m(NEED)} of monthly outgoings for ${h.num1(r.lumpMonths)} months, or clears part of a mortgage at once. An income protection benefit of ${h.m(IP)} a month, paid for two years once its deferred period has passed, pays ${h.m(r.ipTotal)}, and keeps paying for as long as the claim lasts within the policy term. The lump sum is paid once, so it suits a debt or a one-off cost; the income suits a long absence. This site describes the contracts and the money, not the conditions a policy lists: those are in each insurer’s policy wording.`;
  },
  faqs: (h) => [
    { q: 'Is critical illness cover worth it if I already have income protection?', a: 'It depends on what the money would be for. Income protection replaces part of your pay while you cannot work; it pays nothing if you go back to work, even part-time in some policies. A critical illness lump sum is paid on a valid claim even if you keep working, so some people use it to clear debts or adapt a home. The two can work together.' },
    { q: 'Do I pay tax on a critical illness payout?', a: 'A lump sum from a critical illness policy you pay for yourself is normally free of income tax and capital gains tax. If it is not used and stays in your estate, it can count for inheritance tax when you die, like any other savings. A policy held in trust, or one owned by a business, follows other rules, set out in the policy documents.' },
    { q: 'Why are some critical illness claims declined?', a: 'A claim is paid only when it meets the policy definition, which can include a severity level, and when the answers given at the start were complete and accurate. Most declined claims turn on one of those two points. Reading the definitions in the key features document before buying, and answering the application questions fully, are the two things a buyer controls.' },
  ],
  body: (h) => {
    const lumps = [25000, 50000, 75000, 100000, 150000];
    const rows = lumps.map((l) => { const r = h.E.lumpVsIncome(l, NEED, IP, 24); return [h.m(l), `${h.num1(r.lumpMonths)} months`, `${h.num1(r.lumpMonths / 12)} years`]; });
    const months = [6, 12, 24, 60];
    const rows2 = months.map((mo) => [`${mo} months`, h.m(IP * mo), h.m(Math.max(0, NEED - IP) * mo)]);
    const ssp = h.P.ssp;
    return `
<h2>How long a lump sum lasts</h2>
<p>The simplest way to size a lump sum is in months of outgoings. The table divides each sum by ${h.m(NEED)} a month, with no interest and no other income. A household that keeps working after a claim would make it last longer; one that also loses an income would spend it faster.</p>
${h.table(['Lump sum', 'Months of outgoings', 'Years'], rows, `Outgoings of ${h.m(NEED)} a month. Your own figure goes in the calculator.`, ['r', 'r', 'r'])}

<h2>What a monthly benefit adds up to</h2>
<p>An income benefit of ${h.m(IP)} a month pays in proportion to the length of the absence. “Still short” is the total missing over the whole period against the same outgoings, before state support.</p>
${h.table(['Absence after the deferred period', 'Income protection paid', 'Still short'], rows2, `Benefit ${h.m(IP)} a month. State support comes on top, see below.`, ['l', 'r', 'r'])}

<h2>The state support alongside either policy</h2>
<p>An employee who cannot work gets ${h.src('gov_ssp', 'Statutory Sick Pay')} of ${h.m2(ssp.weekly)} a week at most, for up to ${ssp.maxWeeks} weeks, then possibly ${h.src('gov_esa', 'New Style ESA')} from ${h.m2(h.P.esa.assessment25)} a week. These are paid on the inability to work, not on a policy definition, so they run alongside income protection and alongside any lump sum. The ${h.a('income-protection-insurance', 'income protection timeline')} shows the state support week by week.</p>

<h2>Reading the contracts</h2>
<p>A critical illness policy pays when the insured person meets a definition in the policy, and some definitions require a level of severity. Policies differ in how many definitions they list, whether they pay a partial amount for less severe claims, and whether children are covered. An income protection policy pays when the insured person cannot do their job, or any job, depending on its definition of incapacity, after the deferred period. The key features document of each policy lists all of this without asking for your details.</p>
<p>Income protection benefits from a policy you pay for yourself are free of income tax under ${h.src('ittoia_735', 'section 735 of ITTOIA 2005')}. A combined policy that adds critical illness to life cover pays once; the ${h.a('life-and-critical-illness-cover', 'life and critical illness page')} shows what that means for the family.</p>
<h2>Choosing a sum</h2>
<p>A simple way to set a critical illness sum is to decide what it must do. Clearing a mortgage needs the balance; paying the bills for a period needs that many months of outgoings, as in the first table; adapting a home or paying for a partner to stop work needs a separate estimate. Many people pick one of these rather than all of them, because the premium rises with the sum. Where income protection is already in place, the lump sum can be smaller, since it no longer has to replace pay over a long absence.</p>
`;
  },
});
