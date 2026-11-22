import { c, sheet, type Body } from "./sheet";

type Trio = [string, string, string];

const voice = c(
  "La voix de cette fiche est une gardienne de maison, figure fictive. Aucune personne réelle n'est nommée.",
  "صوت هذه البطاقة ربة بيت، شخصية وهمية. لا يُذكر أي شخص حقيقي.",
  "الصوت فهاد البطاقة مولات الدار، شخصية وهمية. حتى شخص حقيقي ما متسمّاش.",
);

function deep(args: {
  title: Trio;
  summary: Trio;
  origin: Trio;
  history: Trio;
  items: [Trio, Trio][];
  steps: Trio[];
  usage: Trio;
  caution: Trio;
  variants: Trio;
  duration: Trio;
}): Body {
  return sheet({
    title: c(...args.title),
    summary: c(...args.summary),
    origin: c(...args.origin),
    voice,
    history: c(...args.history),
    ingredients: args.items.map(([name, note]) => ({ name: c(...name), note: c(...note) })),
    steps: args.steps.map((step) => c(...step)),
    usage: c(...args.usage),
    caution: c(...args.caution),
    variants: c(...args.variants),
    duration: c(...args.duration),
  });
}

const bol = (detail: Trio): Trio => [
  `${detail[0]} Nommé dans le récit. Aucun poids n'est donné.`,
  `${detail[1]} مذكور في الرواية. لا وزن.`,
  `${detail[2]} مذكور فالرواية. حتى وزن.`,
];

export const COMPLEX: Record<string, Body[]> = {
  visage: [
    deep({
      title: ["Le bol de la mariée", "إناء العروس", "زلافة العروسة"],
      summary: [
        "Douze choses sur le plateau, ouvertes une à une : argile, eaux de fleur, miel, amande, safran, huiles et ce que la maison a déjà. Le récit ne pèse rien et ne promet rien à la peau.",
        "اثنتا عشرة مادة على الصينية، تُفتح واحدة واحدة: طين ومياه زهر وعسل ولوز وزعفران وزيوت وما يوجد في البيت. الرواية لا تزن شيئاً ولا تعد البشرة بشيء.",
        "تناش حاجة على الصينية، كتتحل وحدة بوحدة: طين وما الزهر وعسل ولوز وزعفران وزيوت واللي كاين فالدار. الرواية ما كتوزن حتى حاجة وما كتعّد البشرة بحتى حاجة.",
      ],
      origin: ["Repère éditorial : nuit de visite, maison, Maghreb", "علامة تحريرية: ليلة زيارة، بيت، المغرب الكبير", "علامة تحريرية: ليلة زيارة، دار، المغرب الكبير"],
      history: [
        "La gardienne fictive appelle ce bol « le bol de la mariée » parce que sa mère fictive le sortait les soirs de visite, pas parce qu'une cérémonie est documentée. Elle aligne les pots. D'abord les poudres : ghassoul et amande. Ensuite les liquides, dans l'ordre qu'elle dit à voix haute : eau, lait si la maison en a, eau de rose, fleur d'oranger, un filet de miel, un filet d'argan. Le jaune d'œuf n'entre que s'il reste un œuf du matin. Les fils de safran restent au-dessus, les pétales de rose et la camomille restent sur le plateau, ils ne passent pas dans la pâte. Elle étend le mélange en évitant les yeux et les lèvres, le laisse le temps d'une conversation, puis rince jusqu'à l'eau claire. Aucun pot n'a d'étiquette de poids.",
        "تسمّي الشخصية الوهمية هذا الإناء «إناء العروس» لأن أمّها الوهمية كانت تخرجه في أمسيات الزيارة، لا لأن حفلاً موثّقاً. تصفّ الأواني. أولاً المساحيق: الغاسول واللوز. ثم السوائل بالترتيب الذي تنطقه: ماء، حليب إن وُجد في البيت، ماء ورد، ماء زهر، خيط عسل، خيط أركان. صفار البيض لا يدخل إلا إذا بقيت بيضة من الصباح. خيوط الزعفران تبقى فوق، وبتلات الورد والبابونج تبقيان على الصينية ولا تدخلان العجينة. تمدّ الخليط بعيداً عن العينين والشفتين، تتركه مدة كلام، ثم تشطف حتى يصفو الماء. لا إناء يحمل وزنًا.",
        "الشخصية الوهمية كتسمي هاد الزلافة «زلافة العروسة» حيت أمها الوهمية كانت تخرجها فمسايات الزيارة، ماشي حيت كاين عرس موثّق. كترتب الأواني. اللول البودرة: الغاسول واللوز. ومن بعد السوائل بالترتيب اللي كتقولو: ماء، حليب إلا كان فالدار، ما ورد، ما الزهر، خيط عسل، خيط أركان. صفار البيضة ما كيدخلش غير إلا بقات بيضة من الصباح. خيوط الزعفران كيبقاو الفوق، وورد والبابونج كيبقاو على الصينية وما كيدخلوش للعجين. كتفرّد الخليط بعيد على العينين والشفايف، كتخليه مدة الهضرة، ومن بعد كتشطف حتى الماء يصفى. حتى إناء ما فيه وزن.",
      ],
      items: [
        [["Ghassoul", "غاسول", "غاسول"], bol(["Poudre de fond du bol.", "مسحوق أساس الإناء.", "بودرة أساس الزلافة."])],
        [["Poudre d'amande", "مسحوق اللوز", "بودرة اللوز"], bol(["Se mêle à l'argile avant les liquides.", "يُخلط بالطين قبل السوائل.", "كيتخلط مع الطين قبل السوائل."])],
        [["Eau", "ماء", "ماء"], bol(["Délaye. Le récit dit « jusqu'à tenir », sans verre mesureur.", "يذوّب. الرواية تقول «حتى يتماسك»، بلا كأس قياس.", "كيذوّب. الرواية كتقول «حتى يثبت»، بلا كاس ديال القياس."])],
        [["Lait", "حليب", "حليب"], bol(["Seulement s'il est déjà dans la maison.", "فقط إذا كان موجوداً في البيت.", "غير إلا كان ديجا فالدار."])],
        [["Eau de rose", "ماء الورد", "ما الورد"], bol(["Un passage du flacon, pas un volume.", "تمريرة من القارورة، لا حجم.", "دوزة من القارورة، ماشي حجم."])],
        [["Fleur d'oranger", "ماء الزهر", "ما الزهر"], bol(["Vient après la rose, dans le même bol.", "يأتي بعد الورد، في الإناء نفسه.", "كيجي من بعد الورد، فنفس الزلافة."])],
        [["Miel", "عسل", "عسل"], bol(["Un filet. Aucune cuillère n'est comptée.", "خيط. لا تُحسب ملعقة.", "خيط. حتى معلقة ما محسوبة."])],
        [["Huile d'argan", "زيت الأركان", "زيت الأركان"], bol(["Un filet après le miel.", "خيط بعد العسل.", "خيط من بعد العسل."])],
        [["Jaune d'œuf", "صفار البيض", "صفار البيضة"], bol(["Entre seulement s'il reste un œuf.", "يدخل فقط إذا بقيت بيضة.", "كيدخل غير إلا بقات بيضة."])],
        [["Safran", "زعفران", "زعفران"], bol(["Quelques fils posés sur le dessus.", "بضعة خيوط توضع فوق.", "شي خيوط كيتحطو الفوق."])],
        [["Pétales de rose", "بتلات الورد", "ورق الورد"], bol(["Restent sur le plateau. Ils ne vont pas dans la pâte.", "تبقى على الصينية. لا تدخل العجينة.", "كتبقى على الصينية. ما كدخلش للعجين."])],
        [["Camomille", "بابونج", "بابونج"], bol(["Fleurs sèches à côté du bol, non infusées.", "زهر جاف بجانب الإناء، بلا نقع.", "زهر ناشف حدى الزلافة، بلا نقيع."])],
      ],
      steps: [
        ["Les poudres d'abord : ghassoul et amande, à sec.", "المساحيق أولاً: غاسول ولوز، جافّين.", "البودرة اللول: غاسول ولوز، ناشفين."],
        ["L'eau, puis le lait s'il y en a, puis les deux eaux de fleur.", "الماء، ثم الحليب إن وُجد، ثم ماءا الزهر.", "الماء، ومن بعد الحليب إلا كان، ومن بعد جوج مايات الزهر."],
        ["Le miel et l'argan tombent en filet. Personne ne compte.", "يسقط العسل والأركان خيطاً. لا أحد يعد.", "العسل والأركان كيطّحو خيط. حتى واحد ما كيعد."],
        ["L'œuf, seulement s'il reste. Le safran reste au-dessus.", "البيض فقط إذا بقي. الزعفران يبقى فوق.", "البيضة غير إلا بقات. الزعفران كيبقا الفوق."],
        ["Rose et camomille ne quittent pas le plateau.", "الورد والبابونج لا يغادران الصينية.", "الورد والبابونج ما كيخرجوش من الصينية."],
        ["La pâte va sur le visage, loin des yeux et des lèvres.", "تمتد العجينة على الوجه، بعيداً عن العينين والشفتين.", "العجينة كتفرّد على الوجه، بعيد على العينين والشفايف."],
        ["Le rinçage continue jusqu'à l'eau claire.", "يستمر الشطف حتى يصفو الماء.", "الشطف كيكمل حتى الماء يصفى."],
      ],
      usage: [
        "Soir de visite, dans la salle d'eau. Le récit parle d'un bol plein et d'une odeur de fleurs. Il ne parle pas d'un effet.",
        "مساء زيارة، في بيت الماء. تتكلم الرواية عن إناء ممتلئ ورائحة زهر. لا تتكلم عن أثر.",
        "عشية زيارة، فبيت الماء. الرواية كتهضر على زلافة عامرة وريحة الزهر. ما كتهضرش على أثر.",
      ],
      caution: [
        "Ceci décrit un récit de démonstration. Ce n'est pas une formule à refaire. La voix écarte les yeux, ne fait pas boire le mélange, et ne présente ni l'œuf ni le lait comme un soin.",
        "هذا يصف رواية عرض. ليست تركيبة تُعاد. تبعد الصوت العينين، ولا تُشرب الخليط، ولا تقدّم البيض أو الحليب كعناية.",
        "هذا كيوصف رواية ديال العرض. ماشي تركيبة تعاود. الصوت كبعد العينين، وما كتشربش الخليط، وما كتقدمش البيضة ولا الحليب كعناية.",
      ],
      variants: [
        "Sans lait et sans œuf, le bol reste celui des poudres, des eaux de fleur, du miel et de l'argan. La voix le dit quand la maison n'a pas le reste.",
        "بلا حليب وبلا بيض، يبقى الإناء للمساحيق ومياه الزهر والعسل والأركان. تقول الصوت ذلك حين لا يملك البيت الباقي.",
        "بلا حليب وبلا بيضة، الزلافة كتبقى للبودرة وما الزهر والعسل والأركان. الصوت كتقول هادشي منين الدار ما عندهاش الباقي.",
      ],
      duration: [
        "Le temps d'une conversation, puis le rinçage. Aucune minute n'est dite.",
        "مدة كلام، ثم الشطف. لا تُذكر دقيقة.",
        "مدة الهضرة، ومن بعد الشطف. حتى دقيقة ما مذكورة.",
      ],
    }),
  ],
  cheveux: [
    deep({
      title: ["Pâte de sidr aux plantes", "عجينة السدر بالنباتات", "عجينة السدر بالنباتات"],
      summary: [
        "Sidr, henné, argile, fenugrec, romarin, trois huiles, nigelle et girofle. Une pâte pour les longueurs, racontée sans dose et sans promesse de pousse.",
        "سدر وحناء وطين وحلبة وإكليل وثلاثة زيوت وحبة البركة وقرنفل. عجينة للخصل، تُروى بلا مقدار وبلا وعد بالنمو.",
        "سدر وحنا وطين وحلبة وأزيري وثلاثة ديال الزيوت وحبة البركة وقرنفل. عجينة للخصل، مروية بلا مقدار وبلا وعد بالنمو.",
      ],
      origin: ["Repère éditorial : cour et terrasse, Maghreb", "علامة تحريرية: فناء وسطح، المغرب الكبير", "علامة تحريرية: وسط الدار والسطاح، المغرب الكبير"],
      history: [
        "La voix fictive pose un linge sur les épaules avant d'ouvrir les sacs. Elle pile le sec : feuilles de sidr, henné, ghassoul, fenugrec, romarin, nigelle, deux ou trois clous de girofle. Elle ajoute l'eau tiède jusqu'à ce que la pâte tienne sur la cuillère en bois, puis les huiles l'une après l'autre : olive, ricin, argan. L'eau de rose ne sert qu'à mouiller les mains à la fin. Elle étend la pâte sur les longueurs, pas sur le visage, et dit que le henné marque le linge. Elle ne dit pas que les cheveux poussent, ni combien de temps la pâte reste : « le temps de finir le thé ».",
        "تضع الشخصية الوهمية قماشاً على الكتفين قبل فتح الأكياس. تدق الجاف: أوراق السدر والحناء والغاسول والحلبة وإكليل الجبل وحبة البركة وقرنين أو ثلاثة من القرنفل. تضيف ماء فاتراً حتى تثبت العجينة على ملعقة الخشب، ثم الزيوت واحداً بعد الآخر: زيتون، خروع، أركان. ماء الورد فقط لتبليل اليدين في الآخر. تمد العجينة على الخصل لا على الوجه، وتقول إن الحناء تعلّم القماش. لا تقول إن الشعر ينمو، ولا كم تبقى العجينة: «مدة إنهاء الشاي».",
        "الشخصية الوهمية كتحط توب على الكتاف قبل ما تحل الأكياس. كتدق الناشف: ورق السدر والحنا والغاسول والحلبة والأزيري وحبة البركة وجوج ولا ثلاثة د القرنفل. كتزيد ماء فاتر حتى العجينة تثبت على معلقة الخشب، ومن بعد الزيوت واحد من بعد واحد: زيتون، خروع، أركان. ما الورد غير باش تبل اليدين فاللخر. كتفرّد العجينة على الخصل ماشي على الوجه، وكتقول الحنا كيعلّم التوب. ما كتقولش الشعر كينبت، ولا شحال كتبقى العجينة: «مدة تسالية الأتاي».",
      ],
      items: [
        [["Sidr", "سدر", "سدر"], bol(["Feuilles sèches pilées avec le reste.", "أوراق جافة تُدق مع الباقي.", "ورق ناشف متدّق مع الباقي."])],
        [["Henné", "حناء", "حنا"], bol(["La voix prévient : il marque le linge.", "تنبّه الصوت: يعلّم القماش.", "الصوت كتنبّه: كيعلّم التوب."])],
        [["Ghassoul", "غاسول", "غاسول"], bol(["Entré dans le pilon, pas à part.", "يدخل المهراس، لا على حدة.", "كيدخل للمهراز، ماشي بوحدو."])],
        [["Fenugrec", "حلبة", "حلبة"], bol(["Graines dans le même tas sec.", "حبوب في الكومة الجافة نفسها.", "حبوب فنفس الكومة الناشفة."])],
        [["Romarin", "إكليل الجبل", "أزيري"], bol(["Feuilles sèches, pilées.", "أوراق جافة، مدقوقة.", "ورق ناشف، مدقوق."])],
        [["Nigelle", "حبة البركة", "حبة البركة"], bol(["Graines écrasées avec les feuilles.", "حبوب تُسحق مع الأوراق.", "حبوب كيتسحّنو مع الورق."])],
        [["Clou de girofle", "قرنفل", "قرنفل"], bol(["Deux ou trois clous, non comptés comme dose.", "قرنان أو ثلاثة، لا تُحسب جرعة.", "جوج ولا ثلاثة، ما محسوبينش كمقدار."])],
        [["Eau tiède", "ماء فاتر", "ماء فاتر"], bol(["Jusqu'à ce que la cuillère tienne la pâte.", "حتى تمسك الملعقة العجينة.", "حتى المعلقة تشد العجينة."])],
        [["Huile d'olive", "زيت الزيتون", "زيت الزيتون"], bol(["Première huile versée.", "أول زيت يُسكب.", "أول زيت كيتصب."])],
        [["Huile de ricin", "زيت الخروع", "زيت الخروع"], bol(["Deuxième huile. Aucun bienfait n'est affirmé.", "الزيت الثاني. لا يُذكر نفع.", "الزيت الثاني. حتى نفع ما مذكور."])],
        [["Huile d'argan", "زيت الأركان", "زيت الأركان"], bol(["Troisième huile, en filet.", "الزيت الثالث، خيطاً.", "الزيت الثالث، خيط."])],
        [["Eau de rose", "ماء الورد", "ما الورد"], bol(["Sur les mains à la fin, pas dans la pâte.", "على اليدين في الآخر، لا في العجينة.", "على اليدين فاللخر، ماشي فالعجين."])],
      ],
      steps: [
        ["Le linge protège les épaules avant les sacs.", "القماش يحمي الكتفين قبل الأكياس.", "التوب كيحمي الكتاف قبل الأكياس."],
        ["Tout le sec est pilé ensemble.", "يُدق كل الجاف معاً.", "كل الناشف كيتدق مجموعين."],
        ["L'eau tiède fait tenir la pâte à la cuillère.", "الماء الفاتر يجعل العجينة تثبت على الملعقة.", "الماء الفاتر كيخلي العجينة تثبت على المعلقة."],
        ["Olive, puis ricin, puis argan.", "زيتون، ثم خروع، ثم أركان.", "زيتون، ومن بعد خروع، ومن بعد أركان."],
        ["Les longueurs seulement. Le visage reste à l'écart.", "الخصل فقط. يبقى الوجه بعيداً.", "غير الخصل. الوجه كيبقا بعيد."],
        ["Les mains se rincent à l'eau de rose. La pâte, elle, part à l'eau claire.", "تُشطف اليدان بماء الورد. أما العجينة فتذهب بالماء الصافي.", "اليدين كيتشطّفو بما الورد. العجينة كتمشي بالماء الصافي."],
      ],
      usage: [
        "Sur la terrasse, après le thé. Le récit décrit une pâte et une tache possible. Il ne décrit pas un résultat sur le cheveu.",
        "على السطح، بعد الشاي. تصف الرواية عجينة وبقعة محتملة. لا تصف نتيجة على الشعر.",
        "على السطاح، من بعد الأتاي. الرواية كاتوصف عجينة وبقعة ممكنة. ما كاتوصفش نتيجة على الشعر.",
      ],
      caution: [
        "Démonstration. Le henné tache le linge et la peau dans ce récit. Rien n'est à mettre près des yeux, et aucune pousse n'est annoncée.",
        "عرض. الحناء في هذه الرواية تعلّم القماش والبشرة. لا شيء يوضع قرب العينين، ولا يُعلن نمو.",
        "عرض. الحنا فهاد الرواية كيعلّم التوب والبشرة. حتى حاجة ما تتحط حدى العينين، وحتى نمو ما متعلن.",
      ],
      variants: [
        "Sans henné, la voix dit que la pâte ne marque plus le linge, et que ce n'est plus le même récit.",
        "بلا حناء، تقول الصوت إن العجينة لا تعلّم القماش، وأن الرواية لم تعد نفسها.",
        "بلا حنا، الصوت كتقول العجينة ما كاتعلّمش التوب، والرواية ما بقاش هي هي.",
      ],
      duration: [
        "« Le temps de finir le thé ». Aucune minute n'est comptée.",
        "«مدة إنهاء الشاي». لا تُحسب دقيقة.",
        "«مدة تسالية الأتاي». حتى دقيقة ما محسوبة.",
      ],
    }),
  ],
  hammam: [
    deep({
      title: ["Le plateau entier", "الصينية كاملة", "الصينية كاملة"],
      summary: [
        "Savon, kessa, ghassoul, deux eaux de fleur, argan, miel, thym, menthe, girofle, eucalyptus et un bol de henné à part. L'ordre du hammam reste celui déjà raconté.",
        "صابون وكيسة وغاسول وماءا زهر وأركان وعسل وزعتر ونعناع وقرنفل وكالبتوس وإناء حناء على حدة. يبقى ترتيب الحمام كما رُوي.",
        "صابون وكيس وغاسول وجوج مايات الزهر وأركان وعسل وزعتر ونعناع وقرنفل وكاليتوس وزلافة الحنا بوحدها. ترتيب الحمام كيبقا كيف تروى.",
      ],
      origin: ["Repère éditorial : hammam de maison", "علامة تحريرية: حمام البيت", "علامة تحريرية: حمام الدار"],
      history: [
        "La voix fictive dresse le plateau avant d'entrer dans la chaleur. Elle ne mélange pas tout. Le savon beldi est dans sa boîte, la kessa à côté, le ghassoul dans un bol, le miel et l'argan dans deux petits verres, la rose et la fleur d'oranger dans leurs flacons. Thym, menthe et girofle sont des brins secs posés sur le savon, pas une formule. Les feuilles d'eucalyptus restent près de la porte, pour l'odeur de la pièce : la voix ne les met pas sur la peau. Le henné est un troisième bol, fermé, pour plus tard, jamais dans le savon. L'ordre dit est : chaleur, savon, kessa, ghassoul, salle tiède, sortie. Les herbes ne changent pas cet ordre.",
        "ترتّب الشخصية الوهمية الصينية قبل الدخول إلى الحرارة. لا تخلط كل شيء. الصابون البلدي في علبته، والكيسة بجانبه، والغاسول في إناء، والعسل والأركان في كأسين صغيرين، والورد والزهر في قارورتيهما. الزعتر والنعناع والقرنفل أعواد جافة على الصابون، ليست تركيبة. تبقى أوراق الكالبتوس قرب الباب لرائحة المكان: لا تضعها الصوت على البشرة. الحناء إناء ثالث مغلق، لما بعد، ولا يدخل الصابون أبداً. الترتيب المذكور: حرارة، صابون، كيسة، غاسول، قاعة فاترة، خروج. الأعشاب لا تغيّر هذا الترتيب.",
        "الشخصية الوهمية كترتب الصينية قبل ما تدخل للسخونية. ما كتخلطش كلشي. الصابون البلدي فحويجته، والكيس حداه، والغاسول فزلافة، والعسل والأركان فجوج كيسان صغار، والورد والزهر فقواريرهم. الزعتر والنعناع والقرنفل عويدات ناشفين على الصابون، ماشي تركيبة. ورق الكاليتوس كيبقا حدى الباب لريحة البيت: الصوت ما كتحطوش على البشرة. الحنا زلافة ثالثة مسدودة، من بعد، وما كيدخلش للصابون. الترتيب اللي تقال: سخونية، صابون، كيس، غاسول، بيت فاتر، خروج. العشوب ما كيتبدّلوش هاد الترتيب.",
      ],
      items: [
        [["Savon beldi", "صابون بلدي", "صابون بلدي"], bol(["Dans sa boîte, avant la kessa.", "في علبته، قبل الكيسة.", "فحويجته، قبل الكيس."])],
        [["Kessa", "كيسة", "كيس"], bol(["Posée à côté du savon. Le récit ne décrit pas la force du geste.", "موضوعة بجانب الصابون. الرواية لا تصف قوة الحركة.", "محطوطة حدى الصابون. الرواية ما كاتوصفش قوة الحركة."])],
        [["Ghassoul", "غاسول", "غاسول"], bol(["Bol à part, après la kessa dans l'ordre raconté.", "إناء مستقل، بعد الكيسة في الترتيب المروي.", "زلافة بوحدها، من بعد الكيس فالترتيب المروي."])],
        [["Eau de rose", "ماء الورد", "ما الورد"], bol(["Flacon sur le plateau.", "قارورة على الصينية.", "قارورة على الصينية."])],
        [["Fleur d'oranger", "ماء الزهر", "ما الزهر"], bol(["Second flacon, non mélangé d'avance.", "قارورة ثانية، بلا خلط مسبق.", "قارورة ثانية، بلا خلط قبل."])],
        [["Huile d'argan", "زيت الأركان", "زيت الأركان"], bol(["Petit verre. Pas de mesure.", "كأس صغير. بلا قياس.", "كاس صغير. بلا قياس."])],
        [["Miel", "عسل", "عسل"], bol(["Second petit verre.", "الكأس الصغير الثاني.", "الكاس الصغير الثاني."])],
        [["Thym", "زعتر", "زعتر"], bol(["Brins secs sur le savon.", "أعواد جافة على الصابون.", "عويدات ناشفين على الصابون."])],
        [["Menthe", "نعناع", "نعناع"], bol(["Avec le thym, pour l'odeur du plateau.", "مع الزعتر، لرائحة الصينية.", "مع الزعتر، لريحة الصينية."])],
        [["Clou de girofle", "قرنفل", "قرنفل"], bol(["Quelques clous parmi les brins.", "بضعة قرون بين الأعواد.", "شي قرون بين العويدات."])],
        [["Eucalyptus", "كالبتوس", "كاليتوس"], bol(["Feuilles près de la porte. Pas sur la peau.", "أوراق قرب الباب. لا على البشرة.", "ورق حدى الباب. ماشي على البشرة."])],
        [["Henné", "حناء", "حنا"], bol(["Bol fermé, à part. Il n'entre pas dans le savon.", "إناء مغلق، على حدة. لا يدخل الصابون.", "زلافة مسدودة، بوحدها. ما كدخلش للصابون."])],
      ],
      steps: [
        ["Le plateau est dressé avant la chaleur.", "تُرتَّب الصينية قبل الحرارة.", "الصينية كتترتب قبل السخونية."],
        ["Rien n'est versé dans le même bol, sauf ce que la voix nomme déjà à part.", "لا يُسكب شيء في الإناء نفسه، إلا ما سمّته الصوت مستقلاً.", "حتى حاجة ما كتصب فنفس الزلافة، غير اللي الصوت سمّاتها بوحدها."],
        ["Chaleur, savon, kessa, ghassoul, salle tiède, sortie.", "حرارة، صابون، كيسة، غاسول، قاعة فاترة، خروج.", "سخونية، صابون، كيس، غاسول، بيت فاتر، خروج."],
        ["Rose et fleur d'oranger passent sur le linge à la sortie.", "يمر الورد والزهر على القماش عند الخروج.", "الورد والزهر كيدوزو على التوب فالخروج."],
        ["L'eucalyptus reste à la porte.", "يبقى الكالبتوس عند الباب.", "الكاليتوس كيبقا عند الباب."],
        ["Le henné n'est pas ouvert dans cette chaleur.", "لا تُفتح الحناء في هذه الحرارة.", "الحنا ما كتتحلش فهاد السخونية."],
      ],
      usage: [
        "Hammam de maison, un plateau complet. Le récit raconte l'ordre et les pots. Il ne raconte pas un bienfait.",
        "حمام البيت، صينية كاملة. تروي الرواية الترتيب والأواني. لا تروي نفعاً.",
        "حمام الدار، صينية كاملة. الرواية كتروي الترتيب والأواني. ما كترويش نفع.",
      ],
      caution: [
        "Démonstration. La kessa n'est pas décrite comme un geste à forcer. L'eucalyptus ne touche pas la peau dans ce récit. Le henné reste fermé.",
        "عرض. لا تُوصف الكيسة كحركة تُشد. الكالبتوس لا يلمس البشرة في هذه الرواية. تبقى الحناء مغلقة.",
        "عرض. الكيس ما متوصفش كحركة تشد. الكاليتوس ما كيلمسش البشرة فهاد الرواية. الحنا كتبقى مسدودة.",
      ],
      variants: [
        "Sans henné et sans eucalyptus, le plateau garde le savon, la kessa, le ghassoul, les fleurs, l'argan, le miel et les trois herbes sèches.",
        "بلا حناء وبلا كالبتوس، تبقي الصينية الصابون والكيسة والغاسول والزهر والأركان والعسل والأعشاب الثلاث الجافة.",
        "بلا حنا وبلا كاليتوس، الصينية كتبقى فيها الصابون والكيس والغاسول والزهر والأركان والعسل وثلاثة العشوب الناشفين.",
      ],
      duration: [
        "Le récit donne un ordre, pas une heure.",
        "تعطي الرواية ترتيباً لا ساعة.",
        "الرواية كتعطي ترتيب ماشي ساعة.",
      ],
    }),
  ],
  huiles: [
    deep({
      title: ["Les neuf huiles de la boîte", "زيوت العلبة التسعة", "الزيوت التسعة ديال الحويجة"],
      summary: [
        "Argan, olive, amande, sésame, nigelle, ricin, figue de barbarie, noyau d'abricot et karité, plus une touche de rose sur le doigt. La paume décide, pas une mesure.",
        "أركان وزيتون ولوز وسمسم وحبة البركة وخروع وتين شوكي ونواة مشمش وكاريتة، ولمسة ورد على الإصبع. الكف يقرر، لا المقياس.",
        "أركان وزيتون ولوز وجنجلان وحبة البركة وخروع وهندية ونواة المشماش وكاريتي، ولمسة ورد على الصبع. الكف هو اللي كيقرر، ماشي القياس.",
      ],
      origin: ["Repère éditorial : boîte en fer dans une armoire", "علامة تحريرية: علبة حديد في خزانة", "علامة تحريرية: حويجة الحديد فالخزانة"],
      history: [
        "La voix fictive ouvre une boîte en fer. Neuf contenants. Elle ne lit pas de proportions. Elle pose un doigt sur chaque bouchon et s'arrête quand la paume est couverte : argan, olive, amande douce, sésame, nigelle, ricin, figue de barbarie, noyau d'abricot, puis un peu de karité pris du bout de l'ongle. L'eau de rose ne fait pas partie des neuf : elle mouille un doigt après, pour l'odeur. Elle étend le mélange sur les avant-bras et les épaules. Elle dit les noms. Elle ne dit pas à quoi cela sert, ni d'où vient chaque flacon. Les étiquettes qui manquent restent manquantes.",
        "تفتح الشخصية الوهمية علبة حديد. تسعة أوعية. لا تقرأ نسباً. تضع إصبعاً على كل سدادة وتتوقف حين تمتلئ الراحة: أركان، زيتون، لوز حلو، سمسم، حبة البركة، خروع، تين شوكي، نواة مشمش، ثم قليل من الكاريتة بطرف الظفر. ماء الورد ليس من التسعة: تبل إصبعاً بعده للرائحة. تمد الخليط على الساعدين والكتفين. تقول الأسماء. لا تقول لماذا ولا من أين كل قارورة. اللصائق الناقصة تبقى ناقصة.",
        "الشخصية الوهمية كتحل حويجة الحديد. تسعة ديال الأواني. ما كتقراش النسب. كتحط صبع على كل سدادة وكتوقف منين الكف يعمر: أركان، زيتون، لوز حلو، جنجلان، حبة البركة، خروع، هندية، نواة المشماش، ومن بعد شوية كاريتي بطرف الضفر. ما الورد ماشي من التسعة: كتبل صبع من بعد للريحة. كتفرّد الخليط على الساعدين والكتاف. كتقول السميات. ما كتقولش علاش ولا منين كل قارورة. اللصائق الناقصين كيبقاو ناقصين.",
      ],
      items: [
        [["Huile d'argan", "زيت الأركان", "زيت الأركان"], bol(["Première touche dans la paume.", "أول لمسة في الراحة.", "أول لمسة فالكف."])],
        [["Huile d'olive", "زيت الزيتون", "زيت الزيتون"], bol(["Deuxième bouchon.", "السدادة الثانية.", "السدادة الثانية."])],
        [["Huile d'amande", "زيت اللوز", "زيت اللوز"], bol(["Amande douce, nommée ainsi.", "لوز حلو، مسمّى هكذا.", "لوز حلو، متسمي هاكا."])],
        [["Huile de sésame", "زيت السمسم", "زيت الجنجلان"], bol(["Quatrième flacon de la boîte.", "القارورة الرابعة في العلبة.", "القارورة الرابعة فالحويجة."])],
        [["Huile de nigelle", "زيت حبة البركة", "زيت حبة البركة"], bol(["La voix nomme la graine, pas un usage.", "تسمّي الصوت الحبّة، لا استعمالاً.", "الصوت كتسمي الحبّة، ماشي الاستعمال."])],
        [["Huile de ricin", "زيت الخروع", "زيت الخروع"], bol(["Dans la paume avec les autres. Aucun bienfait dit.", "في الراحة مع الباقي. لا نفع مذكور.", "فالكف مع الباقي. حتى نفع ما مذكور."])],
        [["Huile de figue de barbarie", "زيت التين الشوكي", "زيت الهندية"], bol(["Un doigt, pas un flacon vidé.", "إصبع، لا قارورة مفرغة.", "صبع، ماشي قارورة مفرغة."])],
        [["Huile de noyau d'abricot", "زيت نواة المشمش", "زيت نواة المشماش"], bol(["Huitième contenant. L'origine du flacon n'est pas dite.", "الوعاء الثامن. أصل القارورة غير مذكور.", "الوعاء الثامن. أصل القارورة ما مذكورش."])],
        [["Beurre de karité", "زبدة الكاريتة", "زبدة الكاريتي"], bol(["Pris du bout de l'ongle, pas pesé.", "يُؤخذ بطرف الظفر، بلا وزن.", "كيتاخد بطرف الضفر، بلا وزن."])],
        [["Eau de rose", "ماء الورد", "ما الورد"], bol(["Après les neuf, sur un doigt, pour l'odeur.", "بعد التسعة، على إصبع، للرائحة.", "من بعد التسعة، على صبع، للريحة."])],
      ],
      steps: [
        ["La boîte s'ouvre. Les neuf contenants restent dans l'ordre de l'armoire.", "تُفتح العلبة. تبقى الأوعية التسعة بترتيب الخزانة.", "الحويجة كتتحل. التسعة كيبقاو بترتيب الخزانة."],
        ["Un doigt sur chaque bouchon, jusqu'à couvrir la paume.", "إصبع على كل سدادة، حتى تغطية الراحة.", "صبع على كل سدادة، حتى الكف يتغطى."],
        ["Le karité ferme la suite, du bout de l'ongle.", "تختم الكاريتة السلسلة بطرف الظفر.", "الكاريتي كتسد السلسلة بطرف الضفر."],
        ["La rose vient après, à part.", "يأتي الورد بعد ذلك، على حدة.", "الورد كيجي من بعد، بوحدو."],
        ["Avant-bras et épaules. Pas le visage dans cette fiche.", "الساعدان والكتفان. ليس الوجه في هذه البطاقة.", "الساعدين والكتاف. ماشي الوجه فهاد البطاقة."],
        ["Les flacons sont rebouchés. Aucune étiquette n'est complétée.", "تُغلق القوارير. لا تُستكمل لصيقة.", "القوارير كتسد. حتى لصيقة ما كتكمّل."],
      ],
      usage: [
        "Après la toilette, sur les bras. Le récit est une liste de noms dans une paume.",
        "بعد الغسل، على الذراعين. الرواية لائحة أسماء في راحة.",
        "من بعد الغسل، على الذراعين. الرواية لائحة سميات فالكف.",
      ],
      caution: [
        "Démonstration. Aucune huile n'est présentée comme un traitement. Les origines non écrites sur les flacons restent non renseignées.",
        "عرض. لا يُقدَّم أي زيت كعلاج. الأصول غير المكتوبة على القوارير تبقى غير مذكورة.",
        "عرض. حتى زيت ما متقدمش كعلاج. الأصول اللي ما مكتوبينش على القوارير كيبقاو ما مذكورينش.",
      ],
      variants: [
        "Si un flacon est vide, la voix passe au suivant et le dit. Elle n'en remplace pas un par un autre sans le nommer.",
        "إذا فرغت قارورة، تمر الصوت إلى التالية وتقول ذلك. لا تستبدل واحدة بأخرى بلا تسمية.",
        "إلا فرغات قارورة، الصوت كدوز للي من بعد وكتقولها. ما كتعوّضش وحدة بوحدة بلا ما تسميها.",
      ],
      duration: [
        "Le temps d'ouvrir la boîte et de refermer les bouchons. Pas de minute.",
        "مدة فتح العلبة وإغلاق السدادات. بلا دقيقة.",
        "مدة فتح الحويجة وسد السدادات. بلا دقيقة.",
      ],
    }),
  ],
  mariage: [
    deep({
      title: ["Pâte de henné de la nuit", "عجينة حناء الليل", "عجينة الحنا ديال الليل"],
      summary: [
        "Henné, thé, citron, sucre, girofle, rose, fleur d'oranger, safran, huile d'olive, coton, et l'encens dans la pièce. La voix dit « jusqu'au matin », sans compter les heures.",
        "حناء وشاي وليمون وسكر وقرنفل وورد وزهر وزعفران وزيت زيتون وقطن، والبخور في المكان. تقول الصوت «حتى الصباح»، بلا عدّ الساعات.",
        "حنا وأتاي وحامض وسكر وقرنفل وورد وزهر وزعفران وزيت الزيتون وقطن، والبخور فالبيت. الصوت كتقول «حتى الصباح»، بلا ما تعد السوايع.",
      ],
      origin: ["Repère éditorial : nuit du henné, maison", "علامة تحريرية: ليلة الحناء، البيت", "علامة تحريرية: ليلة الحنا، الدار"],
      history: [
        "La voix fictive prépare la pâte dans un bol creux. Le henné d'abord, puis le thé noir déjà infusé et refroidi, le citron, un peu de sucre, les clous pilés, la rose, la fleur d'oranger, trois fils de safran, et un filet d'huile d'olive pour que la pâte lisse sous le doigt. Le coton est à côté, pas dedans. L'encens est dans la pièce, allumé par une autre figure : cette fiche ne dit pas comment on allume. Elle pose la pâte sur les paumes et les pieds dans le récit, jamais sur le visage. Elle dit que cela reste jusqu'au matin et que le linge sera marqué. Elle ne donne ni gramme ni heure.",
        "تحضّر الشخصية الوهمية العجينة في إناء عميق. الحناء أولاً، ثم الشاي الأسود المنقوع والبارد، والليمون، وقليل من السكر، والقرنفل المدقوق، والورد، والزهر، وثلاثة خيوط زعفران، وخيط زيت زيتون حتى تنعم العجينة تحت الإصبع. القطن بجانب الإناء لا داخله. البخور في المكان، أوقدته شخصية أخرى: هذه البطاقة لا تقول كيف تُشعل النار. تضع العجينة على الراحتين والقدمين في الرواية، لا على الوجه أبداً. تقول إنها تبقى حتى الصباح وإن القماش سيتعلّم. لا تعطي غراماً ولا ساعة.",
        "الشخصية الوهمية كتحضّر العجينة فزلافة غارقة. الحنا اللول، ومن بعد الأتاي الأسود منقوع وبارد، والحامض، وشوية سكر، والقرنفل مدقوق، والورد، والزهر، وثلاثة خيوط زعفران، وخيط زيت الزيتون حتى العجينة تنعم تحت الصبع. القطن حدى الزلافة ماشي داخلها. البخور فالبيت، شعلاتو شخصية أخرى: هاد البطاقة ما كتقولش كيفاش تشعل العافية. كتحط العجينة على الكفين والرجلين فالرواية، ماشي على الوجه. كتقول كتبقى حتى الصباح والتوب غادي يتعلّم. ما كتعطيش غرام ولا ساعة.",
      ],
      items: [
        [["Henné", "حناء", "حنا"], bol(["Base de la pâte. Il tache, dit la voix.", "أساس العجينة. يعلّم، تقول الصوت.", "أساس العجينة. كيعلّم، كتقول الصوت."])],
        [["Thé noir", "شاي أسود", "أتاي أسود"], bol(["Déjà infusé et refroidi. Le récit ne dit pas la force du thé.", "منقوع وبارد. لا تقول الرواية قوة الشاي.", "منقوع وبارد. الرواية ما كتقولش قوة الأتاي."])],
        [["Citron", "ليمون", "حامض"], bol(["Dans le bol du henné seulement, dans ce récit.", "في إناء الحناء فقط، في هذه الرواية.", "فزلافة الحنا غير، فهاد الرواية."])],
        [["Sucre", "سكر", "سكر"], bol(["Un peu, non pesé.", "قليل، بلا وزن.", "شوية، بلا وزن."])],
        [["Clou de girofle", "قرنفل", "قرنفل"], bol(["Pilé avec le sucre.", "مدقوق مع السكر.", "مدقوق مع السكر."])],
        [["Eau de rose", "ماء الورد", "ما الورد"], bol(["Versée dans la pâte.", "تُسكب في العجينة.", "كتصب فالعجينة."])],
        [["Fleur d'oranger", "ماء الزهر", "ما الزهر"], bol(["Après la rose.", "بعد الورد.", "من بعد الورد."])],
        [["Safran", "زعفران", "زعفران"], bol(["Trois fils, dit la voix, sans balance.", "ثلاثة خيوط، تقول الصوت، بلا ميزان.", "ثلاثة خيوط، كتقول الصوت، بلا ميزان."])],
        [["Huile d'olive", "زيت الزيتون", "زيت الزيتون"], bol(["Un filet pour lisser sous le doigt.", "خيط للتنعيم تحت الإصبع.", "خيط باش تنعم تحت الصبع."])],
        [["Coton", "قطن", "قطن"], bol(["À côté du bol, pour essuyer les bords.", "بجانب الإناء، لمسح الأطراف.", "حدى الزلافة، باش تمسح الجوانب."])],
        [["Encens", "بخور", "بخور"], bol(["Dans la pièce. Le feu n'est pas expliqué.", "في المكان. النار غير مشروحة.", "فالبيت. العافية ما مشروحااش."])],
      ],
      steps: [
        ["Le henné reçoit le thé froid, le citron et le sucre.", "تأخذ الحناء الشاي البارد والليمون والسكر.", "الحنا كتخد الأتاي البارد والحامض والسكر."],
        ["Le girofle pilé, la rose, la fleur d'oranger et le safran suivent.", "يتبع القرنفل المدقوق والورد والزهر والزعفران.", "كيجي من بعد القرنفل المدقوق والورد والزهر والزعفران."],
        ["L'huile d'olive lisse la pâte. Le coton reste dehors.", "ينعّم زيت الزيتون العجينة. يبقى القطن خارجها.", "زيت الزيتون كيليّن العجينة. القطن كيبقا برا."],
        ["Paumes et pieds dans le récit. Pas le visage.", "الراحتان والقدمان في الرواية. ليس الوجه.", "الكفين والرجلين فالرواية. ماشي الوجه."],
        ["L'encens est déjà là. Cette fiche n'allume rien.", "البخور موجود سلفاً. هذه البطاقة لا تشعل شيئاً.", "البخور كاين من قبل. هاد البطاقة ما كتشعل حتى حاجة."],
        ["La voix dit : jusqu'au matin. Le linge sera marqué.", "تقول الصوت: حتى الصباح. سيتعلّم القماش.", "الصوت كتقول: حتى الصباح. التوب غادي يتعلّم."],
      ],
      usage: [
        "Nuit racontée dans la maison. Le récit parle de couleur sur les paumes et d'odeur dans la pièce.",
        "ليلة مروية في البيت. تتكلم الرواية عن لون على الراحتين ورائحة في المكان.",
        "ليلة مروية فالدار. الرواية كتهضر على اللون على الكفين والريحة فالبيت.",
      ],
      caution: [
        "Démonstration, pas une formule. Le citron reste dans le bol du henné de ce récit, pas sur le visage. Le feu de l'encens n'est pas expliqué. Le henné tache.",
        "عرض، لا تركيبة. يبقى الليمون في إناء حناء هذه الرواية، لا على الوجه. نار البخور غير مشروحة. الحناء تعلّم.",
        "عرض، ماشي تركيبة. الحامض كيبقا فزلافة الحنا ديال هاد الرواية، ماشي على الوجه. عافية البخور ما مشروحااش. الحنا كيعلّم.",
      ],
      variants: [
        "Sans citron et sans sucre, la voix dit que la pâte est seulement henné, thé, fleurs, safran et huile. Elle ne corrige pas l'autre version.",
        "بلا ليمون وبلا سكر، تقول الصوت إن العجينة فقط حناء وشاي وزهر وزعفران وزيت. لا تصحّح النسخة الأخرى.",
        "بلا حامض وبلا سكر، الصوت كتقول العجينة غير حنا وأتاي وزهر وزعفران وزيت. ما كتصحّحش النسخة الأخرى.",
      ],
      duration: [
        "Jusqu'au matin, selon la voix. Aucune heure n'est comptée.",
        "حتى الصباح، حسب الصوت. لا تُحسب ساعة.",
        "حتى الصباح، على حساب الصوت. حتى ساعة ما محسوبة.",
      ],
    }),
  ],
  corps: [
    deep({
      title: ["Gommage du plateau", "تقشير الصينية", "تقشير الصينية"],
      summary: [
        "Sucre, deux huiles, amande pilée, miel, zeste, rose, sésame, fleur d'oranger et cannelle. Pour les épaules et les coudes, pas pour le visage.",
        "سكر وزيتان ولوز مدقوق وعسل وقشر وورد وسمسم وزهر وقرفة. للكتفين والمرفقين، لا للوجه.",
        "سكر وجوج زيوت ولوز مدقوق وعسل وقشرة وورد وجنجلان وزهر وقرفة. للكتاف والمرافق، ماشي للوجه.",
      ],
      origin: ["Repère éditorial : salle d'eau, après le hammam", "علامة تحريرية: بيت الماء، بعد الحمام", "علامة تحريرية: بيت الماء، من بعد الحمام"],
      history: [
        "La voix fictive mélange dans un bol large, après la chaleur, jamais avant. Le sucre et les amandes pilées d'abord, puis l'olive et l'argan, le miel, le sésame, le zeste d'orange, la cannelle, et seulement ensuite la rose et la fleur d'oranger. Elle frotte les épaules, les coudes et les talons, puis rince. Elle dit que le visage a déjà eu son propre bol. Elle ne dit pas que la peau change.",
        "تخلط الشخصية الوهمية في إناء واسع، بعد الحرارة، لا قبلها. السكر واللوز المدقوق أولاً، ثم الزيتون والأركان والعسل والسمسم وقشر البرتقال والقرفة، وبعد ذلك فقط الورد والزهر. تفرك الكتفين والمرفقين والكعبين، ثم تشطف. تقول إن الوجه أخذ إناءه من قبل. لا تقول إن البشرة تتغيّر.",
        "الشخصية الوهمية كتخلط فزلافة واسعة، من بعد السخونية، ماشي قبل. السكر واللوز المدقوق اللول، ومن بعد الزيتون والأركان والعسل والجنجلان وقشرة البرتقال والقرفة، ومن بعد غير الورد والزهر. كتحك الكتاف والمرافق والعقاب، ومن بعد كتشطف. كتقول الوجه خدا زلافتو من قبل. ما كتقولش البشرة كتبدّل.",
      ],
      items: [
        [["Sucre", "سكر", "سكر"], bol(["Avec l'amande, au fond du bol.", "مع اللوز، في قاع الإناء.", "مع اللوز، فقاع الزلافة."])],
        [["Amandes pilées", "لوز مدقوق", "لوز مدقوق"], bol(["Sèches, avant les huiles.", "جاف، قبل الزيوت.", "ناشف، قبل الزيوت."])],
        [["Huile d'olive", "زيت الزيتون", "زيت الزيتون"], bol(["Première huile.", "الزيت الأول.", "الزيت الأول."])],
        [["Huile d'argan", "زيت الأركان", "زيت الأركان"], bol(["Seconde huile.", "الزيت الثاني.", "الزيت الثاني."])],
        [["Miel", "عسل", "عسل"], bol(["Après les huiles.", "بعد الزيوت.", "من بعد الزيوت."])],
        [["Sésame", "سمسم", "جنجلان"], bol(["Graines dans le sucre.", "حبوب في السكر.", "حبوب فالسكر."])],
        [["Zeste d'orange", "قشر البرتقال", "قشرة البرتقال"], bol(["Un zeste, non râpé en grammes.", "قشر، بلا بشر غرامات.", "قشرة، بلا بشر غرامات."])],
        [["Cannelle", "قرفة", "قرفة"], bol(["Une pincée nommée, non mesurée.", "رشة مذكورة، غير مقاسة.", "رشة مذكورة، ما مقاساش."])],
        [["Eau de rose", "ماء الورد", "ما الورد"], bol(["En dernier, avec la fleur d'oranger.", "في الآخر، مع ماء الزهر.", "فاللخر، مع ما الزهر."])],
        [["Fleur d'oranger", "ماء الزهر", "ما الزهر"], bol(["Ferme le mélange.", "تختم الخليط.", "كتسد الخليط."])],
      ],
      steps: [
        ["Le bol n'est ouvert qu'après la chaleur.", "لا يُفتح الإناء إلا بعد الحرارة.", "الزلافة ما كتتحلش غير من بعد السخونية."],
        ["Sucre et amande, puis les deux huiles et le miel.", "سكر ولوز، ثم الزيتان والعسل.", "سكر ولوز، ومن بعد جوج الزيوت والعسل."],
        ["Sésame, zeste, cannelle.", "سمسم وقشر وقرفة.", "جنجلان وقشرة وقرفة."],
        ["Rose et fleur d'oranger en dernier.", "الورد والزهر في الآخر.", "الورد والزهر فاللخر."],
        ["Épaules, coudes, talons. Le visage est déjà fini.", "أكتاف ومرفقان وكعبان. الوجه انتهى سلفاً.", "كتاف ومرافق وعقاب. الوجه سالا من قبل."],
        ["Rinçage à l'eau claire.", "شطف بالماء الصافي.", "شطف بالماء الصافي."],
      ],
      usage: [
        "Après le hammam de la maison, sur le corps seulement.",
        "بعد حمام البيت، على الجسم فقط.",
        "من بعد حمام الدار، على الجسم غير.",
      ],
      caution: [
        "Démonstration. Le récit ne dit pas de frotter jusqu'à rougir, et il ne promet pas un changement de peau.",
        "عرض. لا تقول الرواية بالفرك حتى الاحمرار، ولا تعد بتغيّر البشرة.",
        "عرض. الرواية ما كتقولش الحك حتى الحمار، وما كتعّدش بتبديل البشرة.",
      ],
      variants: [
        "Sans cannelle et sans zeste, il reste le sucre, les amandes, les huiles, le miel, le sésame et les deux eaux de fleur.",
        "بلا قرفة وبلا قشر، يبقى السكر واللوز والزيوت والعسل والسمسم وماءا الزهر.",
        "بلا قرفة وبلا قشرة، كيبقا السكر واللوز والزيوت والعسل والجنجلان وجوج مايات الزهر.",
      ],
      duration: [
        "Après la chaleur, le temps du rinçage. Pas de minute.",
        "بعد الحرارة، مدة الشطف. بلا دقيقة.",
        "من بعد السخونية، مدة الشطف. بلا دقيقة.",
      ],
    }),
  ],
  encens: [
    deep({
      title: ["Le mélange du soir", "خليط المساء", "خليط العشية"],
      summary: [
        "Luban, myrrhe, oud, benjoin, girofle, rose sèche, santal, cannelle, et deux pots dont l'étiquette dit ambre et musc sans que la voix sache ce qu'ils contiennent.",
        "لبان ومرّ وعود وبنزوين وقرنفل وورد جاف وصندل وقرفة، وإناءان تقول لصيقتهما عنبر ومسك دون أن تعرف الصوت ما فيهما.",
        "لبان ومر وعود وبنزوين وقرنفل وورد ناشف وصندل وقرفة، وجوج أواني اللصيقة ديالهم كتقول عنبر ومسك والصوت ما كتعرفش شنو فيهم.",
      ],
      origin: ["Repère éditorial : pièce aérée, charbon déjà allumé par une autre figure", "علامة تحريرية: غرفة مهوّاة، فحمة أوقدتها شخصية أخرى", "علامة تحريرية: بيت مهوي، فحمة شعلاتها شخصية أخرى"],
      history: [
        "La voix fictive ne touche pas au feu. Une autre figure a déjà posé le charbon. Elle, elle ouvre les boîtes et nomme : luban, myrrhe, un bois dont l'étiquette dit oud, benjoin, girofle, rose sèche, santal, cannelle. Deux petites boîtes disent ambre et musc. Elle les montre et dit qu'elle ne sait pas ce qu'il y a dedans, ni d'où cela vient. Elle pose une pincée de chaque sur un plateau, pas dans la flamme elle-même : la fiche s'arrête avant le feu. La fenêtre est ouverte.",
        "لا تلمس الشخصية الوهمية النار. شخصية أخرى وضعت الفحم سلفاً. هي تفتح العلب وتسمّي: لبان، مر، خشب تقول لصيقته عود، بنزوين، قرنفل، ورد جاف، صندل، قرفة. علبتان صغيرتان تقولان عنبر ومسك. تريهما وتقول إنها لا تعرف ما فيهما ولا من أين جاء. تضع رشة من كل واحد على صينية، لا في اللهب نفسه: تتوقف البطاقة قبل النار. النافذة مفتوحة.",
        "الشخصية الوهمية ما كلمسش العافية. شخصية أخرى حطات الفحم من قبل. هي كتحل العلب وكتسمي: لبان، مر، خشب اللصيقة ديالو كتقول عود، بنزوين، قرنفل، ورد ناشف، صندل، قرفة. جوج علب صغار كيقولو عنبر ومسك. كتوريهم وكتقول ما كتعرفش شنو فيهم ولا منين جاو. كتحط رشة من كل واحد على صينية، ماشي فاللهب: البطاقة كتوقف قبل العافية. الشرجم محلول.",
      ],
      items: [
        [["Luban", "لبان", "لبان"], bol(["Encens nommé en premier.", "البخور المسمّى أولاً.", "البخور المتسمي اللول."])],
        [["Myrrhe", "مر", "مر"], bol(["Résine à côté du luban.", "راتنج بجانب اللبان.", "راتنج حدى اللبان."])],
        [["Oud", "عود", "عود"], bol(["Le mot est sur l'étiquette. L'origine n'est pas confirmée.", "الكلمة على اللصيقة. الأصل غير مؤكد.", "الكلمة على اللصيقة. الأصل ما متأكدش."])],
        [["Benjoin", "بنزوين", "بنزوين"], bol(["Résine nommée, non pesée.", "راتنج مذكور، غير موزون.", "راتنج مذكور، ما موزونش."])],
        [["Clou de girofle", "قرنفل", "قرنفل"], bol(["Quelques clous sur le plateau.", "بضعة قرون على الصينية.", "شي قرون على الصينية."])],
        [["Rose sèche", "ورد جاف", "ورد ناشف"], bol(["Pétales, pas une eau.", "بتلات، لا ماء.", "ورق، ماشي ماء."])],
        [["Santal", "صندل", "صندل"], bol(["Bois nommé. Le pays n'est pas dit.", "خشب مذكور. البلد غير مذكور.", "خشب مذكور. البلاد ما مذكوراش."])],
        [["Cannelle", "قرفة", "قرفة"], bol(["Bâton cassé, non moulu en dose.", "عود مكسور، بلا طحن كمقدار.", "عود مكسور، بلا طحن كمقدار."])],
        [["Ambre", "عنبر", "عنبر"], bol(["Étiquette seulement. La voix ne sait pas le contenu.", "لصيقة فقط. لا تعرف الصوت المحتوى.", "لصيقة غير. الصوت ما كتعرفش المحتوى."])],
        [["Musc", "مسك", "مسك"], bol(["Étiquette seulement. Aucune origine animale n'est affirmée.", "لصيقة فقط. لا يُؤكد أي أصل حيواني.", "لصيقة غير. حتى أصل حيواني ما متأكد."])],
      ],
      steps: [
        ["La fenêtre est ouverte avant les boîtes.", "تُفتح النافذة قبل العلب.", "الشرجم كيتفتح قبل العلب."],
        ["Chaque résine est nommée et posée en pincée sur le plateau.", "يُسمّى كل راتنج ويوضع رشة على الصينية.", "كل راتنج كيتسمى وكيتوضع رشة على الصينية."],
        ["Oud, ambre et musc sont lus sur l'étiquette, puis mis en doute.", "يُقرأ العود والعنبر والمسك على اللصيقة، ثم يُشك فيهما.", "العود والعنبر والمسك كيتقراو على اللصيقة، ومن بعد كيتشك فيهم."],
        ["Le plateau reste à distance du charbon.", "تبقى الصينية بعيدة عن الفحم.", "الصينية كتبقى بعيدة على الفحم."],
        ["La fiche s'arrête. Elle n'explique pas le feu.", "تتوقف البطاقة. لا تشرح النار.", "البطاقة كتوقف. ما كتشرحش العافية."],
      ],
      usage: [
        "Le soir, dans une pièce déjà préparée par une autre figure. Le récit est une liste de noms, pas une manière d'allumer.",
        "مساءً، في غرفة جهّزتها شخصية أخرى. الرواية لائحة أسماء، لا طريقة إشعال.",
        "فالعشية، فبيت وجداتو شخصية أخرى. الرواية لائحة سميات، ماشي طريقة باش تشعل.",
      ],
      caution: [
        "Démonstration. Le charbon est déjà allumé par quelqu'un d'autre. Cette fiche n'apprend pas le feu. Ambre et musc restent des mots d'étiquette.",
        "عرض. الفحم أوقدته شخصية أخرى. هذه البطاقة لا تعلّم النار. يبقى العنبر والمسك كلمتي لصيقة.",
        "عرض. الفحم شعلاتو شخصية أخرى. هاد البطاقة ما كتعلّمش العافية. العنبر والمسك كيبقاو كلمات اللصيقة.",
      ],
      variants: [
        "Sans les deux pots douteux, il reste le luban, la myrrhe, le benjoin, le girofle, la rose, le santal et la cannelle. L'oud reste une étiquette à part.",
        "بلا الإناءين المشكوك فيهما، يبقى اللبان والمر والبنزوين والقرنفل والورد والصندل والقرفة. يبقى العود لصيقة على حدة.",
        "بلا جوج الأواني اللي فيهم الشك، كيبقا اللبان والمر والبنزوين والقرنفل والورد والصندل والقرفة. العود كيبقا لصيقة بوحدو.",
      ],
      duration: [
        "Le temps de nommer les boîtes. Le feu n'a pas de durée ici.",
        "مدة تسمية العلب. ليس للنار مدة هنا.",
        "مدة تسمية العلب. العافية ما عندهاش مدة هنا.",
      ],
    }),
  ],
  plantes: [
    deep({
      title: ["Herbes du souk", "أعشاب السوق", "عشوب السوق"],
      summary: [
        "Douze plantes sèches alignées et nommées : lavande, menthe, camomille, romarin, thym, verveine, rose, fleur d'oranger, sauge, sidr, géranium, safran. Rien n'est bu.",
        "اثنتا عشرة نبتة جافة تُصف وتُسمّى: خزامى ونعناع وبابونج وإكليل وزعتر وزهرة اللويزة وورد وزهر ومريمية وسدر وعطرشة وزعفران. لا يُشرب شيء.",
        "تناش نبتة ناشفة كترتب وكتسمى: خزامى ونعناع وبابونج وأزيري وزعتر ولويزة وورد وزهر وسالمية وسدر وعطرشة وزعفران. حتى حاجة ما كتشرب.",
      ],
      origin: ["Repère éditorial : retour du souk, noms de marché", "علامة تحريرية: عودة من السوق، أسماء سوق", "علامة تحريرية: الرجوع من السوق، سميات السوق"],
      history: [
        "La voix fictive vide son panier sur la table et dit chaque nom avant de le ranger. Elle ne fait pas d'infusion. Elle dit que ces plantes sont pour les plateaux et les bols déjà racontés, pas pour la tasse. L'eau de rose déjà en bouteille sert à se laver les mains après avoir touché la poussière des sachets. Le safran reste dans son papier. Aucune plante n'est présentée comme un remède.",
        "تفرغ الشخصية الوهمية سلّتها على الطاولة وتقول كل اسم قبل ترتيبه. لا تنقع شيئاً. تقول إن هذه النباتات لصواني والأواني التي رُويت، لا للكأس. ماء الورد الجاهز في القارورة لغسل اليدين بعد غبار الأكياس. يبقى الزعفران في ورقته. لا تُقدَّم أي نبتة كدواء.",
        "الشخصية الوهمية كتفرغ السلة على الطبلة وكتقول كل سمية قبل ما ترتبها. ما كتنقّعش حتى حاجة. كتقول هاد النباتات للصواني والأواني اللي تروات، ماشي للكاس. ما الورد اللي فالتقارورة باش تغسل اليدين من بعد غبرة الأكياس. الزعفران كيبقا فورقته. حتى نبتة ما متقدمّاش كدواء.",
      ],
      items: [
        [["Lavande", "خزامى", "خزامى"], bol(["Sachet du marché, fleurs sèches.", "كيس السوق، زهر جاف.", "كيس السوق، زهر ناشف."])],
        [["Menthe", "نعناع", "نعناع"], bol(["Feuilles sèches. Non infusées ici.", "أوراق جافة. بلا نقع هنا.", "ورق ناشف. بلا نقيع هنا."])],
        [["Camomille", "بابونج", "بابونج"], bol(["Fleurs, à côté de la menthe.", "زهر، بجانب النعناع.", "زهر، حدى النعناع."])],
        [["Romarin", "إكليل الجبل", "أزيري"], bol(["Brins secs.", "أعواد جافة.", "عويدات ناشفين."])],
        [["Thym", "زعتر", "زعتر"], bol(["Du même panier.", "من السلة نفسها.", "من نفس السلة."])],
        [["Verveine", "اللويزة", "اللويزة"], bol(["Nommée, non bue.", "مذكورة، غير مشروبة.", "مذكورة، ما مشروباش."])],
        [["Rose", "ورد", "ورد"], bol(["Pétales secs, pas le flacon.", "بتلات جافة، لا القارورة.", "ورق ناشف، ماشي القارورة."])],
        [["Fleur d'oranger", "زهر النارنج", "زهر النارنج"], bol(["Fleurs sèches, distinctes de l'eau de fleur.", "زهر جاف، غير ماء الزهر.", "زهر ناشف، ماشي ما الزهر."])],
        [["Sauge", "مريمية", "سالمية"], bol(["Feuilles. Aucun usage intérieur n'est dit.", "أوراق. لا يُذكر استعمال داخلي.", "ورق. حتى استعمال داخلي ما مذكور."])],
        [["Sidr", "سدر", "سدر"], bol(["Feuilles pour les autres bols, pas une tisane.", "أوراق للأواني الأخرى، لا منقوع شرب.", "ورق للأواني الأخرى، ماشي نقيع للشرب."])],
        [["Géranium", "عطرشة", "عطرشة"], bol(["Feuilles odorantes, sèches.", "أوراق عطرة، جافة.", "ورق معطر، ناشف."])],
        [["Safran", "زعفران", "زعفران"], bol(["Reste dans son papier.", "يبقى في ورقته.", "كيبقا فورقته."])],
      ],
      steps: [
        ["Le panier est vidé. Chaque sachet est nommé.", "تُفرغ السلة. يُسمّى كل كيس.", "السلة كتفرغ. كل كيس كيتسمى."],
        ["Les plantes restent sèches. Aucune casserole n'est allumée.", "تبقى النباتات جافة. لا تُشعل قدر.", "النباتات كيبقاو ناشفين. حتى طنجرة ما كتشعل."],
        ["Les mains se lavent à l'eau de rose après la poussière.", "تُغسل اليدان بماء الورد بعد الغبار.", "اليدين كيتغسلو بما الورد من بعد الغبرة."],
        ["Le safran ne sort pas de son papier.", "لا يخرج الزعفران من ورقته.", "الزعفران ما كيخرجش من ورقتو."],
        ["La voix range, elle ne prépare pas à boire.", "ترتّب الصوت، لا تحضّر للشرب.", "الصوت كترتب، ما كتحضّرش للشرب."],
      ],
      usage: [
        "Ranger le souk. Les plantes serviront aux autres récits du plateau, pas à une tasse.",
        "ترتيب سوق. ستخدم النباتات روايات الصينية الأخرى، لا كأساً.",
        "ترتيب السوق. النباتات غادي يخدمو روايات الصينية الأخرى، ماشي كاس.",
      ],
      caution: [
        "Démonstration. Rien dans cette fiche n'est à boire, à avaler, ou à prendre comme remède.",
        "عرض. لا شيء في هذه البطاقة للشرب أو البلع أو كدواء.",
        "عرض. حتى حاجة فهاد البطاقة ماشي للشرب ولا للبلع ولا كدواء.",
      ],
      variants: [
        "Le récit ne retire aucune plante. S'il manque un sachet, la voix le dit et laisse la place vide.",
        "لا تزيل الرواية أي نبتة. إذا نقص كيس، تقول الصوت ذلك وتترك المكان فارغاً.",
        "الرواية ما كتحيّد حتى نبتة. إلا نقص كيس، الصوت كتقولها وكتخلي البلاصة خاوية.",
      ],
      duration: [
        "Le temps de vider le panier. Pas de cuisson.",
        "مدة إفراغ السلة. بلا طهي.",
        "مدة تفريغ السلة. بلا طياب.",
      ],
    }),
  ],
};
