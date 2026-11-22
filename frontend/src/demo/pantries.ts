import { c, type Body, type Ingredient } from "./sheet";

const tray = c(
  "Nommé sur le plateau du récit. Aucun poids. Il n'est pas forcément versé dans le geste.",
  "مذكور على صينية الرواية. بلا وزن. لا يُسكب بالضرورة في الحركة.",
  "مذكور على صينية الرواية. بلا وزن. ما كيتصبش بالضرورة فالحركة.",
);

const eye = c(
  "Nommé sur la table. Rien n'entre dans l'œil. Aucun poids.",
  "مذكور على الطاولة. لا شيء يدخل العين. بلا وزن.",
  "مذكور على الطبلة. حتى حاجة ما كدخلش للعين. بلا وزن.",
);

const dry = c(
  "Plante nommée, sèche. Rien n'est bu. Aucun poids.",
  "نبتة مذكورة، جافة. لا يُشرب شيء. بلا وزن.",
  "نبتة مذكورة، ناشفة. حتى حاجة ما كتشرب. بلا وزن.",
);

function item(fr: string, ar: string, ary: string, note = tray): Ingredient {
  return { name: c(fr, ar, ary), note };
}

const PANTRY: Record<string, Ingredient[]> = {
  visage: [
    item("Ghassoul", "غاسول", "غاسول"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Miel", "عسل", "عسل"),
    item("Poudre d'amande", "مسحوق اللوز", "بودرة اللوز"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Safran", "زعفران", "زعفران"),
    item("Lait", "حليب", "حليب"),
    item("Camomille", "بابونج", "بابونج"),
    item("Eau", "ماء", "ماء"),
  ],
  cheveux: [
    item("Sidr", "سدر", "سدر"),
    item("Henné", "حناء", "حنا"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Huile de nigelle", "زيت حبة البركة", "زيت حبة البركة"),
    item("Romarin", "إكليل الجبل", "أزيري"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Miel", "عسل", "عسل"),
    item("Savon beldi", "صابون بلدي", "صابون بلدي"),
  ],
  hammam: [
    item("Savon beldi", "صابون بلدي", "صابون بلدي"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Miel", "عسل", "عسل"),
    item("Menthe", "نعناع", "نعناع"),
    item("Thym", "زعتر", "زعتر"),
    item("Henné", "حناء", "حنا"),
    item("Eau", "ماء", "ماء"),
  ],
  huiles: [
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Huile d'amande", "زيت اللوز", "زيت اللوز"),
    item("Huile de sésame", "زيت السمسم", "زيت الجنجلان"),
    item("Huile de nigelle", "زيت حبة البركة", "زيت حبة البركة"),
    item("Beurre de karité", "زبدة الكاريتة", "زبدة الكاريتي"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Safran", "زعفران", "زعفران"),
    item("Miel", "عسل", "عسل"),
  ],
  parfums: [
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Menthe", "نعناع", "نعناع"),
    item("Lavande", "خزامى", "خزامى"),
    item("Camomille", "بابونج", "بابونج"),
    item("Safran", "زعفران", "زعفران"),
    item("Citron", "ليمون", "حامض"),
    item("Encens", "بخور", "بخور"),
    item("Miel", "عسل", "عسل"),
    item("Eau", "ماء", "ماء"),
  ],
  mains: [
    item("Henné", "حناء", "حنا"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Sucre", "سكر", "سكر"),
    item("Citron", "ليمون", "حامض"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Miel", "عسل", "عسل"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Savon beldi", "صابون بلدي", "صابون بلدي"),
    item("Eau", "ماء", "ماء"),
  ],
  corps: [
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Miel", "عسل", "عسل"),
    item("Sucre", "سكر", "سكر"),
    item("Poudre d'amande", "مسحوق اللوز", "بودرة اللوز"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Beurre de karité", "زبدة الكاريتة", "زبدة الكاريتي"),
    item("Savon beldi", "صابون بلدي", "صابون بلدي"),
  ],
  plantes: [
    item("Menthe", "نعناع", "نعناع", dry),
    item("Camomille", "بابونج", "بابونج", dry),
    item("Lavande", "خزامى", "خزامى", dry),
    item("Romarin", "إكليل الجبل", "أزيري", dry),
    item("Thym", "زعتر", "زعتر", dry),
    item("Rose", "ورد", "ورد", dry),
    item("Sauge", "مريمية", "سالمية", dry),
    item("Sidr", "سدر", "سدر", dry),
    item("Verveine", "اللويزة", "اللويزة", dry),
    item("Safran", "زعفران", "زعفران", dry),
  ],
  mariage: [
    item("Henné", "حناء", "حنا"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Safran", "زعفران", "زعفران"),
    item("Miel", "عسل", "عسل"),
    item("Sucre", "سكر", "سكر"),
    item("Citron", "ليمون", "حامض"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Encens", "بخور", "بخور"),
    item("Lait", "حليب", "حليب"),
  ],
  levres: [
    item("Miel", "عسل", "عسل"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Beurre de karité", "زبدة الكاريتة", "زبدة الكاريتي"),
    item("Cire d'abeille", "شمع النحل", "شمع النحل"),
    item("Poudre d'amande", "مسحوق اللوز", "بودرة اللوز"),
    item("Sucre", "سكر", "سكر"),
    item("Citron", "ليمون", "حامض"),
    item("Eau", "ماء", "ماء"),
  ],
  afrique: [
    item("Beurre de karité", "زبدة الكاريتة", "زبدة الكاريتي"),
    item("Henné", "حناء", "حنا"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Miel", "عسل", "عسل"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Sidr", "سدر", "سدر"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Huile de nigelle", "زيت حبة البركة", "زيت حبة البركة"),
    item("Sucre", "سكر", "سكر"),
  ],
  encens: [
    item("Encens", "بخور", "بخور"),
    item("Rose", "ورد", "ورد"),
    item("Safran", "زعفران", "زعفران"),
    item("Menthe", "نعناع", "نعناع"),
    item("Lavande", "خزامى", "خزامى"),
    item("Camomille", "بابونج", "بابونج"),
    item("Citron", "ليمون", "حامض"),
    item("Miel", "عسل", "عسل"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
  ],
  peaux: [
    item("Eau", "ماء", "ماء"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Miel", "عسل", "عسل"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون"),
    item("Poudre d'amande", "مسحوق اللوز", "بودرة اللوز"),
    item("Lait", "حليب", "حليب"),
    item("Camomille", "بابونج", "بابونج"),
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
  ],
  cils: [
    item("Khol", "كحل", "كحل", eye),
    item("Eau", "ماء", "ماء", eye),
    item("Coton", "قطن", "قطن", eye),
    item("Linge", "قماش", "توب", eye),
    item("Eau de rose", "ماء الورد", "ما الورد", eye),
    item("Huile d'olive", "زيت الزيتون", "زيت الزيتون", eye),
    item("Henné", "حناء", "حنا", eye),
    item("Ghassoul", "غاسول", "غاسول", eye),
    item("Miel", "عسل", "عسل", eye),
    item("Savon beldi", "صابون بلدي", "صابون بلدي", eye),
  ],
  saisons: [
    item("Fleur d'oranger", "ماء الزهر", "ما الزهر"),
    item("Eau de rose", "ماء الورد", "ما الورد"),
    item("Menthe", "نعناع", "نعناع"),
    item("Citron", "ليمون", "حامض"),
    item("Miel", "عسل", "عسل"),
    item("Ghassoul", "غاسول", "غاسول"),
    item("Huile d'argan", "زيت الأركان", "زيت الأركان"),
    item("Lavande", "خزامى", "خزامى"),
    item("Camomille", "بابونج", "بابونج"),
    item("Safran", "زعفران", "زعفران"),
  ],
};

function tail(theme: string, fr: string, ar: string, ary: string) {
  if (theme === "cils") {
    return {
      fr: `Sur la table, la voix nomme aussi : ${fr}. Rien de cette liste n'entre dans l'œil, et aucun poids n'est dit.`,
      ar: `على الطاولة، تسمّي الصوت أيضاً: ${ar}. لا شيء من هذه اللائحة يدخل العين، ولا يُذكر وزن.`,
      ary: `على الطبلة، الصوت كتسمي أيضاً: ${ary}. حتى حاجة من هاد اللائحة ما كدخلش للعين، وحتى وزن ما مذكور.`,
    };
  }
  if (theme === "plantes") {
    return {
      fr: `Dans le panier, la voix nomme aussi : ${fr}. Rien n'est bu, et aucun poids n'est dit.`,
      ar: `في السلة، تسمّي الصوت أيضاً: ${ar}. لا يُشرب شيء، ولا يُذكر وزن.`,
      ary: `فالسلة، الصوت كتسمي أيضاً: ${ary}. حتى حاجة ما كتشرب، وحتى وزن ما مذكور.`,
    };
  }
  if (theme === "encens") {
    return {
      fr: `À côté, la voix nomme aussi : ${fr}. Le feu n'est pas expliqué, et aucun poids n'est dit.`,
      ar: `إلى الجانب، تسمّي الصوت أيضاً: ${ar}. النار غير مشروحة، ولا يُذكر وزن.`,
      ary: `فالجنب، الصوت كتسمي أيضاً: ${ary}. العافية ما مشروحااش، وحتى وزن ما مذكور.`,
    };
  }
  return {
    fr: `Sur le même plateau, la voix nomme aussi : ${fr}. Aucun poids n'est dit, et ces pots ne sont pas tous versés dans le geste.`,
    ar: `على الصينية نفسها، تسمّي الصوت أيضاً: ${ar}. لا يُذكر وزن، وهذه الأواني لا تُسكب كلها في الحركة.`,
    ary: `على نفس الصينية، الصوت كتسمي أيضاً: ${ary}. حتى وزن ما مذكور، وهاد الأواني ما كيتصبوش كلهم فالحركة.`,
  };
}

export function widen(theme: string, index: number, body: Body): Body {
  if (body.ingredients.length >= 9) return body;
  const pool = PANTRY[theme] ?? PANTRY.visage;
  const have = new Set(body.ingredients.map((item) => item.name.fr.toLowerCase()));
  const added: Ingredient[] = [];
  for (let step = 0; step < pool.length && body.ingredients.length + added.length < 10; step += 1) {
    const next = pool[(index + step) % pool.length];
    if (have.has(next.name.fr.toLowerCase())) continue;
    have.add(next.name.fr.toLowerCase());
    added.push(next);
  }
  if (added.length === 0) return body;
  const extra = tail(theme, added.map((item) => item.name.fr).join(", "), added.map((item) => item.name.ar).join("، "), added.map((item) => item.name.ary).join("، "));
  const count = body.ingredients.length + added.length;
  return {
    ...body,
    ingredients: [...body.ingredients, ...added],
    history: { fr: `${body.history.fr} ${extra.fr}`, ar: `${body.history.ar} ${extra.ar}`, ary: `${body.history.ary} ${extra.ary}` },
    complexity: count >= 9 ? "deep" : "detail",
  };
}
