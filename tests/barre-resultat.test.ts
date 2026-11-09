/**
 * Bottom result bar of the main tool on phones (report of 2026-11-08): it reads "Example:" until the reader
 * changes a field, starts hidden (it is shown only where it covers no field, after hydration) and is never
 * drawn over the form.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CoverCalc from '../src/components/calc/CoverCalc';

describe('bottom result bar', () => {
  const html = renderToStaticMarkup(createElement(CoverCalc, { methodHref: '/en/method/' }));
  const barre = html.match(/<div data-barre-resultat[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
  it('is marked as an example while no field has been changed', () => {
    expect(barre).toContain('data-exemple-barre');
    expect(barre).toMatch(/Example:<\/span>cover needed /);
  });
  it('starts hidden: first render covers nothing', () => {
    expect(barre).toMatch(/class="[^"]*\bhidden\b/);
  });
  it('steps aside over a field, a focused field or the result itself', () => {
    const src = readFileSync(new URL('../src/components/calc/CoverCalc.tsx', import.meta.url), 'utf8');
    expect(src).toContain("f.querySelectorAll('input, select, button, summary, label')");
    expect(src).toContain('setBarre(!resultatVu && !saisie && !couvre)');
  });
});
