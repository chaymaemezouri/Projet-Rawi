import { AFRIQUE, ENCENS, LEVRES } from "./universes-b";
import { CHEVEUX } from "./cheveux";
import { CILS, PEAUX, SAISONS } from "./universes-c";
import { CORPS, MARIAGE, PLANTES } from "./universes-a";
import { HAMMAM } from "./hammam";
import { HUILES, MAINS, PARFUMS } from "./rest";
import type { Body } from "./sheet";
import { COMPLEX } from "./complexes";
import { ingredientImage } from "./ingredientImage";
import { widen } from "./pantries";
import { VISAGE } from "./visage";

export type Copy = { fr: string; ar: string; ary: string };

export type Theme = {
  slug: string;
  image: string;
  title: Copy;
  intro: Copy;
  alt: Copy;
};

export type Ritual = {
  slug: string;
  theme: string;
  title: Copy;
  summary: Copy;
  image: string;
  language: "fr" | "ar" | "ary";
  origin: Copy;
  voice: Copy;
  history: Copy;
  ingredients: { name: Copy; note: Copy; original?: Copy; image: string }[];
  steps: Copy[];
  usage: Copy;
  caution: Copy;
  variants: Copy;
  duration: Copy;
  complexity: "simple" | "detail" | "deep";
  source: Copy;
};

const IMAGES = [
  "/images/rawi-rose.jpg",
  "/images/rawi-clay.jpg",
  "/images/rawi-botanical.jpg",
  "/images/rawi-argan.jpg",
  "/images/rawi-linen.jpg",
  "/images/rawi-hands.jpg",
  "/images/rawi-ritual.jpg",
  "/images/rawi-hair.jpg",
  "/images/rawi-library.jpg",
  "/images/rawi-hero-poster.jpg",
];

export function text(language: string, value: Copy) {
  if (language === "ary") return value.ary;
  if (language === "ar") return value.ar;
  return value.fr;
}

function copy(fr: string, ar: string, ary: string): Copy {
  return { fr, ar, ary };
}

export const THEMES: Theme[] = [
  {
    slug: "visage",
    image: "/images/rawi-rose.jpg",
    title: copy("Soins du visage", "عناية الوجه", "عناية الوجه"),
    intro: copy(
      "Ghassoul, eaux de fleur, miel et avoine, racontés comme à la maison. Chaque fiche est une démonstration, pas un récit collecté.",
      "غاسول ومياه زهر وعسل وشوفان، تُروى كما في البيت. كل بطاقة عرض، ليست رواية جُمعت.",
      "غاسول وما الزهر وعسل وشوفان، مرويين بحال ف الدار. كل بطاقة عرض، ماشي رواية مجموعة.",
    ),
    alt: copy("Pétales et huile sur une pierre", "بتلات وزيت على حجر", "ورد وزيت على حجر"),
  },
  {
    slug: "cheveux",
    image: "/images/rawi-hair.jpg",
    title: copy("Soins des cheveux", "عناية الشعر", "عناية الشعر"),
    intro: copy(
      "Henné, ghassoul, sidr et huiles sur les longueurs. Les durées restent celles du récit, sans minute ajoutée.",
      "حناء وغاسول وسدر وزيوت على الخصل. تبقى المدد كما في الرواية، بلا دقيقة مضافة.",
      "حنا وغاسول وسدر وزيوت على الخصل. المدد كتبقى كيف فالرواية، بلا دقيقة مزيدة.",
    ),
    alt: copy("Poudre végétale et peigne de bois", "مسحوق نباتي ومشط خشب", "بودرة ومشط د الخشب"),
  },
  {
    slug: "hammam",
    image: "/images/rawi-ritual.jpg",
    title: copy("Hammam et gommage", "الحمام والتقشير", "الحمام والتقشير"),
    intro: copy(
      "L'ordre raconté : chaleur, savon beldi, kessa, ghassoul, salle tiède, sortie. Ce n'est pas une séance à copier.",
      "الترتيب المروي: حرارة، صابون بلدي، كيسة، غاسول، قاعة فاترة، خروج. ليست حصة تُنسخ.",
      "الترتيب المروي: سخونية، صابون بلدي، كيس، غاسول، بيت فاتر، خروج. ماشي حصة تنسخ.",
    ),
    alt: copy("Bassin de cuivre et feuilles", "حوض نحاس وأوراق", "طاس نحاس وورق"),
  },
  {
    slug: "huiles",
    image: "/images/rawi-argan.jpg",
    title: copy("Huiles et massages", "الزيوت والتدليك", "الزيوت والتدليك"),
    intro: copy(
      "Argan, olive, amande, sésame. Quand le récit ne donne pas de chiffre, la fiche n'en invente pas.",
      "أركان وزيتون ولوز وسمسم. حين لا تعطي الرواية رقماً، لا تخترعه البطاقة.",
      "أركان وزيتون ولوز وجنجلان. منين الرواية ما كتعطيش رقم، البطاقة ما كتخترعوش.",
    ),
    alt: copy("Huile versée près d'un bol", "زيت يُسكب قرب إناء", "زيت كيتصب حدى زلافة"),
  },
  {
    slug: "parfums",
    image: "/images/rawi-botanical.jpg",
    title: copy("Parfums et eaux florales", "العطور ومياه الزهر", "العطور وما الزهر"),
    intro: copy(
      "Fioles, fleurs et fumée courte. Un nom sur une étiquette n'est pas une origine prouvée.",
      "قنينات وزهر ودخان قصير. الاسم على اللصيقة ليس أصلاً مثبتاً.",
      "قنينات وزهر ودخان قصير. السمية على اللصيقة ماشي أصل مثبت.",
    ),
    alt: copy("Fleurs séchées sur un plateau", "زهور مجففة على صينية", "زهور ناشفين على صينية"),
  },
  {
    slug: "mains",
    image: "/images/rawi-hands.jpg",
    title: copy("Soins des mains et des pieds", "عناية اليدين والقدمين", "عناية اليدين والرجلين"),
    intro: copy(
      "Lessive, henné de fête, huile autour de l'ongle, pieds après le chemin. Les heures qui ne sont pas dites restent absentes.",
      "غسيل، حناء العيد، زيت حول الظفر، قدمان بعد الطريق. الساعات التي لم تُقل تبقى غائبة.",
      "تصبين، حنا العيد، زيت حدا الضفر، رجلين من بعد الطريق. السوايع اللي ما تقالوش كيبقاو غايبين.",
    ),
    alt: copy("Mains préparant une pâte", "يدان تُحضّران عجيناً", "يدين كيحضرو عجينة"),
  },
  {
    slug: "corps",
    image: "/images/rawi-linen.jpg",
    title: copy("Soins du corps", "عناية الجسم", "عناية الجسم"),
    intro: copy(
      "Épaules, coudes, nuque et dos, racontés à part du visage. Le plateau du hammam n'est pas une formule.",
      "أكتاف ومرفقان وقفا وظهر، تُروى بمعزل عن الوجه. صينية الحمام ليست تركيبة.",
      "كتاف ومرافق وقفا وظهر، مرويين بعيد على الوجه. صينية الحمام ماشي تركيبة.",
    ),
    alt: copy("Linge plié près d'un bassin", "قماش مطوي قرب حوض", "توب مطوي حدى طاس"),
  },
  {
    slug: "plantes",
    image: "/images/rawi-botanical.jpg",
    title: copy("Plantes aromatiques", "نباتات عطرية", "نباتات عطرية"),
    intro: copy(
      "Feuilles, fleurs et noms de marché. Une plante nommée n'est pas une préparation, et rien ici n'est à boire comme soin.",
      "أوراق وزهر وأسماء سوق. نبتة مذكورة ليست تحضيراً، ولا شيء هنا يُشرب كعناية.",
      "ورق وزهر وسميات السوق. نبتة مذكورة ماشي تحضير، وحتى حاجة هنا ما كتشربش كعناية.",
    ),
    alt: copy("Feuilles séchées sur un plateau", "أوراق مجففة على صينية", "ورق ناشف على صينية"),
  },
  {
    slug: "mariage",
    image: "/images/rawi-rose.jpg",
    title: copy("Rituels de mariage", "طقوس العرس", "طقوس العرس"),
    intro: copy(
      "Nuit du henné, coffret et matin d'après. Les heures qui ne sont pas dites ne sont pas ajoutées.",
      "ليلة الحناء والصندوق وصباح ما بعد. الساعات التي لم تُقل لا تُضاف.",
      "ليلة الحنا والصندوق وصباح من بعد. السوايع اللي ما تقالوش ما كيتزادوش.",
    ),
    alt: copy("Pétales et linge de fête", "بتلات وقماش عرس", "ورد وتوب العرس"),
  },
  {
    slug: "levres",
    image: "/images/rawi-rose.jpg",
    title: copy("Soins des lèvres", "عناية الشفاه", "عناية الشفاه"),
    intro: copy(
      "Miel, huile, eau et un geste très court. Aucune fiche ne promet une couleur ni une réparation.",
      "عسل وزيت وماء وحركة قصيرة جداً. لا بطاقة تعد بلون ولا بإصلاح.",
      "عسل وزيت وماء وحركة قصيرة بزاف. حتى بطاقة ما كتعّدش بلون ولا بإصلاح.",
    ),
    alt: copy("Bol et pétales", "إناء وبتلات", "زلافة وورد"),
  },
  {
    slug: "afrique",
    image: "/images/rawi-clay.jpg",
    title: copy("Beauté traditionnelle africaine", "جمال تقليدي إفريقي", "جمال تقليدي إفريقي"),
    intro: copy(
      "Noms entendus au-delà du Maroc : karité, hibiscus, chébé. Quand la voix n'a pas vu le geste, la fiche ne l'invente pas.",
      "أسماء سُمعت أبعد من المغرب: كاريتة وكركديه وشيبي. حين لم ترَ الصوت الحركة، لا تخترعها البطاقة.",
      "سميات تسمعو بعيد على المغرب: كاريتي وكركديه وشابي. منين الصوت ما شافش الحركة، البطاقة ما كتخترعهاش.",
    ),
    alt: copy("Poudre et bois", "مسحوق وخشب", "بودرة وخشب"),
  },
  {
    slug: "encens",
    image: "/images/rawi-ritual.jpg",
    title: copy("Encens et senteurs", "البخور والروائح", "البخور والروايح"),
    intro: copy(
      "Une pincée, une fenêtre, un charbon déjà allumé par une autre figure. La fiche n'explique pas le feu.",
      "رشة ونافذة وفحمة أوقدتها شخصية أخرى. البطاقة لا تشرح النار.",
      "رشة وشرجم وفحمة شعلاتها شخصية أخرى. البطاقة ما كتشرحش العافية.",
    ),
    alt: copy("Bassin de cuivre", "حوض نحاس", "طاس نحاس"),
  },
  {
    slug: "peaux",
    image: "/images/rawi-linen.jpg",
    title: copy("Récits pour types de peau", "روايات عن أنواع البشرة", "روايات على أنواع البشرة"),
    intro: copy(
      "La voix dit « ça tire » ou « ça brille ». Elle ne classe personne et la fiche ne transforme pas ce mot en régime.",
      "تقول الصوت «يسحب» أو «يلمع». لا تصنّف أحداً ولا تحوّل البطاقة الكلمة إلى نظام.",
      "الصوت كتقول «كيشد» ولا «كيلمع». ما كتصنّفش حتى واحد والبطاقة ما كتحوّلش الكلمة لنظام.",
    ),
    alt: copy("Linge clair", "قماش فاتح", "توب فاتح"),
  },
  {
    slug: "cils",
    image: "/images/rawi-hands.jpg",
    title: copy("Sourcils et cils", "حواجب وأهداب", "حواجب وهداب"),
    intro: copy(
      "Un doigt, un trait, un refus d'entrer dans l'œil. Aucune fiche n'annonce une pousse.",
      "إصبع وخط ورفض للدخول إلى العين. لا بطاقة تعلن نمواً.",
      "صبع وخط ورفض يدخل للعين. حتى بطاقة ما كتعلنش النمو.",
    ),
    alt: copy("Mains et linge", "يدان وقماش", "يدين وتوب"),
  },
  {
    slug: "saisons",
    image: "/images/rawi-botanical.jpg",
    title: copy("Rituels saisonniers", "طقوس المواسم", "طقوس المواسم"),
    intro: copy(
      "Vent, pluie, chaleur et semaine du bigaradier. Le calendrier raconté ne devient pas un programme.",
      "ريح ومطر وحر وأسبوع الزنباع. التقويم المروي لا يصير برنامجاً.",
      "ريح وشتا وسخونية وسيمانة الزنباع. التقويم المروي ما كيوليش برنامج.",
    ),
    alt: copy("Feuilles et fleurs", "أوراق وزهر", "ورق وزهر"),
  },
];

const PACKS: Record<string, Body[]> = {
  visage: [...VISAGE, ...(COMPLEX.visage ?? [])],
  cheveux: [...CHEVEUX, ...(COMPLEX.cheveux ?? [])],
  hammam: [...HAMMAM, ...(COMPLEX.hammam ?? [])],
  huiles: [...HUILES, ...(COMPLEX.huiles ?? [])],
  parfums: PARFUMS,
  mains: MAINS,
  corps: [...CORPS, ...(COMPLEX.corps ?? [])],
  plantes: [...PLANTES, ...(COMPLEX.plantes ?? [])],
  mariage: [...MARIAGE, ...(COMPLEX.mariage ?? [])],
  levres: LEVRES,
  afrique: AFRIQUE,
  encens: [...ENCENS, ...(COMPLEX.encens ?? [])],
  peaux: PEAUX,
  cils: CILS,
  saisons: SAISONS,
};

const LANGS = ["fr", "ar", "ary"] as const;

export const RITUALS: Ritual[] = THEMES.flatMap((theme, themeIndex) =>
  PACKS[theme.slug].map((raw, index) => {
    const body = widen(theme.slug, index, raw);
    return {
    slug: `${theme.slug}-${index + 1}`,
    theme: theme.slug,
    image: IMAGES[(themeIndex + index) % IMAGES.length],
    language: LANGS[(themeIndex + index) % LANGS.length],
    title: body.title,
    summary: body.summary,
    origin: body.origin,
    voice: body.voice,
    history: body.history,
    steps: body.steps,
    usage: body.usage,
    caution: body.caution,
    variants: body.variants,
    duration: body.duration,
    complexity: body.complexity,
    source: body.source,
    ingredients: body.ingredients.map((item) => ({
      name: item.name,
      note: item.note,
      original: item.original,
      image: ingredientImage(item.name.fr),
    })),
    };
  }),
);

export function themeBySlug(slug: string) {
  return THEMES.find((theme) => theme.slug === slug);
}

export function ritualBySlug(slug: string) {
  return RITUALS.find((ritual) => ritual.slug === slug);
}

export function ritualsFor(theme: string) {
  return RITUALS.filter((ritual) => ritual.theme === theme);
}
