/** llms.txt (RECETTE §21): what the site is, where its figures come from, its main pages. Built from the data. */
import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, LAST_UPDATED } from '../data/site-config';
import { P } from '../lib/engine/params';
export const GET: APIRoute = () => {
  const lines = [
    '# Cover Gap',
    '',
    `> Calculators that set UK life cover, income protection and funeral plans against what the state already pays in ${P.taxYear}: Statutory Sick Pay from 6 April 2026 (the lower of £${P.ssp.weekly} a week and ${P.ssp.earningsShare * 100} % of earnings, from day one, up to ${P.ssp.maxWeeks} weeks), New Style ESA, Bereavement Support Payment and the Funeral Expenses Payment, read on GOV.UK. The chance that a term policy pays out comes from the ONS national life tables 2022-2024 for the UK and its four nations. The site shows no insurance prices (no publishable source exists) and asks for no contact details. Rates read on ${LAST_UPDATED}. Published by Radif Partners, an independent publisher; not an insurer, broker or government service, no personal advice.`,
    '',
    '## Calculators',
    `- [Life cover calculator](${SITE_URL}${route('home', 'en')}): cover still needed after Bereavement Support Payment, death in service and savings, with the chance a policy pays out.`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`),
    '',
    '## Method',
    `- [How the figures are worked out](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
