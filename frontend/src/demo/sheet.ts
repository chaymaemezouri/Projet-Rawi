export type C = { fr: string; ar: string; ary: string };

export const c = (fr: string, ar: string, ary: string): C => ({ fr, ar, ary });

export const SOURCE = c(
  "Démonstration éditoriale. Cette fiche n'est pas un récit déposé : elle n'a ni version, ni correction, ni validation.",
  "عرض تحريري. هذه البطاقة ليست رواية مودعة: بلا نسخة ولا تصحيح ولا مراجعة.",
  "عرض تحريري. هاد البطاقة ماشي رواية مودعة: بلا نسخة وبلا تصحيح وبلا مراجعة.",
);

export type Complexity = "simple" | "detail" | "deep";

const NO_VARIANT = c(
  "Le récit ne raconte pas d'autre version.",
  "لا تروي الرواية نسخة أخرى.",
  "الرواية ما كترويش نسخة أخرى.",
);

const NO_DURATION = c(
  "Aucune durée chiffrée n'est dite. Le temps reste celui du geste raconté.",
  "لا تُذكر مدة مرقّمة. يبقى الوقت وقت الحركة المروية.",
  "حتى مدة مرقّمة ما مذكوراش. الوقت كيبقا وقت الحركة المروية.",
);

export type Ingredient = { name: C; note: C; original?: C };

export type Body = {
  title: C;
  summary: C;
  origin: C;
  voice: C;
  history: C;
  ingredients: Ingredient[];
  steps: C[];
  usage: C;
  caution: C;
  variants: C;
  duration: C;
  complexity: Complexity;
  source: C;
};

export function sheet(partial: Omit<Body, "source" | "variants" | "duration" | "complexity"> & Partial<Pick<Body, "variants" | "duration" | "complexity">>): Body {
  const count = partial.ingredients.length;
  const complexity = partial.complexity ?? (count >= 9 ? "deep" : count >= 5 ? "detail" : "simple");
  return {
    ...partial,
    complexity,
    variants: partial.variants ?? NO_VARIANT,
    duration: partial.duration ?? NO_DURATION,
    source: SOURCE,
  };
}
