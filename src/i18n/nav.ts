import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Life cover calculator', method: 'How the figures are worked out', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
// Testers of 2026-11-09 (second round): “income protection” was nowhere in the menu; the group says it.
// One name per group in the menu, the footer and the page kickers (testers 2026-11-09: “Tax” here, “Trusts, tax and business” there).
const GROUP_LABEL: Record<Group, string> = { life: 'Life cover', income: 'Sick pay and income protection', later: 'Over 50', funeral: 'Funerals', tax: 'Trusts and tax' };
export const GROUPS_ORDER: Group[] = ['life', 'income', 'later', 'funeral', 'tax'];
export const groupLabel = (g: Group) => GROUP_LABEL[g];
export const label = (id: string, _lang: Locale = 'en') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
function categoriesCompletes(lang: Locale): NavCategory[] {
  return GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
// Top menu: short labels, never on two lines (full labels stay in the footer).
const COURT: Record<string, string> = {};
export const navCategories = (lang: Locale, court = true): NavCategory[] =>
  categoriesCompletes(lang).map((c) => (court ? { ...c, label: COURT[c.label] ?? c.label } : c));
// The main calculator, first in the menu (testers 2026-11-09: no way back to it but the logo).
export const navDirect = (lang: Locale): NavLink[] => [{ href: route('home', lang), label: label('home', lang) }];
export const footerColumns = (lang: Locale): NavCategory[] => [...GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length), { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
