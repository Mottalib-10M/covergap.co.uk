/** Mini-calculator types (RECETTE §9.3). Each spec lives in `lib/mini-specs.ts` and calls the tested engine. */
export interface MiniInput { id: string; label: string; def: number; unit?: string; max?: number; decimals?: number; help?: string; options?: Array<{ value: string; label: string }>;
  /** Optional field folded into "More about your case"; its current value stays readable in the fold's title. */
  avance?: boolean;
  /** Shown only when it matters for the case on screen (brief of 2026-11-10, rule 5): e.g. the waiting time
   *  of a policy only once a policy amount is typed. */
  si?: (v: Record<string, number>) => boolean }
/** `sub`: one line under the big figure, saying what it assumes and over which period (brief of 2026-11-10, rule 1). */
export interface MiniOut { head: [string, string]; sub?: string; rows: Array<[string, string]>; note?: string }
/** A door for a profile (brief of 2026-11-10, rule 2): a button above the form that loads another example. */
export interface MiniPorte { label: string; v: Record<string, number> }
export interface MiniSpec {
  title: string; cta: string; ctaPage?: string; inputs: MiniInput[];
  /** `touched`: the fields the reader has changed (naive testers, 2026-11-08). While it is empty the
   *  component shows "Example, not your result yet"; a spec may also use it to hold back a verdict. */
  run: (v: Record<string, number>, touched?: Record<string, boolean>) => MiniOut;
  /** What the example assumes, in plain words, for the "Example" mention (testers of 2026-11-09, second
   *  round): “a man of 40 taking a 25-year policy”. Without it the mention lists the visible fields. */
  exemple?: (v: Record<string, number>) => string;
  /** Doors by profile, shown as buttons above the fields. */
  portes?: MiniPorte[];
}
