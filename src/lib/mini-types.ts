/** Mini-calculator types (RECETTE §9.3). Each spec lives in `lib/mini-specs.ts` and calls the tested engine. */
export interface MiniInput { id: string; label: string; def: number; unit?: string; max?: number; decimals?: number; help?: string; options?: Array<{ value: string; label: string }>;
  /** Optional field folded into "More about your case"; its current value stays readable in the fold's title. */
  avance?: boolean }
export interface MiniOut { head: [string, string]; rows: Array<[string, string]>; note?: string }
export interface MiniSpec {
  title: string; cta: string; ctaPage?: string; inputs: MiniInput[];
  /** `touched`: the fields the reader has changed (naive testers, 2026-11-08). While it is empty the
   *  component shows "Example, not your result yet"; a spec may also use it to hold back a verdict. */
  run: (v: Record<string, number>, touched?: Record<string, boolean>) => MiniOut;
  /** What the example assumes, in plain words, for the "Example" mention (testers of 2026-11-09, second
   *  round): “a man of 40 taking a 25-year policy”. Without it the mention lists the visible fields. */
  exemple?: (v: Record<string, number>) => string;
}
