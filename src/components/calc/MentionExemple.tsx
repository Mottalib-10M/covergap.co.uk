/**
 * Mention posée sur un résultat calculé avec les valeurs d'exemple (testeurs naïfs du 2026-11-08,
 * RECETTE §15.8) : tant que le lecteur n'a modifié aucun champ, le résultat n'est pas le sien.
 * Elle disparaît dès la première saisie. À poser dans le bloc du résultat de tout calculateur
 * pré-rempli : `<MentionExemple lang={lang} touched={touched} />`.
 * covergap.co.uk, testeurs du 2026-11-09 (second passage) : `quoi` dit en mots simples ce que l'exemple
 * suppose (« a married parent of 40, one child at home, £180,000 left on the mortgage »).
 */
import { libellesTrame, resultatExemple } from '../../lib/libelles-trame';

export default function MentionExemple({ lang, touched, quoi, className = '' }: { lang?: string; touched?: Record<string, boolean>; quoi?: string; className?: string }) {
  if (!resultatExemple(touched)) return null;
  const l = libellesTrame(lang);
  return (
    <p data-exemple className={`mb-2 inline-flex flex-wrap items-baseline gap-x-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-900 ${className}`}>
      <strong className="font-semibold">{l.exemple}</strong><span>· {quoi ? `it assumes ${quoi}. Change any figure to see yours` : l.exempleAide}</span>
    </p>
  );
}
