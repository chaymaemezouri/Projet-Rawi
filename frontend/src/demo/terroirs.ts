export type Copy = { fr: string; ar: string; ary: string };

const c = (fr: string, ar: string, ary: string): Copy => ({ fr, ar, ary });

export type TerroirProduct = {
  name: Copy;
  note: Copy;
  limit: Copy;
  image: string;
};

export type TerroirHouse = {
  slug: string;
  name: Copy;
  place: Copy;
  summary: Copy;
  story: Copy;
  image: string;
  hero: string;
  logo: string;
  products: TerroirProduct[];
};

export const TERROIRS: TerroirHouse[] = [
  {
    slug: "cour-du-matin",
    name: c("Cour du matin", "فناء الصباح", "فناء الصباح"),
    place: c("Souss", "سوس", "سوس"),
    summary: c(
      "Huile claire, savon de la cour et résidu du pressoir.",
      "زيت صافٍ وصابون الفناء وفضلة المعصرة.",
      "زيت صافي وصابون الفناء وفضلة المعصرة.",
    ),
    story: c(
      "La cour ouvre tôt. La bouteille claire est à gauche, le savon au centre, le résidu du pressoir à droite, dans un linge. L'huile reste pour la peau. Le savon est une barre de la cour. Le résidu reste un reste du pressoir : il n'entre ni dans la farine ni dans l'assiette. Tout vient du Souss, pressé le jour même.",
      "يفتح الفناء باكراً. القارورة الصافية على اليسار، والصابون في الوسط، وفضلة المعصرة على اليمين في قماش. يبقى الزيت للبشرة. الصابون قطعة من الفناء. تبقى الفضلة من المعصرة: لا تدخل الدقيق ولا الصحن. الكل من سوس، يُعصر في يومه.",
      "الفناء كيحال بكري. القارورة الصافية على اليسار، والصابون فالوسط، وفضلة المعصرة على اليمين فتوب. الزيت كيبقا للبشرة. الصابون قطعة من الفناء. الفضلة كتبقى من المعصرة: ما كدخلش للدقيق ولا للصحن. الكل من سوس، كيتعصر فنفس النهار.",
    ),
    image: "/images/rawi-argan.jpg",
    hero: "/images/set-matin.jpg",
    logo: "/images/logo-matin.jpg",
    products: [
      {
        name: c("Huile claire", "زيت صافٍ", "زيت صافي"),
        note: c("Huile claire du matin, pour la peau.", "زيت الصباح الصافي، للبشرة.", "زيت الصباح الصافي، للبشرة."),
        limit: c("Pressée le jour, mise en bouteille à la cour.", "تُعصر في يومها وتُعبأ في الفناء.", "كتتعصر فالنهار وكتتعبأ فالفناء."),
        image: "/images/prod-huile.jpg",
      },
      {
        name: c("Savon de la cour", "صابون الفناء", "صابون الفناء"),
        note: c("Barre de savon de la cour, à côté de l'huile.", "قطعة صابون الفناء، بجانب الزيت.", "قطعة صابون الفناء، حدا الزيت."),
        limit: c("Savon de la maison.", "صابون البيت.", "صابون الدار."),
        image: "/images/prod-savon.jpg",
      },
      {
        name: c("Résidu du pressoir", "فضلة المعصرة", "فضلة المعصرة"),
        note: c("Ce qui reste après l'huile, gardé dans un linge.", "ما يبقى بعد الزيت، محفوظ في قماش.", "اللي كيبقا من بعد الزيت، محفوظ فتوب."),
        limit: c("Reste du pressoir. Ni farine, ni aliment.", "فضلة المعصرة. لا دقيق ولا طعام.", "فضلة المعصرة. ماشي دقيق وماشي ماكلة."),
        image: "/images/prod-residu.jpg",
      },
    ],
  },
  {
    slug: "bassin-de-la-rose",
    name: c("Bassin de la rose", "حوض الورد", "حوض الورد"),
    place: c("Vallée des roses", "وادي الورد", "وادي الورد"),
    summary: c(
      "Eau de rose, fleur d'oranger et pétales secs.",
      "ماء الورد وزهر النارنج وبتلات يابسة.",
      "ما الورد وزهر النارنج وبتلات يابسين.",
    ),
    story: c(
      "Le bassin aligne trois choses sur la pierre : une fiole de rose, une fiole de fleur d'oranger, un carré de linge plein de pétales secs. Les pétales restent secs, pour le parfum du linge. Les fleurs viennent de la vallée.",
      "يصفّ الحوض ثلاثة أشياء على الحجر: قنينة ورد، قنينة زهر النارنج، ومربعاً من القماش مليئاً ببتلات يابسة. تبقى البتلات يابسة لعطر القماش. الزهر من الوادي.",
      "الحوض كيصّف تلاتة د الحوايج على الحجر: قنينة ورد، قنينة زهر النارنج، ومربع من التوب عامر ببتلات يابسين. البتلات كيبقاو يابسين لعطر التوب. الزهر من الواد.",
    ),
    image: "/images/rawi-rose.jpg",
    hero: "/images/set-rose.jpg",
    logo: "/images/logo-rose.jpg",
    products: [
      {
        name: c("Fiole de rose", "قنينة الورد", "قنينة الورد"),
        note: c("Eau de rose, reconnue à son odeur.", "ماء الورد، يُعرف من رائحته.", "ما الورد، كيعرف من ريحتو."),
        limit: c("Fiole de la vallée.", "قنينة الوادي.", "قنينة الواد."),
        image: "/images/prod-rose.jpg",
      },
      {
        name: c("Fleur d'oranger", "زهر النارنج", "زهر النارنج"),
        note: c("Fiole plus claire. Elle reste à part de la rose.", "قنينة أصفى. تبقى بمعزل عن الورد.", "قنينة أصفى. كتبقى بوحدها على الورد."),
        limit: c("Fleur d'oranger de la vallée.", "زهر النارنج من الوادي.", "زهر النارنج من الواد."),
        image: "/images/prod-oranger.jpg",
      },
      {
        name: c("Pétales secs", "بتلات يابسة", "بتلات يابسين"),
        note: c("Pétales secs, gardés dans un linge pour le parfum.", "بتلات يابسة، محفوظة في قماش للعطر.", "بتلات يابسين، محفوظين فتوب للعطر."),
        limit: c("Ils restent secs.", "تبقى يابسة.", "كيبقاو يابسين."),
        image: "/images/prod-petales.jpg",
      },
    ],
  },
  {
    slug: "pierre-du-ghassoul",
    name: c("Pierre du ghassoul", "حجر الغاسول", "حجرة الغاسول"),
    place: c("Atlas", "الأطلس", "الأطلس"),
    summary: c(
      "Pierre de ghassoul, poudre et feuilles de henné.",
      "حجر الغاسول والمسحوق وأوراق الحناء.",
      "حجرة الغاسول والمسحوق وورق الحنا.",
    ),
    story: c(
      "La pierre reste entière au bord de la bassine. La poudre est à côté, dans un bol. Les feuilles de henné sont liées par un fil et restent des feuilles. Le ghassoul et le henné sont deux matières de l'Atlas, chacune à part.",
      "يبقى الحجر كاملاً على حافة الإناء. المسحوق بجانبه في زبدية. أوراق الحناء مربوطة بخيط وتبقى أوراقاً. الغاسول والحناء مادتان من الأطلس، كل واحدة على حدة.",
      "الحجرة كتبقى كاملة على حرف الإناء. المسحوق حداها فالزلافة. ورق الحنا مربوط بخيط وكيبقا ورق. الغاسول والحنا جوج مواد من الأطلس، كل وحدة بوحدها.",
    ),
    image: "/images/rawi-clay.jpg",
    hero: "/images/set-ghassoul.jpg",
    logo: "/images/logo-ghassoul.jpg",
    products: [
      {
        name: c("Pierre entière", "حجر كامل", "حجرة كاملة"),
        note: c("Pierre entière, au bord de la bassine.", "حجر كامل، على حافة الإناء.", "حجرة كاملة، على حرف الإناء."),
        limit: c("Ghassoul de l'Atlas.", "غاسول الأطلس.", "غاسول الأطلس."),
        image: "/images/prod-pierre.jpg",
      },
      {
        name: c("Poudre de ghassoul", "مسحوق الغاسول", "مسحوق الغاسول"),
        note: c("La même pierre, en poudre, dans un bol.", "الحجر نفسه، مسحوقاً، في زبدية.", "نفس الحجرة، مسحوق، فالزلافة."),
        limit: c("Poudre de la maison.", "مسحوق البيت.", "مسحوق الدار."),
        image: "/images/prod-poudre.jpg",
      },
      {
        name: c("Feuilles de henné", "أوراق الحناء", "ورق الحنا"),
        note: c("Feuilles liées par un fil, encore des feuilles.", "أوراق مربوطة بخيط، ما زالت أوراقاً.", "ورق مربوط بخيط، باقي ورق."),
        limit: c("Henné de l'Atlas, à part du ghassoul.", "حناء الأطلس، بمعزل عن الغاسول.", "حنا الأطلس، بوحدو على الغاسول."),
        image: "/images/prod-henne.jpg",
      },
    ],
  },
];

export function terroirBySlug(slug: string) {
  return TERROIRS.find((house) => house.slug === slug);
}
