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
 * Naive testers, 2026-11-09: the three questions that change the answer most (partner, child at home, age and
 * sex) come first; sex is no longer folded (a woman who did not open the fold got a man's odds); the fold says
 * that its amounts are already counted; a "No" to children clears the children's lump sums the reader has not
 * typed; plain words in the result; what to do with the figure, under it.
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
import { COVER_DEFAULTS, article, type Partner } from '../../lib/cover-defaults';

interface Props {
  age?: number; sex?: Sex; area?: Area; partner?: Partner; kids?: boolean; mortgage?: number; debts?: number; funeral?: number;
  income?: number; years?: number; extra?: number; savings?: number; dis?: number; existing?: number; methodHref: string; idPrefix?: string;
  /** Prefix of the site's own links (the embed passes the full domain). */
  siteBase?: string;
}
const m = (n: number) => formatMoney(Math.round(n), 0);
const pc = (x: number) => formatPercent(x, x < 0.1 ? 1 : 0);
const oneIn = (x: number) => (x > 0 ? formatNumber(Math.round(1 / x), 0) : '');
const PARTNER = [
  { value: 'married', label: 'Married or civil partner' },
  { value: 'cohabiting', label: 'Living together, not married' },
  { value: 'none', label: 'No partner' },
];
const SEX = [{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }];
const AREA_OPTS = AREAS.map((a) => ({ value: a, label: AREA_LABEL[a] }));

export default function CoverCalc(p: Props) {
  const d = { ...COVER_DEFAULTS, ...p };
  const base = p.siteBase ?? '';
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
    <tr key={label} className={strong ? 'total' : ''}><td className="pr-2 text-navy-700">{label}</td><td className="tabular-nums whitespace-nowrap text-right text-navy-900">{x}</td></tr>
  );
  const bspLabel = 'State bereavement payment to your partner';
  // "No" to a child at home: the children's lump sums of the example go, unless the reader typed them.
  const setKids = (v: string) => { const yes = v === '1'; setChildren(yes); if (!touched.extra) setExtra(yes ? d.extra : 0); };

  return (
    <div data-chrome className="rechner border border-navy-300 bg-white p-4 sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <form ref={formRef} className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <SelectField id={id('partner')} label="Partner" value={partner} onChange={t('partner', (v: string) => setPartner(v as Partner))} options={PARTNER} />
            <Toggle id={id('children')} label="Child at home (Child Benefit paid)" value={children ? '1' : '0'} onChange={t('children', setKids)} options={[{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }]} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('age')} label="Your age" value={age} onChange={t('age', setAge)} unit="yrs" min={16} max={90} help="Used for the odds that a policy pays out" />
            <Toggle id={id('sex')} label="Sex" value={sex} onChange={t('sex', (v: string) => setSex(v as Sex))} options={SEX} />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('mortgage')} label="Mortgage left to repay" value={mortgage} onChange={t('mortgage', setMortgage)} unit="£" max={20_000_000} help="Balance today, 0 if you rent" />
            <NumberField id={id('income')} label="Yearly income your family would lose" value={income} onChange={t('income', setIncome)} unit="£" max={5_000_000} help="What they would be short each year without your pay; 0 if they could manage" />
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
            <NumberField id={id('years')} label="For how many years" value={years} onChange={t('years', setYears)} unit="yrs" max={50} help="Until the youngest is 18 or 21; with no child, until the mortgage ends" />
            <NumberField id={id('savings')} label="Savings your family could use" value={savings} onChange={t('savings', setSavings)} unit="£" max={50_000_000} help="Not pensions" />
          </div>
          <details className="border-t border-navy-200 pt-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy-800">Already counted for you: debts, funeral, children’s lump sums. Tap to change, or to add life cover from your job
              <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeRepli('en', [{ label: 'Other debts', valeur: m(debts) }, { label: 'Funeral', valeur: m(funeral) }, { label: 'Children’s lump sums', valeur: m(extra) }, { label: 'Life cover from your job', valeur: m(dis) }, { label: 'Policies you hold', valeur: m(existing) }, { label: 'Nation', valeur: AREA_LABEL[area] }])}</span></summary>
            <div className="mt-3 grid gap-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <NumberField id={id('debts')} label="Other debts" value={debts} onChange={t('debts', setDebts)} unit="£" max={10_000_000} help="Loans, cards, car finance" />
                <NumberField id={id('funeral')} label="Funeral budget" value={funeral} onChange={t('funeral', setFuneral)} unit="£" max={1_000_000} help="Your own figure" />
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <NumberField id={id('extra')} label="Lump sums for the children" value={extra} onChange={t('extra', setExtra)} unit="£" max={10_000_000} help="University, a deposit, childcare; 0 if none" />
                <NumberField id={id('dis')} label="Life cover from your job (death in service)" value={dis} onChange={t('dis', setDis)} unit="£" max={50_000_000} help="See your contract or staff handbook, often 2 to 4 times salary; 0 if none or not sure" />
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:gap-y-0">
                <NumberField id={id('existing')} label="Life insurance you already hold" value={existing} onChange={t('existing', setExisting)} unit="£" max={50_000_000} help="Your own policies, not the one from work" />
                <SelectField id={id('area')} label="Nation" value={area} onChange={t('area', (v: string) => setArea(v as Area))} options={AREA_OPTS} />
              </div>
            </div>
          </details>
        </form>
        <div ref={resRef} data-resultat aria-live="polite" className="self-start border-l-4 border-accent-500 bg-accent-50 p-4">
          <MentionExemple lang="en" touched={touched} />
          <p className="text-sm font-medium text-navy-700">Life cover still needed</p>
          <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{m(r.need)}</p>
          <p className="mt-1 text-sm text-navy-800">Over {article(term)} {term}-year term, about <strong className="tabular-nums">1 in {oneIn(odds)}</strong> people of your age and sex would die and the policy would pay ({pc(odds)}, today’s death rates). For the others it ends without a claim, which is why term cover costs little at this age.</p>
          <table className="ledger mt-3 w-full text-sm"><tbody>
            {row('Mortgage, other debts and funeral', m(mortgage + debts + funeral))}
            {row(`Lost income: ${m(income)} × ${years} years`, m(r.incomeNeed))}
            {row('Lump sums for the children', m(extra))}
            {row('Total the family would need', m(r.gross), true)}
            {row(bspLabel, r.state > 0 ? `− ${m(r.state)}` : 'not due')}
            {row('Savings and cover you already have', `− ${m(savings + dis + existing)}`)}
            {row('Cover still needed', m(r.need), true)}
          </tbody></table>
          {r.need > 0 && years > 0 && <p className="mt-2 text-sm text-navy-800">Or paid monthly instead of in one lump sum (family income benefit): about <strong className="tabular-nums">{m(r.monthlyEquivalent)}</strong> a month for {term} years.</p>}
          {r.bsp.rate === 'none' && partner === 'cohabiting' && <p data-non-marie className="mt-2 text-sm font-medium text-navy-900">Not married and no child at home: your partner would get no state bereavement payment. <a href={`${base}/en/life-insurance-unmarried-couples/`} className="text-accent-700 underline underline-offset-2">What unmarried partners can and cannot claim</a></p>}
          <p className="mt-2 text-xs text-navy-600">{r.bsp.rate !== 'none' ? `State bereavement payment (Bereavement Support Payment, ${r.bsp.rate} rate) counted for a claim within ${P.bsp.fullClaimMonths} months: ${m(r.bsp.lump)} then ${P.bsp.months} × ${m(r.bsp.monthly)}, if your own National Insurance record qualifies. ` : ''}People of {age} live on average another {formatNumber(ex, 1)} years, to about age {formatNumber(Math.round(age + ex), 0)} (ONS {LT_PERIOD}). No interest is assumed on the income. Estimate only, not advice.</p>
        </div>
      </div>
      <div ref={barRef} data-barre-resultat aria-hidden="true" className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy-300 bg-white/95 px-4 py-2 text-sm text-navy-900 shadow-[0_-2px_6px_rgba(0,0,0,0.06)] lg:hidden print:hidden ${barre ? '' : 'hidden'}`}>{exemple ? <><span data-exemple-barre className="mr-1 rounded border border-amber-300 bg-amber-50 px-1 font-semibold text-amber-900">Example:</span>cover needed </> : 'Cover needed: '}<strong className="tabular-nums">{m(r.need)}</strong> · pays out in <strong className="tabular-nums">{pc(odds)}</strong> of cases over {term} years</div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={share} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy a link to these figures'}</button>
        <button type="button" onClick={() => window.print()} className="rounded border border-navy-300 px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        <a href={p.methodHref} className="text-accent-700 underline underline-offset-2">How this is calculated</a>
        <span className="text-xs text-navy-600">State rates {P.taxYear}, read on GOV.UK. No quote form and no insurer prices.</span>
      </div>
      <div data-ensuite className="mt-4 border-t border-navy-200 pt-3 text-sm text-navy-800">
        <p className="font-semibold text-navy-900">What to do with this figure</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Note the amount and the length: <strong className="tabular-nums">{m(r.need)}</strong> over <strong className="tabular-nums">{term} years</strong>.</li>
          <li>Ask an insurer, or a firm on the FCA register, for a level or decreasing term quote for that amount. No one here will call you.</li>
          <li>Ask for the policy to be written in trust, so the money reaches your family quickly. <a href={`${base}/en/life-insurance-in-trust/`} className="text-accent-700 underline underline-offset-2">Why a trust matters</a></li>
        </ol>
      </div>
    </div>
  );
}
const LT_PERIOD = '2022-2024';
