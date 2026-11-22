import type { Copy } from "./catalog";

const c = (fr: string, ar: string, ary: string): Copy => ({ fr, ar, ary });

export type BrandId = "tifawt" | "zayna" | "atlas";
export type PackageShape = "bottle" | "vial" | "jar" | "soap" | "pouch" | "box";
export type TerroirCategory = "huiles" | "cosmetiques" | "plantes";
export type PackageView = "front" | "detail";

export type TerroirProduct = {
  id: string;
  brandId: BrandId;
  slug: string;
  name: Copy;
  shortDescription: Copy;
  description: Copy;
  ingredients: Copy;
  format: Copy;
  price: number;
  currency: "DH";
  shape: PackageShape;
  image: string;
  gallery: PackageView[];
  label: Copy;
  origin: Copy;
  usage: Copy;
  heritage: Copy;
  ritual: string;
};

export type TerroirBrand = {
  id: BrandId;
  slug: string;
  name: string;
  slogan: Copy;
  description: Copy;
  longDescription: Copy;
  domain: Copy;
  category: TerroirCategory;
  cover: string;
  story: Copy;
  inspiration: Copy;
  craft: Copy;
  values: Copy;
  heritage: Copy;
  ritual: string;
  products: TerroirProduct[];
};

const origin = c("Maroc", "المغرب", "المغرب");

function item(brandId: BrandId, product: Omit<TerroirProduct, "brandId" | "currency" | "origin" | "gallery" | "image">): TerroirProduct {
  return { ...product, brandId, currency: "DH", origin, image: `/images/shelf-${product.slug}.jpg`, gallery: ["front", "detail"] };
}

export const TERROIRS: TerroirBrand[] = [
  {
    id: "tifawt",
    slug: "tifawt-oils",
    name: "Tifawt Oils",
    slogan: c(
      "L'authenticité de nos terres, la richesse de nos huiles.",
      "أصالة أرضنا، وغنى زيوتنا.",
      "أصالة أرضنا، وغنى الزيوت ديالنا.",
    ),
    description: c(
      "Tifawt Oils valorise des huiles végétales inspirées des fruits et des graines du Maroc.",
      "تيفاوت أويلز تقدّر زيوتاً نباتية مستوحاة من فواكه المغرب وحبوبه.",
      "تيفاوت أويلز كتقدّر زيوت نباتية مستوحاة من فواكه المغرب وحبوبو.",
    ),
    longDescription: c(
      "Six flacons, six fruits ou graines. Chaque étiquette porte le nom de l'huile, le format et le Maroc. La maison parle du pressoir et du verre, pas d'un grade officiel.",
      "ستة قوارير، ستة فواكه أو حبوب. كل لصيقة تحمل اسم الزيت والعبوة والمغرب. البيت يتكلم عن المعصرة والزجاج، لا عن درجة رسمية.",
      "ستة د القوارير، ستة د الفواكه ولا الحبوب. كل لصيقة فيها سمية الزيت والعبوة والمغرب. الدار كتهضر على المعصرة والزجاج، ماشي على درجة رسمية.",
    ),
    domain: c("Huiles naturelles", "زيوت طبيعية", "زيوت طبيعية"),
    category: "huiles",
    cover: "/images/cover-tifawt.jpg",
    story: c(
      "Tifawt évoque la lumière sur les oliviers. La maison aligne le fruit, la graine, puis l'huile claire dans le verre.",
      "تيفاوت تعني الضوء على أشجار الزيتون. البيت يصفّ الثمرة ثم الحبة ثم الزيت الصافي في الزجاج.",
      "تيفاوت كتعني الضو على الزيتون. الدار كتصفّ الثمرة ومن بعد الحبة ومن بعد الزيت الصافي فالزجاج.",
    ),
    inspiration: c(
      "L'olive, l'argan, la nigelle, la figue de barbarie, le sésame et l'amande, tels que les récits de RAWI les nomment.",
      "الزيتون والأركان وحبة البركة والتين الشوكي والسمسم واللوز، كما تسميها روايات راوي.",
      "الزيتون والأركان وحبة البركة والهندية والسمسم واللوز، كيف كتسمّيهم روايات راوي.",
    ),
    craft: c(
      "Presser, laisser reposer, mettre en verre. La page ne donne ni température ni rendement.",
      "يُعصر، يُترك ليرتاح، ثم يُعبأ في الزجاج. الصفحة لا تعطي حرارة ولا مردوداً.",
      "كيتعصر، كيرتاح، ومن بعد كيتصب فالزجاج. الصفحة ما كتعطيش سخونية ولا مردود.",
    ),
    values: c(
      "Un fruit par flacon. Le format écrit sur l'étiquette. Le verre plutôt qu'un contenant sans nom.",
      "ثمرة لكل قارورة. العبوة مكتوبة على اللصيقة. الزجاج بدل وعاء بلا اسم.",
      "ثمرة لكل قارورة. العبوة مكتوبة على اللصيقة. الزجاج بدل وعاء بلا سمية.",
    ),
    heritage: c(
      "Les huiles reviennent dans les récits de la table et de la peau. RAWI les garde comme des gestes racontés, pas comme une ordonnance.",
      "تعود الزيوت في روايات المائدة والبشرة. راوي يحفظها حركات مروية، لا وصفة.",
      "الزيوت كيرجعو فروايات الطابلة والبشرة. راوي كيحتفظ بيهم حركات مرويين، ماشي وصفة.",
    ),
    ritual: "huiles",
    products: [
      item("tifawt", {
        id: "tifawt-olive",
        slug: "huile-olive",
        name: c("Huile d'olive extra vierge", "زيت الزيتون البكر", "زيت الزيتون البكر"),
        shortDescription: c("Huile d'olive claire, pour la table et la peau.", "زيت زيتون صافٍ، للمائدة والبشرة.", "زيت زيتون صافي، للطابلة والبشرة."),
        description: c("Le premier flacon de la maison. Les olives sont pressées, l'huile repose, puis elle entre dans le verre de 500 ml.", "القارورة الأولى للبيت. يُعصر الزيتون، يرتاح الزيت، ثم يدخل زجاج 500 مل.", "القارورة اللولة للدار. الزيتون كيتعصر، الزيت كيرتاح، ومن بعد كيدخل لزجاج 500 مل."),
        ingredients: c("Olives pressées.", "زيتون معصور.", "زيتون معصور."),
        format: c("500 ml", "500 مل", "500 مل"),
        price: 85,
        shape: "bottle",
        label: c("Huile d'olive issue du pressoir, mise en verre.", "زيت زيتون من المعصرة، في الزجاج.", "زيت الزيتون من المعصرة، فالزجاج."),
        usage: c("À table, ou quelques gouttes sur la peau après l'eau.", "على المائدة، أو قطرات على البشرة بعد الماء.", "فالطابلة، ولا قطرات على البشرة من بعد الماء."),
        heritage: c("Dans les récits, l'olive ouvre souvent le repas et ferme le lavage du visage.", "في الروايات، الزيتون غالباً يفتح الأكل ويختم غسل الوجه.", "فروايات، الزيتون غالباً كيحال الماكلة وكسد غسل الوجه."),
        ritual: "huiles",
      }),
      item("tifawt", {
        id: "tifawt-argan",
        slug: "huile-argan",
        name: c("Huile d'argan", "زيت الأركان", "زيت الأركان"),
        shortDescription: c("Amande d'argan pressée, flacon de verre.", "لوز الأركان معصور، قارورة زجاج.", "لوز الأركان معصور، قارورة د الزجاج."),
        description: c("L'argan est le flacon du Souss dans cette maison. L'étiquette dit le fruit et le format, sans grade affiché.", "الأركان قارورة سوس في هذا البيت. اللصيقة تقول الثمرة والعبوة، بلا درجة معروضة.", "الأركان قارورة سوس فهاد الدار. اللصيقة كتقول الثمرة والعبوة، بلا درجة معروضة."),
        ingredients: c("Amandes d'argan pressées.", "لوز أركان معصور.", "لوز أركان معصور."),
        format: c("100 ml", "100 مل", "100 مل"),
        price: 150,
        shape: "vial",
        label: c("Argan pressé, réservé à ce flacon.", "أركان معصور، لهذه القارورة.", "أركان معصور، لهاد القارورة."),
        usage: c("Quelques gouttes au creux de la main, pour le visage ou les pointes.", "قطرات في راحة اليد، للوجه أو الأطراف.", "قطرات فكف اليد، للوجه ولا الطرف."),
        heritage: c("Les récits du thème Huiles nomment l'argan sans le mélanger aux autres graines.", "روايات محور الزيوت تسمي الأركان بلا خلطه بحبوب أخرى.", "روايات محور الزيوت كتسمّي الأركان بلا ما تخلطو مع حبوب خرين."),
        ritual: "huiles",
      }),
      item("tifawt", {
        id: "tifawt-nigelle",
        slug: "huile-nigelle",
        name: c("Huile de nigelle", "زيت حبة البركة", "زيت حبة البركة"),
        shortDescription: c("Graine noire pressée, huile à part.", "حبة سوداء معصورة، زيت على حدة.", "حبة كحلة معصورة، زيت بوحدو."),
        description: c("La nigelle reste dans son flacon. La maison ne la verse pas dans l'olive ni dans l'argan.", "تبقى حبة البركة في قارورتها. البيت لا يصبّها في الزيتون ولا في الأركان.", "حبة البركة كتبقى فقارورتها. الدار ما كتصبهاش فالزيتون ولا فالأركان."),
        ingredients: c("Graines de nigelle pressées.", "حبوب حبة البركة معصورة.", "حبوب حبة البركة معصورة."),
        format: c("100 ml", "100 مل", "100 مل"),
        price: 95,
        shape: "vial",
        label: c("Nigelle seule, dans son verre.", "حبة البركة وحدها، في زجاجها.", "حبة البركة بوحدها، فزجاجها."),
        usage: c("Une touche sur la peau, loin des autres huiles du plateau.", "لمسة على البشرة، بعيداً عن زيوت الصينية الأخرى.", "لمسة على البشرة، بعيدة على زيوت الصينية الأخرى."),
        heritage: c("La graine noire est citée à part dans les récits, jamais comme un mélange déjà fait.", "تُذكر الحبة السوداء على حدة في الروايات، لا كخليط جاهز.", "الحبة الكحلة كتذكر بوحدها فالروايات، ماشي خليط واجد."),
        ritual: "huiles",
      }),
      item("tifawt", {
        id: "tifawt-figue",
        slug: "huile-figue",
        name: c("Huile de figue de barbarie", "زيت التين الشوكي", "زيت الهندية"),
        shortDescription: c("Pépins de figue de barbarie, petit flacon.", "بذور التين الشوكي، قارورة صغيرة.", "زرريعة الهندية، قارورة صغيرة."),
        description: c("Le flacon est le plus petit de la maison. Il ne contient que les pépins de la figue de barbarie.", "القارورة أصغر ما في البيت. لا تحتوي إلا بذور التين الشوكي.", "القارورة أصغر حاجة فالدار. ما فيها غير زرريعة الهندية."),
        ingredients: c("Pépins de figue de barbarie.", "بذور التين الشوكي.", "زرريعة الهندية."),
        format: c("30 ml", "30 مل", "30 مل"),
        price: 320,
        shape: "vial",
        label: c("Petit flacon de pépins de figue.", "قارورة صغيرة لبذور التين.", "قارورة صغيرة لزرريعة الهندية."),
        usage: c("Peu de gouttes, le matin, sur le visage sec.", "قطرات قليلة صباحاً على وجه جاف.", "قطرات قلال فالصباح على وجه ناشف."),
        heritage: c("La figue de barbarie apparaît dans les récits comme un fruit du bord de champ, pas comme un sérum déjà nommé.", "يظهر التين الشوكي في الروايات ثمر طرف الحقل، لا سيروماً جاهز الاسم.", "الهندية كتبان فالروايات ثمرة طرف الحقل، ماشي سيروم سميتو واجدة."),
        ritual: "huiles",
      }),
      item("tifawt", {
        id: "tifawt-sesame",
        slug: "huile-sesame",
        name: c("Huile de sésame", "زيت السمسم", "زيت السمسم"),
        shortDescription: c("Graines de sésame pressées, bouteille de table.", "حبوب سمسم معصورة، قارورة المائدة.", "حبوب السمسم معصورة، قارورة الطابلة."),
        description: c("Le sésame a la bouteille large. On le reconnaît à la graine, pas à une médaille sur le verre.", "للسمسم القارورة العريضة. يُعرف من الحبة، لا من وسام على الزجاج.", "السمسم قارورة عريضة. كيعرف من الحبة، ماشي من وسام على الزجاج."),
        ingredients: c("Graines de sésame pressées.", "حبوب سمسم معصورة.", "حبوب السمسم معصورة."),
        format: c("250 ml", "250 مل", "250 مل"),
        price: 65,
        shape: "bottle",
        label: c("Sésame pressé, bouteille de 250 ml.", "سمسم معصور، قارورة 250 مل.", "سمسم معصور، قارورة 250 مل."),
        usage: c("À la cuisine, ou en touche légère sur les longueurs de cheveux.", "في الطبخ، أو لمسة خفيفة على طول الشعر.", "فالطبخ، ولا لمسة خفيفة على طول الشعر."),
        heritage: c("Le sésame est une graine de garde-manger dans les fiches Huiles.", "السمسم حبة خزانة في بطاقات الزيوت.", "السمسم حبة الخزانة فبطاقات الزيوت."),
        ritual: "huiles",
      }),
      item("tifawt", {
        id: "tifawt-amande",
        slug: "huile-amande",
        name: c("Huile d'amande douce", "زيت اللوز الحلو", "زيت اللوز الحلو"),
        shortDescription: c("Amande douce pressée, flacon doux au toucher.", "لوز حلو معصور، قارورة ناعمة الملمس.", "لوز حلو معصور، قارورة ناعمة فاللمس."),
        description: c("L'amande ferme la rangée des huiles. Elle ne remplace ni l'argan ni l'olive.", "اللوز يختم صف الزيوت. لا يعوّض الأركان ولا الزيتون.", "اللوز كيسد صف الزيوت. ما كيعوّضش الأركان ولا الزيتون."),
        ingredients: c("Amandes douces pressées.", "لوز حلو معصور.", "لوز حلو معصور."),
        format: c("100 ml", "100 مل", "100 مل"),
        price: 75,
        shape: "vial",
        label: c("Amande douce, un flacon à elle.", "لوز حلو، قارورة له وحده.", "لوز حلو، قارورة ليه بوحدو."),
        usage: c("Sur la peau sèche, après le bain, sans le mélanger au savon.", "على بشرة جافة بعد الحمّام، بلا خلطه بالصابون.", "على بشرة ناشفة من بعد الحمّام، بلا ما يتخلط بالصابون."),
        heritage: c("L'amande est nommée dans les soins du corps quand la voix veut une huile douce.", "يُذكر اللوز في عناية الجسم حين يريد الصوت زيتاً ناعماً.", "اللوز كيتذكر فعناية الجسم ملي الصوت بغا زيت ناعم."),
        ritual: "corps",
      }),
    ],
  },
  {
    id: "zayna",
    slug: "zaynabio",
    name: "ZaynaBio",
    slogan: c(
      "La beauté inspirée par la nature marocaine.",
      "جمال مستوحى من طبيعة المغرب.",
      "جمال مستوحى من طبيعة المغرب.",
    ),
    description: c(
      "ZaynaBio réunit des soins du visage, des cheveux et du corps autour de l'argan, de la rose et de la figue de barbarie.",
      "زينابيو تجمع عناية الوجه والشعر والجسم حول الأركان والورد والتين الشوكي.",
      "زينابيو كتجمع عناية الوجه والشعر والجسم حول الأركان والورد والهندية.",
    ),
    longDescription: c(
      "Pots, savon, sérum et eau de rose. Chaque emballage porte la marque, le soin et le format. La maison décrit le geste, elle ne promet pas une peau nouvelle.",
      "أوعية وصابون وسيروم وماء ورد. كل غلاف يحمل العلامة والعناية والعبوة. البيت يصف الحركة ولا يعد ببشرة جديدة.",
      "أوعية وصابون وسيروم وما ورد. كل غلاف فيه العلامة والعناية والعبوة. الدار كاتوصف الحركة وما كتعدّش ببشرة جديدة.",
    ),
    domain: c("Cosmétiques naturels", "مستحضرات طبيعية", "مستحضرات طبيعية"),
    category: "cosmetiques",
    cover: "/images/cover-zayna.jpg",
    story: c(
      "ZaynaBio vient des plateaux de hammam : le savon, l'eau de rose, puis la crème. Le nom garde la rose et l'argan côte à côte.",
      "زينابيو تأتي من أطباق الحمّام: الصابون ثم ماء الورد ثم الكريم. الاسم يُبقي الورد والأركان جنباً إلى جنب.",
      "زينابيو جاية من طباسيل الحمّام: الصابون ومن بعد ما الورد ومن بعد الكريم. السمية كتخلي الورد والأركان حدا بعضياتهم.",
    ),
    inspiration: c(
      "Les rituels racontés pour le visage, les cheveux et le corps, sans en faire une ordonnance.",
      "طقوس تُروى للوجه والشعر والجسم، بلا أن تصير وصفة.",
      "طقوس مرويين للوجه والشعر والجسم، بلا ما يوليوا وصفة.",
    ),
    craft: c(
      "Savonner, fouetter une crème, laisser le sérum dans son petit verre. Aucun pourcentage n'est inscrit ici.",
      "يُصنع الصابون، تُخفق كريمة، ويبقى السيروم في زجاجه الصغير. لا نسبة مكتوبة هنا.",
      "كيتصنع الصابون، كتتخفق الكريمة، والسيروم كيبقا فزجاجو الصغير. حتى نسبة ما مكتوبة هنا.",
    ),
    values: c(
      "Un soin par pot. La rose reste la rose. L'argan reste l'argan.",
      "عناية لكل وعاء. الورد يبقى ورداً. الأركان يبقى أركاناً.",
      "عناية لكل وعاء. الورد كيبقا ورد. الأركان كيبقا أركان.",
    ),
    heritage: c(
      "Le hammam, le visage et les cheveux ont déjà leurs récits dans RAWI. Cette maison les montre en pots, elle ne les remplace pas.",
      "للحمّام والوجه والشعر روايات في راوي. هذا البيت يعرضها في أوعية ولا يحلّ محلها.",
      "الحمّام والوجه والشعر عندهم روايات فراوي. هاد الدار كتورّيهم فأوعية وما كتعوّضهمش.",
    ),
    ritual: "visage",
    products: [
      item("zayna", {
        id: "zayna-savon",
        slug: "savon-argan-rose",
        name: c("Savon à l'argan et à la rose", "صابون الأركان والورد", "صابون الأركان والورد"),
        shortDescription: c("Pain de savon, argan et rose côte à côte.", "قطعة صابون، الأركان والورد جنباً إلى جنب.", "قطعة صابون، الأركان والورد حدا بعضياتهم."),
        description: c("Le savon ouvre la maison. L'argan et la rose sont nommés ensemble sur la bande, sans autre fleur.", "الصابون يفتح البيت. الأركان والورد مسمّيان معاً على الشريط، بلا زهرة أخرى.", "الصابون كيحال الدار. الأركان والورد مسمّيين بجوج على الشريط، بلا وردة أخرى."),
        ingredients: c("Savon, huile d'argan, eau de rose.", "صابون، زيت أركان، ماء ورد.", "صابون، زيت أركان، ما ورد."),
        format: c("100 g", "100 غ", "100 غ"),
        price: 25,
        shape: "soap",
        label: c("Savon à l'argan et à la rose.", "صابون الأركان والورد.", "صابون الأركان والورد."),
        usage: c("Sur peau mouillée, puis l'eau. Il ne reste pas sur le visage.", "على بشرة مبللة ثم الماء. لا يبقى على الوجه.", "على بشرة مبللة ومن بعد الماء. ما كيبقاش على الوجه."),
        heritage: c("Le savon avant le soin est un geste répété dans les récits du hammam.", "الصابون قبل العناية حركة تتكرر في روايات الحمّام.", "الصابون قبل العناية حركة كتعاود فروايات الحمّام."),
        ritual: "hammam",
      }),
      item("zayna", {
        id: "zayna-creme",
        slug: "creme-argan",
        name: c("Crème hydratante à l'argan", "كريم الأركان", "كريم الأركان"),
        shortDescription: c("Soin quotidien à base d'huile d'argan.", "عناية يومية بزيت الأركان.", "عناية يومية بزيت الأركان."),
        description: c("Le pot tient dans la main. La crème est l'argan passé au soin du matin, après l'eau et avant le linge.", "الوعاء في راحة اليد. الكريم هو الأركان في عناية الصباح، بعد الماء وقبل القماش.", "الوعاء فكف اليد. الكريم هو الأركان فعناية الصباح، من بعد الماء وقبل التوب."),
        ingredients: c("Huile d'argan, cire, eau de rose.", "زيت أركان، شمع، ماء ورد.", "زيت أركان، شمع، ما ورد."),
        format: c("50 ml", "50 مل", "50 مل"),
        price: 75,
        shape: "jar",
        label: c("Soin quotidien à base d'huile d'argan.", "عناية يومية بزيت الأركان.", "عناية يومية بزيت الأركان."),
        usage: c("Une noisette sur le visage, le matin, quand la peau est encore tiède.", "مقدار بندقة على الوجه صباحاً والبشرة دافئة.", "قد بندقة على الوجه فالصباح والبشرة دافية."),
        heritage: c("Les fiches Visage gardent l'argan comme une huile nommée, pas comme une crème déjà potée. Ici, la maison a choisi le pot.", "بطاقات الوجه تحفظ الأركان زيتاً مسمّى لا كريماً في وعاء. هنا اختار البيت الوعاء.", "بطاقات الوجه كيحتفظو بالأركان زيت مسمّى ماشي كريم فوعاء. هنا الدار اختارات الوعاء."),
        ritual: "visage",
      }),
      item("zayna", {
        id: "zayna-serum",
        slug: "serum-figue",
        name: c("Sérum à la figue de barbarie", "سيروم التين الشوكي", "سيروم الهندية"),
        shortDescription: c("Petit verre de pépins de figue de barbarie.", "زجاج صغير لبذور التين الشوكي.", "زجاج صغير لزرريعة الهندية."),
        description: c("Le sérum est le flacon le plus fin. Il ne contient que la figue de barbarie nommée sur l'étiquette.", "السيروم أدق قارورة. لا يحتوي إلا التين الشوكي المكتوب على اللصيقة.", "السيروم أدق قارورة. ما فيه غير الهندية المكتوبة على اللصيقة."),
        ingredients: c("Huile de pépins de figue de barbarie.", "زيت بذور التين الشوكي.", "زيت زرريعة الهندية."),
        format: c("30 ml", "30 مل", "30 مل"),
        price: 180,
        shape: "vial",
        label: c("Figue de barbarie, petit flacon du matin.", "تين شوكي، قارورة الصباح الصغيرة.", "هندية، قارورة الصباح الصغيرة."),
        usage: c("Quelques gouttes sur le visage, avant la crème.", "قطرات على الوجه قبل الكريم.", "قطرات على الوجه قبل الكريم."),
        heritage: c("La figue de barbarie est un fruit de haie dans les récits. La maison l'a mise seule dans ce verre.", "التين الشوكي ثمر السياج في الروايات. البيت وضعه وحده في هذا الزجاج.", "الهندية ثمرة السياج فالروايات. الدار حطّاتها بوحدها فهاد الزجاج."),
        ritual: "visage",
      }),
      item("zayna", {
        id: "zayna-masque",
        slug: "masque-ricin",
        name: c("Masque capillaire à l'huile de ricin", "قناع الخروع للشعر", "قناع الخروع للشعر"),
        shortDescription: c("Soin des longueurs, avant le rinçage.", "عناية بالأطراف، قبل الشطف.", "عناية بالطرف، قبل الشطف."),
        description: c("Le pot des cheveux. L'huile de ricin est nommée pour les longueurs, puis l'eau l'emporte.", "وعاء الشعر. زيت الخروع مسمّى للأطراف، ثم يأخذه الماء.", "وعاء الشعر. زيت الخروع مسمّى للطرف، ومن بعد كيوديّو الماء."),
        ingredients: c("Huile de ricin, cire, eau.", "زيت الخروع، شمع، ماء.", "زيت الخروع، شمع، ماء."),
        format: c("200 ml", "200 مل", "200 مل"),
        price: 60,
        shape: "jar",
        label: c("Ricin pour les longueurs, puis l'eau.", "خروع للأطراف، ثم الماء.", "خروع للطرف، ومن بعد الماء."),
        usage: c("Sur les longueurs, un moment, puis un rinçage. Pas sur le cuir sans eau ensuite.", "على الأطراف لحظة ثم الشطف. لا على الفروة بلا ماء بعده.", "على الطرف لحظة ومن بعد الشطف. ماشي على الفروة بلا ماء من بعد."),
        heritage: c("Les récits Cheveux séparent souvent l'huile des longueurs et l'eau qui suit.", "روايات الشعر غالباً تفصل زيت الأطراف عن الماء الذي يليه.", "روايات الشعر غالباً كيفرقو زيت الطرف على الماء اللي من بعد."),
        ritual: "cheveux",
      }),
      item("zayna", {
        id: "zayna-rose",
        slug: "eau-rose",
        name: c("Eau de rose de Damas", "ماء ورد دمشق", "ما ورد دمشق"),
        shortDescription: c("Eau de rose, flacon clair.", "ماء ورد، قارورة صافية.", "ما ورد، قارورة صافية."),
        description: c("Le flacon de rose se reconnaît à la fleur écrite, pas à un autre parfum ajouté.", "قارورة الورد تُعرف من الزهرة المكتوبة، لا من عطر آخر مضاف.", "قارورة الورد كتعرف من الوردة المكتوبة، ماشي من عطر آخر زايد."),
        ingredients: c("Eau de rose.", "ماء الورد.", "ما الورد."),
        format: c("100 ml", "100 مل", "100 مل"),
        price: 35,
        shape: "bottle",
        label: c("Eau de rose, rien d'autre dans le flacon.", "ماء ورد، لا شيء غيره في القارورة.", "ما ورد، حتى حاجة أخرى فالقارورة."),
        usage: c("Sur un coton ou au creux des mains, après le savon.", "على قطن أو في راحة اليدين بعد الصابون.", "على قطن ولا فكف اليدين من بعد الصابون."),
        heritage: c("La rose a son thème dans RAWI. Cette eau en est le flacon, pas la fiche.", "للورد محوره في راوي. هذا الماء قارورته، لا بطاقته.", "الورد عندو محور فراوي. هاد الماء قارورتو، ماشي بطاقتو."),
        ritual: "parfums",
      }),
      item("zayna", {
        id: "zayna-karite",
        slug: "beurre-karite",
        name: c("Beurre de karité", "زبدة الشيا", "زبدة الشيا"),
        shortDescription: c("Beurre épais, pour la peau sèche.", "زبدة كثيفة للبشرة الجافة.", "زبدة تقيلة للبشرة الناشفة."),
        description: c("Le karité est le pot le plus dense. Il se prend du bout des doigts, il ne se verse pas.", "الشيا أكثف وعاء. يُؤخذ بأطراف الأصابع ولا يُصب.", "الشيا أكثف وعاء. كيتاخد بطراف الصباع وما كيتصبش."),
        ingredients: c("Beurre de karité.", "زبدة الشيا.", "زبدة الشيا."),
        format: c("100 g", "100 غ", "100 غ"),
        price: 55,
        shape: "jar",
        label: c("Karité seul, pot de 100 g.", "شيا وحدها، وعاء 100 غ.", "شيا بوحدها، وعاء 100 غ."),
        usage: c("Sur les coudes, les talons ou une joue sèche, sans le chauffer.", "على المرفقين أو الكعبين أو خد جاف، بلا تسخين.", "على المرافق ولا العقبين ولا خد ناشف، بلا سخونية."),
        heritage: c("Le karité arrive dans les récits comme un beurre venu d'ailleurs, montré puis souvent reposé.", "تأتي الشيا في الروايات زبدة من مكان آخر، تُعرض ثم غالباً تُعاد.", "الشيا كتجي فالروايات زبدة من بلاصة أخرى، كتورّى ومن بعد غالباً كترجع."),
        ritual: "corps",
      }),
    ],
  },
  {
    id: "atlas",
    slug: "atlas-herba",
    name: "AtlasHerba",
    slogan: c(
      "Les trésors botaniques de nos montagnes.",
      "كنوز نباتية من جبالنا.",
      "كنوز نباتية من جبالنا.",
    ),
    description: c(
      "AtlasHerba réunit des plantes séchées, une infusion et une huile de lavande, dans l'esprit des récits botaniques.",
      "أطلس هربا تجمع نباتات مجففة ومنقوعاً وزيت خزامى، بروح الروايات النباتية.",
      "أطلس هربا كتجمع نباتات مجففين ومنقوع وزيت الخزامى، بروح الروايات النباتية.",
    ),
    longDescription: c(
      "Sachets, boîte et petit flacon. Chaque plante garde son nom. Le mélange du soir est le seul où plusieurs feuilles se rencontrent, et l'étiquette le dit.",
      "أكياس وعلبة وقارورة صغيرة. كل نبتة تحتفظ باسمها. مزيج المساء هو الوحيد الذي تلتقي فيه أوراق، واللصيقة تقول ذلك.",
      "أكياس وعلبة وقارورة صغيرة. كل عشبة كتحافظ على سميتها. خليط العشية هو الوحيد اللي كيتلاقاو فيه الورق، واللصيقة كتقول ذلك.",
    ),
    domain: c("Plantes et infusions", "نباتات ومنقوعات", "نباتات ومنقوعات"),
    category: "plantes",
    cover: "/images/cover-atlas.jpg",
    story: c(
      "AtlasHerba vient du mortier et du linge où l'on fait sécher. La lavande, la menthe, la camomille et le romarin restent des plantes avant d'être des sachets.",
      "أطلس هربا تأتي من المهراس والقماش الذي يُجفف عليه. الخزامى والنعناع والبابونج وإكليل الجبل تبقى نباتات قبل أن تصير أكياساً.",
      "أطلس هربا جاية من المهراس والتوب اللي كينشفو عليه. الخزامى والنعناع والبابونج واليازير كيبقاو عشوب قبل ما يوليوا أكياس.",
    ),
    inspiration: c(
      "Les plantes nommées dans les récits de la maison, séchées pour la tasse ou pour le linge.",
      "نباتات مسمّاة في روايات البيت، مجففة للفنجان أو للقماش.",
      "عشوب مسمّيين فروايات الدار، مجففين للفنجان ولا للتوب."),
    craft: c(
      "Couper, sécher à l'ombre, mettre en sachet. Le flacon de lavande reste à part du sachet de fleurs.",
      "يُقطع، يُجفف في الظل، ويُوضع في كيس. قارورة الخزامى تبقى بمعزل عن كيس الزهر.",
      "كيتقطع، كينشف فالظل، وكيتحط فالكيس. قارورة الخزامى كتبقى بوحدها على كيس الزهر.",
    ),
    values: c(
      "Une plante par sachet, sauf le mélange qui dit son nom. Pas de feuille sans étiquette.",
      "نبتة لكل كيس، إلا المزيج الذي يقول اسمه. لا ورقة بلا لصيقة.",
      "عشبة لكل كيس، إلا الخليط اللي كيقول سميتو. حتى ورقة بلا لصيقة.",
    ),
    heritage: c(
      "Le thème Plantes de RAWI raconte ces feuilles une à une. La maison les met en sachet sans récrire le récit.",
      "محور النباتات في راوي يروي هذه الأوراق واحدة واحدة. البيت يضعها في أكياس بلا إعادة كتابة الرواية.",
      "محور النباتات فراوي كيروي هاد الورق واحدة واحدة. الدار كتحطهم فأكياس بلا ما تعاود تكتب الرواية.",
    ),
    ritual: "plantes",
    products: [
      item("atlas", {
        id: "atlas-lavande",
        slug: "lavande",
        name: c("Fleurs de lavande séchées", "زهور الخزامى المجففة", "زهر الخزامى مجفف"),
        shortDescription: c("Fleurs sèches, pour le linge et la tasse.", "زهور يابسة للقماش والفنجان.", "زهر يابس للتوب والفنجان."),
        description: c("Le sachet de lavande sent la fleur sèche. Il n'est pas le flacon d'huile.", "كيس الخزامى تفوح منه الزهرة اليابسة. ليس قارورة الزيت.", "كيس الخزامى كتفوح منو الزهرة اليابسة. ماشي قارورة الزيت."),
        ingredients: c("Fleurs de lavande séchées.", "زهور خزامى مجففة.", "زهر الخزامى مجفف."),
        format: c("50 g", "50 غ", "50 غ"),
        price: 28,
        shape: "pouch",
        label: c("Lavande séchée, sachet de fleurs.", "خزامى مجففة، كيس زهور.", "خزامى مجففة، كيس الزهر."),
        usage: c("Dans le linge, ou une pincée dans l'eau chaude.", "في القماش، أو رشة في ماء ساخن.", "فالتوب، ولا رشة فماء سخون."),
        heritage: c("La lavande est une plante de bord de champ dans les récits botaniques.", "الخزامى نبتة طرف الحقل في الروايات النباتية.", "الخزامى عشبة طرف الحقل فالروايات النباتية."),
        ritual: "plantes",
      }),
      item("atlas", {
        id: "atlas-menthe",
        slug: "menthe",
        name: c("Feuilles de menthe séchées", "أوراق النعناع المجففة", "ورق النعناع مجفف"),
        shortDescription: c("Menthe séchée pour la tasse.", "نعناع مجفف للفنجان.", "نعناع مجفف للفنجان."),
        description: c("Les feuilles restent des feuilles. Le sachet ne les moud pas et ne les mélange pas à la lavande.", "تبقى الأوراق أوراقاً. الكيس لا يطحنها ولا يخلطها بالخزامى.", "الورق كيبقا ورق. الكيس ما كيطحنوش وما كيخلطوش بالخزامى."),
        ingredients: c("Feuilles de menthe séchées.", "أوراق نعناع مجففة.", "ورق النعناع مجفف."),
        format: c("50 g", "50 غ", "50 غ"),
        price: 18,
        shape: "pouch",
        label: c("Menthe séchée, pour la tasse.", "نعناع مجفف، للفنجان.", "نعناع مجفف، للفنجان."),
        usage: c("Quelques feuilles dans l'eau chaude, puis on les retire.", "أوراق قليلة في ماء ساخن ثم تُرفع.", "ورق قليل فماء سخون ومن بعد كيتنحّى."),
        heritage: c("La menthe est la plante de la théière dans presque chaque maison racontée.", "النعناع نبتة البراد في أغلب البيوت المروية.", "النعناع عشبة البراد فأغلب الديار المرويين."),
        ritual: "plantes",
      }),
      item("atlas", {
        id: "atlas-camomille",
        slug: "camomille",
        name: c("Fleurs de camomille", "زهور البابونج", "زهر البابونج"),
        shortDescription: c("Petites fleurs sèches, sachet à part.", "زهور صغيرة يابسة، كيس على حدة.", "زهر صغير يابس، كيس بوحدو."),
        description: c("La camomille a son sachet. Elle n'entre dans le mélange du soir que si l'autre boîte le dit.", "للبابونج كيسة. لا يدخل مزيج المساء إلا إذا قالت العلبة الأخرى ذلك.", "البابونج عندو كيس. ما كيدخلش لخليط العشية إلا إلا قالت العلبة الأخرى ذلك."),
        ingredients: c("Fleurs de camomille séchées.", "زهور بابونج مجففة.", "زهر البابونج مجفف."),
        format: c("50 g", "50 غ", "50 غ"),
        price: 25,
        shape: "pouch",
        label: c("Camomille séchée, fleurs seules.", "بابونج مجفف، زهور وحدها.", "بابونج مجفف، الزهر بوحدو."),
        usage: c("Une pincée dans l'eau chaude, à l'heure du soir.", "رشة في ماء ساخن وقت المساء.", "رشة فماء سخون وقت العشية."),
        heritage: c("La camomille est citée quand la voix veut une fleur claire, pas une résine.", "يُذكر البابونج حين يريد الصوت زهرة فاتحة لا صمغاً.", "البابونج كيتذكر ملي الصوت بغا زهرة فاتحة ماشي صمغ."),
        ritual: "plantes",
      }),
      item("atlas", {
        id: "atlas-romarin",
        slug: "romarin",
        name: c("Romarin séché", "إكليل الجبل المجفف", "أزيري مجفف"),
        shortDescription: c("Aiguilles sèches, pour la cuisine et le linge.", "إبر يابسة للطبخ والقماش.", "إبر يابسين للطبخ والتوب."),
        description: c("Le romarin reste une herbe de cuisine dans ce sachet. Il ne devient pas une huile.", "يبقى إكليل الجبل عشبة طبخ في هذا الكيس. لا يصير زيتاً.", "الأزيري كيبقا عشبة الطبخ فهاد الكيس. ما كيوليش زيت."),
        ingredients: c("Feuilles de romarin séchées.", "أوراق إكليل الجبل مجففة.", "ورق الأزيري مجفف."),
        format: c("50 g", "50 غ", "50 غ"),
        price: 20,
        shape: "pouch",
        label: c("Romarin séché, herbe de cuisine.", "إكليل مجفف، عشبة طبخ.", "أزيري مجفف، عشبة الطبخ."),
        usage: c("Sur un plat, ou une branche dans le linge.", "على طبق، أو غصن في القماش.", "على طبق، ولا غصن فالتوب."),
        heritage: c("Le romarin borde les récits de cuisine plus que ceux du visage.", "إكليل الجبل يحاذي روايات الطبخ أكثر من روايات الوجه.", "الأزيري كيجي حدّا روايات الطبخ أكثر من روايات الوجه."),
        ritual: "plantes",
      }),
      item("atlas", {
        id: "atlas-infusion",
        slug: "infusion-detente",
        name: c("Infusion Détente & Sommeil", "منقوع الهدوء والنوم", "منقوع الهدوء والنعاس"),
        shortDescription: c("Mélange aromatique pour la tasse du soir.", "مزيج عطري لفنجان المساء.", "خليط عطري لفنجان العشية."),
        description: c("La boîte réunit lavande, camomille et menthe. Le nom parle du soir. La maison décrit la tasse, pas un effet.", "العلبة تجمع الخزامى والبابونج والنعناع. الاسم يتكلم عن المساء. البيت يصف الفنجان لا أثراً.", "العلبة كتجمع الخزامى والبابونج والنعناع. السمية كتهضر على العشية. الدار كاتوصف الفنجان ماشي أثر."),
        ingredients: c("Lavande, camomille, menthe.", "خزامى، بابونج، نعناع.", "خزامى، بابونج، نعناع."),
        format: c("20 sachets", "20 كيساً", "20 كيسة"),
        price: 45,
        shape: "box",
        label: c("Mélange du soir : lavande, camomille, menthe.", "مزيج المساء: خزامى وبابونج ونعناع.", "خليط العشية: خزامى وبابونج ونعناع."),
        usage: c("Un sachet dans une tasse d'eau chaude, le soir.", "كيس في فنجان ماء ساخن مساءً.", "كيسة ففنجان ماء سخون فالعشية."),
        heritage: c("Le mélange existe parce que les trois plantes sont déjà racontées chacune à part.", "المزيج موجود لأن النباتات الثلاث مروية كل واحدة على حدة.", "الخليط كاين حيت العشوب الثلاثة مرويين كل وحدة بوحدها."),
        ritual: "plantes",
      }),
      item("atlas", {
        id: "atlas-lavande-huile",
        slug: "huile-lavande",
        name: c("Huile essentielle de lavande", "زيت الخزامى العطري", "زيت الخزامى العطري"),
        shortDescription: c("Lavande en petit flacon, pour le linge.", "خزامى في قارورة صغيرة للقماش.", "خزامى فقارورة صغيرة للتوب."),
        description: c("Le flacon ne se boit pas. Il parfume un coin de linge. Les fleurs sèches restent dans l'autre sachet.", "القارورة لا تُشرب. تعطر طرف قماش. الزهور اليابسة تبقى في الكيس الآخر.", "القارورة ما كتتشربش. كتعطر طرف التوب. الزهر اليابس كيبقا فالكيس الآخر."),
        ingredients: c("Huile distillée de lavande.", "زيت خزامى مقطّر.", "زيت الخزامى مقطّر."),
        format: c("10 ml", "10 مل", "10 مل"),
        price: 65,
        shape: "vial",
        label: c("Lavande pour le linge, pas pour la tasse.", "خزامى للقماش، لا للفنجان.", "خزامى للتوب، ماشي للفنجان."),
        usage: c("Quelques gouttes sur un coin de linge. Le flacon ne va pas dans la tasse.", "قطرات على طرف قماش. القارورة لا تدخل الفنجان.", "قطرات على طرف التوب. القارورة ما كدخلش للفنجان."),
        heritage: c("Les récits séparent la fleur que l'on infuse et l'huile que l'on pose à côté.", "الروايات تفصل الزهرة التي تُنقع عن الزيت الذي يوضع جانباً.", "الروايات كيفرقو الزهرة اللي كتتنقع على الزيت اللي كيتحط حداها."),
        ritual: "plantes",
      }),
    ],
  },
];

export function terroirBySlug(slug: string) {
  return TERROIRS.find((brand) => brand.slug === slug);
}

export function productBySlug(brandSlug: string, productSlug: string) {
  const brand = terroirBySlug(brandSlug);
  const product = brand?.products.find((item) => item.slug === productSlug);
  if (!brand || !product) return undefined;
  return { brand, product };
}
