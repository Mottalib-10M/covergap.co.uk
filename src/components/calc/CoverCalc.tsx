/**
 * Main tool: life cover still needed once Bereavement Support Payment, death in service, savings and any
 * existing policy are counted, and the chance that a term policy of that length pays out (ONS national
 * life tables 2022-2024). All arithmetic is `lib/engine/protection.ts`. No price is shown: none exists.
 * Hydration (RECETTE §17.5): first render = props defaults; link parameters applied in an effect.
 * Naive testers, 2026-11-08 (trame): until the reader changes a field (or opens a shared link) the result
 * carries "Example, not your result yet"; the folded fields show their current values in the fold's title.
 * Bottom bar (phones): reads "Example:" until a field is changed, and steps aside whenever it would sit over a
 * field of the form or a field has focus (report of 2026-11-08: it hid half of "Your age"), and while the result
 * itself is on screen.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { coverNeed, payoutChance, lifeExpectancy, AREAS, AREA_LABEL, type Area, type Sex } from '../../lib/engine/protection';
import { P } from '../../lib/engine/params';
import { formatMoney, formatPercent, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import MentionExemple from './MentionExemple';
import { resultatExemple, resumeRepli } from '../../lib/libelles-trame';

type Partner = 'married' | 'cohabiting' | 'none';
interface Props {
  age?: number; sex?: Sex; area?: Area; partner?: Partner; kids?: boolean; mortgage?: number; debts?: number; funeral?: number;
  income?: number; years?: number; extra?: number; savings?: number; dis?: number; existing?: number; methodHref: string; idPrefix?: string;
}
const m = (n: number) => formatMoney(Math.round(n), 0);
const pc = (x: number) => formatPercent(x, x < 0.1 ? 1 : 0);
const PARTNER = [
  { value: 'married', label: 'Married or civil partner' },
  { value: 'cohabiting', label: 'Living together, not married' },
  { value: 'none', label: 'No partner' },
];
const SEX = [{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }];
const AREA_OPTS = AREAS.map((a) => ({ value: a, label: AREA_LABEL[a] }));

export default function CoverCalc(p: Props) {
  const d = { age: 38, sex: 'm' as Sex, area: 'uk' as Area, partner: 'married' as Partner, kids: true, mortgage: 180000, debts: 8000, funeral: 5000, income: 24000, years: 15, extra: 20000, savings: 15000, dis: 0, existing: 0, ...p };
  // `children` is React’s slot prop: Astro hydrates it as an empty slot, so the toggle is called `kids`.
  const [age, setAge] = useState(d.age);
  const [sex, setSex] = useState<Sex>(d.sex);
  const [area, setArea] = useState<Area>(d.area);
  const [partner, setPartner] = useState<Partner>(d.partner);
  const [children, setChildren] = useState(d.kids);
  const [mortgage, setMortgage] = useState(d.mortgage);
  const [debts, setDebts] = useState(d.debts);
  const [funeral, setFuneral] = useState(d.funeral);
  const [income, setIncome] = useState(d.income);
  const [years, setYears] = useState(d.years);
  const [extra, setExtra] = useState(d.extra);
  const [savings, setSavings] = useState(d.savings);
  const [dis, setDis] = useState(d.dis);
  const [existing, setExisting] = useState(d.existing);
  const [copied, setCopied] = useState(false);
  // Fields the reader changed; a shared link counts as the reader's own figures.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const t = <T,>(k: string, f: (x: T) => void) => (x: T) => { f(x); setTouched((o) => (o[k] ? o : { ...o, [k]: true })); };
  // Bottom bar: hidden at first render (hydration), then shown only where it covers no field.
  const formRef = useRef<HTMLFormElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barre, setBarre] = useState(false);
  useEffect(() => {
    let raf = 0; let h = 44;
    const calc = () => {
      raf = 0;
      const f = formRef.current; const res = resRef.current; const bar = barRef.current;
      if (!f || !res || !bar) return;
      if (bar.offsetHeight) h = bar.offsetHeight;
      const H = window.innerHeight; const haut = H - h - 8;
      const rr = res.getBoundingClientRect();
      const resultatVu = rr.top < H && rr.bottom > 0;
      const a = document.activeElement;
      const saisie = !!a && f.contains(a) && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName);
      let couvre = false;
      f.querySelectorAll('input, select, button, summary, label').forEach((c) => { const r = c.getBoundingClientRect(); if (r.height > 0 && r.bottom > haut && r.top < H) couvre = true; });
      setBarre(!resultatVu && !saisie && !couvre);
    };
    const plan = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener('scroll', plan, { passive: true }); window.addEventListener('resize', plan);
    document.addEventListener('focusin', plan); document.addEventListener('focusout', plan); document.addEventListener('toggle', plan, true);
    return () => { window.removeEventListener('scroll', plan); window.removeEventListener('resize', plan); document.removeEventListener('focusin', plan); document.removeEventListener('focusout', plan); document.removeEventListener('toggle', plan, true); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const exemple = resultatExemple(touched);

  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    setTouched({ lien: true });
    setAge(num(u, 'a', d.age)); const s = str(u, 's', d.sex); if (s === 'm' || s === 'f') setSex(s);
    const ar = str(u, 'r', d.area); if ((AREAS as string[]).includes(ar)) setArea(ar as Area);
    const pt = str(u, 'p', d.partner); if (PARTNER.some((x) => x.value === pt)) setPartner(pt as Partner);
    setChildren(str(u, 'c', d.kids ? '1' : '0') === '1');
    setMortgage(num(u, 'mo', d.mortgage)); setDebts(num(u, 'de', d.debts)); setFuneral(num(u, 'fu', d.funeral));
    setIncome(num(u, 'i', d.income)); setYears(num(u, 'y', d.years)); setExtra(num(u, 'x', d.extra));
    setSavings(num(u, 'sa', d.savings)); setDis(num(u, 'ds', d.dis)); setExisting(num(u, 'e', d.existing));
  }, []);
  useEffect(() => {
    updateURL({ a: age, s: sex, r: area !== 'uk' ? area : undefined, p: partner, c: children ? 1 : 0, mo: mortgage, de: debts, fu: funeral, i: income, y: years, x: extra, sa: savings, ds: dis || undefined, e: existing || undefined });
  }, [age, sex, area, partner, children, mortgage, debts, funeral, income, years, extra, savings, dis, existing]);

  const r = useMemo(() => coverNeed({ mortgage, debts, funeral, income, years, extra, savings, deathInService: dis, existing, partner, children, countBsp: true }), [mortgage, debts, funeral, income, years, extra, savings, dis, existing, partner, children]);
  const term = Math.max(1, Math.round(years));
  const odds = useMemo(() => payoutChance(age, term, sex, area), [age, term, sex, area]);
  const ex = lifeExpectancy(age, sex, area);
  const share = () => { try { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard refused */ } };
  const id = (x: string) => `${p.idPrefix ?? 'cv'}-${x}`;
  const row = (label: string, x: string, strong = false) => (
    <tr key={label} className={strong ? 'total' : ''}><td className="pr-2 text-navy-700">{label}</td><td className="tabular-nums text-right text-navy-900">{x}</td></tr>
  );
  const bspLabel = r.bsp.rate === 'none' ? 'Bereavement Support Payment' : `Bereavement Support Payment, ${r.bsp.rate} rate`;

  return (
    <div data-chrome className="rechner border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <form ref={formRef} className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('mortgage')} label="Mortgage left to repay" value={mortgage} onChange={t('mortgage', setMortgage)} unit="£" max={20_000_000} help="Balance today, 0 if you rent" />
            <NumberField id={id('income')} label="Income your family would need" value={income} onChange={t('income', setIncome)} unit="£" max={5_000_000} help="A year, on top of the partner’s own pay" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('years')} label="For how many years" value={years} onChange={t('years', setYears)} unit="yrs" max={50} help="Often until the youngest child is 18 or 21" />
            <NumberField id={id('age')} label="Your age" value={age} onChange={t('age', setAge)} unit="yrs" min={16} max={90} help="Sets the chance a policy pays out" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <SelectField id={id('partner')} label="Partner" value={partner} onChange={t('partner', (v: string) => setPartner(v as Partner))} options={PARTNER} />
            <Toggle id={id('children')} label="Child Benefit for a child at home" value={children ? '1' : '0'} onChange={t('children', (v: string) => setChildren(v === '1'))} options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }]} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('savings')} label="Savings your family could use" value={savings} onChange={t('savings', setSavings)} unit="£" max={50_000_000} />
            <NumberField id={id('dis')} label="Death in service from work" value={dis} onChange={t('dis', setDis)} unit="£" max={50_000_000} help="Lump sum, often a multiple of salary" />
          </div>
          <details className="border-t border-navy-200 pt-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy-800">More: debts, funeral, children’s lump sums, cover you have, sex and nation
              <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli('en', [{ label: 'Other debts', valeur: m(debts) }, { label: 'Funeral', valeur: m(funeral) }, { label: 'Children’s lump sums', valeur: m(extra) }, { label: 'Cover held', valeur: m(existing) }, { label: 'Sex', valeur: SEX.find((x) => x.value === sex)?.label ?? '' }, { label: 'Nation', valeur: AREA_LABEL[area] }])}</span></summary>
            <div className="mt-3 grid gap-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <NumberField id={id('debts')} label="Other debts" value={debts} onChange={t('debts', setDebts)} unit="£" max={10_000_000} help="Loans, cards, car finance" />
                <NumberField id={id('funeral')} label="Funeral budget" value={funeral} onChange={t('funeral', setFuneral)} unit="£" max={1_000_000} help="Your own figure" />
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <NumberField id={id('extra')} label="Lump sums for the children" value={extra} onChange={t('extra', setExtra)} unit="£" max={10_000_000} help="University, a deposit, childcare" />
                <NumberField id={id('existing')} label="Life cover you already have" value={existing} onChange={t('existing', setExisting)} unit="£" max={50_000_000} help="Personal policies, not work" />
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <Toggle id={id('sex')} label="Sex (ONS tables)" value={sex} onChange={t('sex', (v: string) => setSex(v as Sex))} options={SEX} />
                <SelectField id={id('area')} label="Nation" value={area} onChange={t('area', (v: string) => setArea(v as Area))} options={AREA_OPTS} />
              </div>
            </div>
          </details>
        </form>
        <div ref={resRef} data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <MentionExemple lang="en" touched={touched} />
          <p className="text-sm font-medium text-navy-700">Life cover still needed</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{m(r.need)}</p>
          <p className="mt-1 text-sm text-navy-800">Over a {term}-year term, a policy on your life pays out in about <strong className="tabular-nums">{pc(odds)}</strong> of cases at today’s death rates for your age. The rest of the time it pays nothing.</p>
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {row('Mortgage, debts and funeral', m(mortgage + debts + funeral))}
            {row(`Income: ${m(income)} × ${years} years`, m(r.incomeNeed))}
            {row('Lump sums for the children', m(extra))}
            {row('Total the family would need', m(r.gross), true)}
            {row(bspLabel, r.state > 0 ? `− ${m(r.state)}` : 'not due')}
            {row('Savings, death in service, cover held', `− ${m(savings + dis + existing)}`)}
            {row('Cover still needed', m(r.need), true)}
          </tbody></table>
          {r.need > 0 && years > 0 && <p className="mt-2 text-sm text-navy-800">As a family income benefit instead: about <strong className="tabular-nums">{m(r.monthlyEquivalent)}</strong> a month for {term} years.</p>}
          <p className="mt-2 text-xs text-navy-600">{r.bsp.rate !== 'none' ? `Bereavement Support Payment counted for a claim within ${P.bsp.fullClaimMonths} months: ${m(r.bsp.lump)} then ${P.bsp.months} × ${m(r.bsp.monthly)}, paid to your partner if your own National Insurance record qualifies. ` : partner === 'cohabiting' ? 'An unmarried partner without a child getting Child Benefit gets no Bereavement Support Payment. ' : ''}Life expectancy at {age}: {formatNumber(ex, 1)} years (ONS {LT_PERIOD}). No interest is assumed on the income. Estimate only, not advice.</p>
        </div>
      </div>
      <div ref={barRef} data-barre-resultat aria-hidden="true" className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy-300 bg-white/95 px-4 py-2 text-sm text-navy-900 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] lg:hidden print:hidden ${barre ? '' : 'hidden'}`}>{exemple ? <><span data-exemple-barre className="mr-1 rounded border border-amber-300 bg-amber-50 px-1 font-semibold text-amber-900">Example:</span>cover needed </> : 'Cover needed: '}<strong className="tabular-nums">{m(r.need)}</strong> · pays out in <strong className="tabular-nums">{pc(odds)}</strong> of cases over {term} years</div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to these figures'}</button>
        <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        <a href={p.methodHref} className="text-accent-700 underline underline-offset-2">How this is calculated</a>
        <span className="text-xs text-navy-600">State rates {P.taxYear}, read on GOV.UK. No quote form and no insurer prices.</span>
      </div>
    </div>
  );
}
const LT_PERIOD = '2022-2024';
