import { c, sheet, type Body } from "./sheet";

const voice = c(
  "La voix est une coiffeuse de maison, figure fictive. Elle ne remplace pas un récit collecté.",
  "الصوت مصفّفة بيت، شخصية وهمية. لا تحل محل رواية جُمعت.",
  "الصوت كاتصفف ف الدار، شخصية وهمية. ما كتعوّضش رواية مجموعة.",
);

export const CHEVEUX: Body[] = [
  sheet({
    title: c("Henné le temps du repas", "حناء مدة الأكل", "حنا مدة الماكلة"),
    summary: c(
      "La pâte de henné couvre les cheveux et reste le temps d'un repas partagé. Le récit ne convertit pas ce temps en minutes.",
      "تغطي عجينة الحناء الشعر وتبقى مدة أكل مشترك. لا تحوّل الرواية هذا الوقت إلى دقائق.",
      "عجينة الحنا كتغطي الشعر وكتبقى مدة ماكلة مشتركة. الرواية ما كتحوّلش هاد الوقت لدقايق.",
    ),
    origin: c("Repère éditorial : maison, jour de visite", "علامة تحريرية: البيت، يوم زيارة", "علامة تحريرية: الدار، نهار زيارة"),
    voice,
    history: c(
      "La voix tamise la poudre, la mouille à l'eau chaude mais supportable au poignet, et la laisse reposer pendant qu'elle prépare le thé. Elle étend la pâte de la racine vers les pointes, couvre d'un linge, et dit : « on mange, ensuite on rince ». Le rinçage est long, jusqu'à ce que l'eau ne sorte plus orange foncé. Aucune promesse de couleur n'est chiffrée.",
      "تنخل الصوت المسحوق، تبلّله بماء ساخن يُحتمل على المعصم، وتتركه يرتاح وهي تجهّز الشاي. تمد العجينة من الأصل نحو الأطراف، تغطي بقماش، وتقول: «نأكل ثم نشطف». الشطف طويل حتى لا يخرج الماء برتقالياً داكناً. لا وعد لوني مرقّم.",
      "الصوت كتنخل البودرة، كتبلّلها بماء سخون كيتحتمل على المعصم، وكتخليه يرتاح وهي كتحضّر أتي. كتمد العجينة من الأصل للأطراف، كتغطّي بتوب، وكتقول: «ناكلو ومن بعد نشطّفو». الشطف طويل حتى الماء ما يخرجش برتقالي غامق. حتى وعد ديال اللون ما مرقّم.",
    ),
    ingredients: [
      { name: c("Henné en poudre", "حناء مسحوقة", "حنا مطحونة"), note: c("Tamisée. Le récit ne donne pas le poids du sachet.", "منخولة. لا تعطي الرواية وزن الكيس.", "منخولة. الرواية ما كتعطيش وزن الكيس.") },
      { name: c("Eau chaude supportable", "ماء ساخن محتمل", "ماء سخون كيتحتمل"), note: c("Jugée au poignet, pas au thermomètre.", "تُقاس بالمعصم لا بمقياس حرارة.", "كتقاس بالمعصم ماشي بالترمومتر.") },
      { name: c("Linge", "قماش", "توب"), note: c("Couvre la tête pendant le repas. Il n'est pas serré.", "يغطي الرأس مدة الأكل. لا يُشدّ.", "كيغطي الراس مدة الماكلة. ما كيتشدّش.") },
    ],
    steps: [
      c("La poudre est tamisée avant l'eau.", "يُنخل المسحوق قبل الماء.", "البودرة كتنخل قبل الماء."),
      c("La pâte repose pendant le thé.", "ترتاح العجينة مدة الشاي.", "العجينة كترتاح مدة أتي."),
      c("L'étalement va des racines aux pointes.", "المدّ من الأصول إلى الأطراف.", "التفريد من الأصول للأطراف."),
      c("Le rinçage continue tant que l'eau reste très colorée.", "يستمر الشطف ما دام الماء شديد اللون.", "الشطف كيكمل ما دام الماء باقي ملون بزاف."),
    ],
    usage: c(
      "Jour de visite, dans la cour ou la cuisine. Le récit parle d'un moment ensemble, pas d'un résultat garanti sur la couleur.",
      "يوم زيارة، في الفناء أو المطبخ. تتكلم الرواية عن وقت جماعي، لا عن نتيجة مضمونة للون.",
      "نهار زيارة، فالفناء ولا الكوزينة. الرواية كتهضر على وقت مع بعضياتنا، ماشي على نتيجة مضمونة للون.",
    ),
    caution: c(
      "La voix éloigne la pâte des yeux et ne la laisse pas sécher jusqu'à craquer sur le front. Description, pas une consigne.",
      "تبعد الصوت العجينة عن العينين ولا تتركها حتى تتشقق على الجبين. وصف، لا تعليمة.",
      "الصوت كتبعد العجينة على العينين وما كتخليهاش حتى تتشقق على الجبهة. وصف، ماشي تعليمة.",
    ),
  }),
  sheet({
    title: c("Argan sur les pointes", "أركان على الأطراف", "أركان على الأطراف"),
    summary: c(
      "Après le lavage, quelques gouttes non comptées restent dans la paume et ne montent pas aux racines.",
      "بعد الغسل، قطرات غير معدودة تبقى في الراحة ولا تصعد إلى الأصول.",
      "من بعد الغسل، قطرات ما معدودينش كيبقاو فالكف وما كيطّلعوش للأصول.",
    ),
    origin: c("Repère éditorial : Souss, sans coopérative nommée", "علامة تحريرية: سوس، بلا تعاونية مسمّاة", "علامة تحريرية: سوس، بلا تعاونية مسمّية"),
    voice,
    history: c(
      "Le flacon est petit. La voix le retourne une fois au-dessus de la paume, frotte les mains, et prend seulement les pointes entre les doigts. Elle dit que l'huile aux racines « alourdit » dans son récit, sans expliquer un mécanisme. Elle ne chauffe pas le flacon. Le nom Souss est un repère qu'elle a entendu, pas une origine qu'elle a vue.",
      "القارورة صغيرة. تقلبها الصوت مرة فوق الراحة، تحك الكفين، وتأخذ الأطراف فقط بين الأصابع. تقول إن الزيت عند الأصول «يثقّل» في روايتها، بلا شرح آلية. لا تسخّن القارورة. اسم سوس علامة سمعتها، لا أصل رأته.",
      "القارورة صغيرة. الصوت كتقلبها مرة فوق الكف، كتحك الكفين، وكتاخد غير الأطراف بين الصباع. كتقول الزيت عند الأصول «كيثقّل» فروايتها، بلا شرح. ما كتسخّنش القارورة. سمية سوس علامة سمعاتها، ماشي أصل شافاتو.",
    ),
    ingredients: [
      { name: c("Huile d'argan", "زيت الأركان", "زيت الأركان"), note: c("Une verse dans la paume. Aucun millilitre.", "صبّة في الراحة. لا مليلتر.", "صبّة فالكف. حتى مليلتر.") },
    ],
    steps: [
      c("Les cheveux sont lavés et essorés, pas trempés.", "الشعر مغسول ومعصور، ليس مبللاً جداً.", "الشعر مغسول ومعصور، ماشي مبلل بزاف."),
      c("L'huile ne touche que les longueurs basses.", "لا يلمس الزيت إلا الأطراف السفلى.", "الزيت ما كيمس غير الأطراف التحت."),
      c("Les racines restent sèches de cette huile.", "تبقى الأصول بلا هذا الزيت.", "الأصول كيبقاو بلا هاد الزيت."),
      c("Le flacon est refermé tout de suite.", "تُغلق القارورة فوراً.", "القارورة كتسد دغيا."),
    ],
    usage: c(
      "Fin de lavage, dans la chambre. Le récit ne vend pas l'huile et ne cite aucune coopérative réelle.",
      "نهاية الغسل، في الغرفة. لا تبيع الرواية الزيت ولا تذكر تعاونية حقيقية.",
      "سالية الغسل، ف البيت. الرواية ما كاتبيعش الزيت وما كاتذكرش تعاونية حقيقية.",
    ),
    caution: c(
      "La voix dit que trop d'huile colle à l'oreiller. Elle n'en met pas sur le visage dans cette fiche.",
      "تقول الصوت إن كثرة الزيت تلتصق بالوسادة. لا تضعه على الوجه في هذه البطاقة.",
      "الصوت كتقول الزيت بزاف كيلصق فالمخدة. ما كتحطوش على الوجه فهاد البطاقة.",
    ),
  }),
  sheet({
    title: c("Rhassoul des longueurs", "غاسول الخصل", "غاسول الخصل"),
    summary: c(
      "Le ghassoul des cheveux est une pâte passée sur les longueurs comme un savon, puis rincée longtemps.",
      "غاسول الشعر عجينة تُمرر على الخصل كصابون، ثم تُشطف طويلاً.",
      "غاسول الشعر عجينة كتدوز على الخصل كصابون، ومن بعد كتشطف مزيان.",
    ),
    origin: c("Repère éditorial : salle d'eau", "علامة تحريرية: بيت الماء", "علامة تحريرية: بيت الماء"),
    voice,
    history: c(
      "Ce n'est pas le ghassoul du visage. La voix le dit plus liquide, pour qu'il glisse dans les longueurs sans faire de paquets. Elle commence à mi-cheveu, descend, et remonte peu. Le rinçage est la partie longue du récit : elle le recommence tant qu'elle sent le grain. Aucune comparaison avec un shampoing du commerce n'est développée.",
      "ليس هذا غاسول الوجه. تقول الصوت إنه أكثر سيولة حتى ينزلق في الخصل بلا تكتّل. تبدأ من منتصف الشعر وتنزل، وتصعد قليلاً. الشطف هو الجزء الطويل: تعيده ما دام الحبيبات محسوساً. لا تُطوَّر مقارنة بشامبو تجاري.",
      "هذا ماشي غاسول الوجه. الصوت كتقول خف باش يزولق فالخصل بلا تكتّل. كتبدا من نص الشعر وكتنزل، وكتطلع شوية. الشطف هو الطرف الطويل: كتعاودو ما دام الحبيبات باقيين. حتى مقارنة مع شامبو تجاري ما مطوّرة.",
    ),
    ingredients: [
      { name: c("Ghassoul", "غاسول", "غاسول"), note: c("Pâte plus liquide que celle du visage. Sans mesure.", "عجينة أسلس من عجينة الوجه. بلا مقدار.", "عجينة خف من عجينة الوجه. بلا مقدار.") },
      { name: c("Eau de rinçage", "ماء الشطف", "ماء الشطف"), note: c("Autant de fois que le grain se sent encore.", "بقدر ما تبقى الحبيبات محسوسة.", "قد ما الحبيبات باقيين كيتلمسو.") },
    ],
    steps: [
      c("La pâte est préparée à part du visage.", "تُحضّر العجينة بمعزل عن الوجه.", "العجينة كتحضّر بوحدها بعيد على الوجه."),
      c("Elle entre à mi-longueur, pas sur le cuir dans ce récit.", "تدخل عند منتصف الطول، لا على فروة الرأس في هذه الرواية.", "كتدخل فنص الطول، ماشي على فروة الراس فهاد الرواية."),
      c("Les doigts descendent sans faire de nœuds.", "تنزل الأصابع بلا عقد.", "الصباع كينزلو بلا عقد."),
      c("Le rinçage dure jusqu'à la disparition du grain.", "يدوم الشطف حتى يختفي الحبيبات.", "الشطف كيدوم حتى يغيبو الحبيبات."),
    ],
    usage: c("Jour de lavage complet. Le récit s'arrête au rinçage clair.", "يوم غسل كامل. تتوقف الرواية عند الشطف الصافي.", "نهار غسل كامل. الرواية كتوقف فالشطف الصافي."),
    caution: c(
      "La voix dit de ne pas laisser sécher cette pâte dans les longueurs. Elle craint les paquets, pas un effet annoncé.",
      "تقول الصوت ألا تُترك هذه العجينة لتجف في الخصل. تخشى التكتّل، لا أثراً معلناً.",
      "الصوت كتقول ما تتخلاش هاد العجينة تنشف فالخصل. خايفة من التكتّل، ماشي من أثر معلن.",
    ),
  }),
  sheet({
    title: c("Sidr dans la dernière eau", "السدر في الماء الأخير", "السدر فالماء الأخير"),
    summary: c(
      "Des feuilles de sidr pilées infusent dans l'eau du dernier rinçage. Les cheveux passent dans cette eau, puis sont essorés.",
      "أوراق سدر مدقوقة تنقع في ماء الشطف الأخير. يمر الشعر في هذا الماء ثم يُعصر.",
      "ورق السدر مدقوق كينقع فماء الشطف الأخير. الشعر كيدوز فهاد الماء ومن بعد كيتعصر.",
    ),
    origin: c("Repère éditorial : cour, arbre cité sans adresse", "علامة تحريرية: فناء، شجرة مذكورة بلا عنوان", "علامة تحريرية: فناء، شجرة مذكورة بلا عنوان"),
    voice,
    history: c(
      "La voix parle de feuilles sèches gardées dans un tissu. Elle les écrase, les jette dans une bassine d'eau chaude, attend que l'eau prenne une couleur, retire les morceaux à la main, et y plonge les longueurs. Elle ne boit pas cette eau. Elle dit seulement que les cheveux « se démêlent mieux » dans son habitude, sans mesure et sans preuve apportée par la fiche.",
      "تتكلم الصوت عن أوراق جافة محفوظة في قماش. تهرسها، ترميها في طست ماء ساخن، تنتظر أن يأخذ الماء لوناً، تخرج القطع باليد، وتغمس الخصل. لا تشرب هذا الماء. تقول فقط إن الشعر «يُمشط أيسر» في عادتها، بلا قياس وبلا دليل تقدمه البطاقة.",
      "الصوت كتهضر على ورق ناشف مخزّن فتوب. كتهرسو، كترميه فطاس ماء سخون، كتسنا الماء ياخد لون، كتخرج القطع باليد، وكتغمّس الخصل. ما كتشربش هاد الماء. كتقول غير الشعر «كيتمشط أسهل» فعادتها، بلا قياس وبلا دليل كتقدمو البطاقة.",
    ),
    ingredients: [
      { name: c("Feuilles de sidr", "أوراق السدر", "ورق السدر"), note: c("Sèches, pilées, retirées avant le passage des cheveux.", "جافة، مدقوقة، تُخرج قبل مرور الشعر.", "ناشفة، مدقوقة، كتخرج قبل ما يدوز الشعر.") },
      { name: c("Eau chaude", "ماء ساخن", "ماء سخون"), note: c("Une bassine. Le volume n'est pas dit.", "طست واحد. الحجم غير مذكور.", "طاس واحد. الحجم ما مذكورش.") },
    ],
    steps: [
      c("Les feuilles sont écrasées sèches.", "تُهرس الأوراق جافة.", "الورق كيتهرس ناشف."),
      c("L'eau est filtrée à la main avant les cheveux.", "يُصفّى الماء باليد قبل الشعر.", "الماء كيتصفى باليد قبل الشعر."),
      c("Les longueurs trempent, les yeux restent dehors.", "تنقع الخصل، وتبقى العينان خارج الماء.", "الخصل كينقعو، والعينين كيبقاو برا الماء."),
      c("L'essorage finit le geste. Pas de deuxième produit.", "العصر يختم الحركة. لا منتج ثانٍ.", "العصر كيسد الحركة. حتى منتج ثاني."),
    ],
    usage: c("Dernier rinçage d'un jour de lavage. Le récit ne le présente pas comme un traitement.", "الشطف الأخير في يوم غسل. لا تقدمه الرواية كعلاج.", "الشطف الأخير فنهار غسل. الرواية ما كتقدموش كعلاج."),
    caution: c(
      "La voix retire les morceaux pour qu'ils ne restent pas dans les cheveux et ne met pas cette eau près des yeux. Démonstration.",
      "تخرج الصوت القطع حتى لا تبقى في الشعر ولا تقرّب هذا الماء من العينين. عرض.",
      "الصوت كتخرج القطع باش ما يبقاوش فالشعر وما تقرّبش هاد الماء للعينين. عرض.",
    ),
  }),
  sheet({
    title: c("Olive tiède entre les mains", "زيتون فاتر بين الكفين", "زيتون فاتر بين الكفين"),
    summary: c(
      "L'huile d'olive est tiédie entre les paumes, jamais sur le feu dans ce récit, puis posée sur les pointes sèches.",
      "يُدفأ زيت الزيتون بين الراحتين، لا على النار في هذه الرواية، ثم يوضع على أطراف جافة.",
      "زيت الزيتون كيسخن بين الكفين، ماشي على العافية فهاد الرواية، ومن بعد كيتحط على أطراف ناشفة.",
    ),
    origin: c("Repère éditorial : cuisine, bouteille du quotidien", "علامة تحريرية: المطبخ، قارورة يومية", "علامة تحريرية: الكوزينة، قارورة يومية"),
    voice,
    history: c(
      "La bouteille est celle de la cuisine. La voix en verse peu dans une cuillère, verse la cuillère dans sa main, et frotte jusqu'à ce que l'huile ne soit plus froide. Elle la pose sur les pointes un soir où les cheveux sont secs, pas le jour du henné. Elle dit que chauffer la bouteille entière « sent le brûlé » et elle ne le fait pas.",
      "القارورة قارورة المطبخ. تصب الصوت قليلاً في ملعقة، ثم في يدها، وتحك حتى لا يبقى الزيت بارداً. تضعه على الأطراف في مساء يكون الشعر فيه جافاً، لا في يوم الحناء. تقول إن تسخين القارورة كلها «رائحته احتراق» ولا تفعل ذلك.",
      "القارورة قارورة الكوزينة. الصوت كتصب شوية فالمعالقة، ومن بعد فيدها، وكتحك حتى الزيت ما يبقاش بارد. كتحطو على الأطراف فعشية الشعر ناشف، ماشي فنهار الحنا. كتقول سخون القارورة كلها «ريحتو محروق» وما كديروش.",
    ),
    ingredients: [
      { name: c("Huile d'olive", "زيت الزيتون", "زيت الزيتون"), note: c("Une cuillère non rase, jugée à l'œil. Pas un dosage.", "ملعقة غير مكدوسة، بالعين. ليس مقداراً.", "معالقة ما مكدوساش، بالعين. ماشي مقدار.") },
    ],
    steps: [
      c("L'huile passe de la cuillère aux paumes.", "ينتقل الزيت من الملعقة إلى الراحتين.", "الزيت كيدوز من المعالقة للكفين."),
      c("Les mains le tiédissent. La bouteille ne va pas au feu.", "الكفّان يدفّئانه. لا تذهب القارورة إلى النار.", "الكفين كيسخّنوه. القارورة ما كتمشيش للعافية."),
      c("Seules les pointes sèches sont touchées.", "لا تُلمس إلا الأطراف الجافة.", "غير الأطراف الناشفة اللي كتلمس."),
      c("Les cheveux ne sont pas enfermés ensuite.", "لا يُغطى الشعر بعد ذلك.", "الشعر ما كيتغطاش من بعد."),
    ],
    usage: c("Soir de cheveux secs, hors jour de henné. Habitude racontée, sans effet annoncé.", "مساء شعر جاف، خارج يوم الحناء. عادة مروية، بلا أثر معلن.", "عشية شعر ناشف، برا نهار الحنا. عادة مروية، بلا أثر معلن."),
    caution: c("Le récit refuse l'huile chaude et le feu sous la bouteille. Il ne dit pas d'en mettre sur le cuir.", "ترفض الرواية الزيت الساخن والنار تحت القارورة. لا تقول بوضعه على الفروة.", "الرواية كترفض الزيت السخون والعافية تحت القارورة. ما كتقولش يتحط على الفروة."),
  }),
  sheet({
    title: c("Avoine sur les longueurs", "شوفان على الخصل", "شوفان على الخصل"),
    summary: c(
      "La farine humide d'avoine du visage est racontée ici sur les longueurs, avec un rinçage encore plus long.",
      "يُروى هنا دقيق الشوفان الرطب المستعمل للوجه على الخصل، بشطف أطول.",
      "هنا كيتّروى دقيق الشوفان الرطب ديال الوجه على الخصل، بشطف أطول.",
    ),
    origin: c("Repère éditorial : même cuisine fictive", "علامة تحريرية: المطبخ الوهمي نفسه", "علامة تحريرية: نفس الكوزينة الوهمية"),
    voice,
    history: c(
      "La voix reprend le bol de l'avoine, mais elle ne frotte pas le cuir. Elle plaque la pâte sur les longueurs mouillées, attend « le temps de ranger la cuisine », et rince en passant les doigts comme un peigne. Elle dit que les miettes sont plus difficiles à enlever des cheveux que du visage. C'est tout le récit.",
      "تعود الصوت إلى إناء الشوفان، لكنها لا تحك الفروة. تلصق العجينة على خصل مبللة، تنتظر «مدة ترتيب المطبخ»، وتشطف بتمرير الأصابع كمشط. تقول إن الفتات أصعب نزعاً من الشعر منه من الوجه. هذه كل الرواية.",
      "الصوت كترجع لزلافة الشوفان، ولكن ما كتحكّش الفروة. كتلصق العجينة على خصل مبللة، كتسنا «مدة ترتيب الكوزينة»، وكتشطف بدوزة الصباع كمشط. كتقول الفتات صعب يتنحى من الشعر كتر من الوجه. هادي كل الرواية.",
    ),
    ingredients: [
      { name: c("Flocons écrasés", "رقائق مهروسة", "رقائق مهرسة"), note: c("Le même bol que le visage, raconté à part.", "الإناء نفسه المستعمل للوجه، مروي على حدة.", "نفس الزلافة ديال الوجه، مروية بوحدها.") },
    ],
    steps: [
      c("Les longueurs sont mouillées d'abord.", "تُبلل الخصل أولاً.", "الخصل كيتبللو اللول."),
      c("La pâte ne monte pas au cuir.", "لا تصعد العجينة إلى الفروة.", "العجينة ما كتطلعش للفروة."),
      c("L'attente est celle du rangement, non minutée.", "الانتظار مدة الترتيب، بلا دقائق.", "التسنا مدة الترتيب، بلا دقايق."),
      c("Les doigts peignent sous l'eau jusqu'à ce qu'il n'y ait plus de miettes.", "تمشط الأصابع تحت الماء حتى تختفي الفتات.", "الصباع كيمشطو تحت الماء حتى يغيب الفتات."),
    ],
    usage: c("Variante de cuisine, rare dans la bouche de la voix.", "شكل مطبخي، نادر على لسان الصوت.", "شكل ديال الكوزينة، نادر فكلام الصوت."),
    caution: c("Le récit insiste seulement sur les miettes qui restent. Il ne propose pas de recommencer souvent.", "تشدد الرواية فقط على الفتات الباقي. لا تقترح التكرار كثيراً.", "الرواية كتأكّد غير على الفتات اللي بقا. ما كتقترحش التكرار بزاف."),
  }),
  sheet({
    title: c("Romarin dans l'eau", "إكليل الجبل في الماء", "الأزير فالماء"),
    summary: c(
      "Des brins infusent dans l'eau de rinçage. Le récit ne dit pas de boire cette eau ni d'en extraire une huile.",
      "تنقع عيدان في ماء الشطف. لا تقول الرواية بشرب هذا الماء ولا باستخراج زيت منه.",
      "عيدان كينقعو فماء الشطف. الرواية ما كتقولش يتشرب هاد الماء ولا يتخرج منو زيت.",
    ),
    origin: c("Repère éditorial : rebord de fenêtre", "علامة تحريرية: حافة نافذة", "علامة تحريرية: حافة الشرجم"),
    voice,
    history: c(
      "La voix coupe trois ou quatre brins, elle ne compte pas vraiment, et les laisse dans l'eau chaude du rinçage le temps que l'odeur monte. Elle retire les tiges avant de pencher la tête. Elle aime l'odeur dans la pièce. Elle ne parle pas d'avaler, ni de concentrer, ni de garder l'infusion pour le lendemain.",
      "تقص الصوت ثلاث أو أربع عيدان، بلا حساب دقيق، وتتركها في ماء الشطف الساخن حتى تعلو الرائحة. تخرج العيدان قبل أن تحني الرأس. تحب الرائحة في الغرفة. لا تتكلم عن البلع ولا عن التركيز ولا عن حفظ النقيع للغد.",
      "الصوت كتقص تلاتة ولا ربعة د العيدان، بلا حساب مضبوط، وكتخليهم فماء الشطف السخون حتى تطلع الريحة. كتخرج العيدان قبل ما تحني الراس. كتعجبها الريحة فالبيت. ما كتهضرش على الشراب ولا على التركيز ولا على تخزان النقيع لغدا.",
    ),
    ingredients: [
      { name: c("Brins de romarin", "عيدان إكليل", "عيدان الأزير"), note: c("Quelques tiges, retirées avant les cheveux.", "بضع عيدان، تُخرج قبل الشعر.", "شي عيدان، كيخرجو قبل الشعر.") },
    ],
    steps: [
      c("Les brins infusent dans l'eau chaude.", "تنقع العيدان في الماء الساخن.", "العيدان كينقعو فالماء السخون."),
      c("Les tiges sortent avant la tête.", "تخرج العيدان قبل الرأس.", "العيدان كيخرجو قبل الراس."),
      c("Les longueurs passent dans l'eau parfumée.", "تمر الخصل في الماء المعطّر.", "الخصل كيدوزو فالماء المعطّر."),
      c("L'eau est jetée. Elle ne se boit pas.", "يُرمى الماء. لا يُشرب.", "الماء كيتكب. ما كيتشربش."),
    ],
    usage: c("Rinçage d'odeur, raconté pour la pièce autant que pour les cheveux.", "شطف رائحة، يُروى للغرفة بقدر ما يُروى للشعر.", "شطف ديال الريحة، مروي للبيت قد ما مروي للشعر."),
    caution: c(
      "Le récit écarte les yeux et interdit de boire l'infusion ou d'en faire une huile. Démonstration.",
      "تبعد الرواية العينين وتمنع شرب النقيع أو تحويله إلى زيت. عرض.",
      "الرواية كتبعد العينين وكاتمنع شراب النقيع ولا تحويلو لزيت. عرض.",
    ),
  }),
  sheet({
    title: c("Savon doux puis peigne", "صابون لطيف ثم مشط", "صابون خفيف ومن بعد مشط"),
    summary: c(
      "Un savon doux mousse dans les longueurs, le peigne de bois vient seulement après le rinçage, en commençant par les pointes.",
      "يرغو صابون لطيف في الخصل، ولا يأتي المشط الخشبي إلا بعد الشطف، بدءاً من الأطراف.",
      "صابون خفيف كيرغب فالخصل، والمشط د الخشب ما كيجيش حتى من بعد الشطف، من الأطراف.",
    ),
    origin: c("Repère éditorial : chambre", "علامة تحريرية: الغرفة", "علامة تحريرية: البيت"),
    voice,
    history: c(
      "La voix refuse le peigne sur des cheveux encore savonnés. Elle rince, essore dans une serviette, et commence le peigne tout en bas, en tenant la longueur au-dessus pour ne pas tirer le cuir. Le peigne est en bois, large. Si un nœud résiste, elle s'arrête et reprend plus bas. Le récit ne nomme pas de marque.",
      "ترفض الصوت المشط على شعر ما زال عليه صابون. تشطف، تعصر في منشفة، وتبدأ المشط من الأسفل، ماسكة الطول من فوق حتى لا تجذب الفروة. المشط خشبي وعريض. إذا قاومت عقدة تتوقف وتعود من الأسفل. لا تسمّي الرواية أي علامة.",
      "الصوت كترفض المشط على شعر باقي فيه الصابون. كتشطف، كتعصر فمنشفة، وكتبدا المشط من التحت، شدّة الطول من الفوق باش ما تجبدش الفروة. المشط د الخشب وعريض. إلا عقدة قاومات كتوقف وترجع من التحت. الرواية ما كتسميش حتى ماركة.",
    ),
    ingredients: [
      { name: c("Savon doux", "صابون لطيف", "صابون خفيف"), note: c("Mousse seulement. Pas le savon noir du hammam.", "رغوة فقط. ليس الصابون الأسود للحمام.", "غير الرغوة. ماشي الصابون الكحل د الحمام.") },
      { name: c("Peigne de bois", "مشط خشب", "مشط د الخشب"), note: c("Large. Il entre après le rinçage.", "عريض. يدخل بعد الشطف.", "عريض. كيدخل من بعد الشطف.") },
    ],
    steps: [
      c("Le savon mousse et part entièrement au rinçage.", "يرغو الصابون ويخرج كله في الشطف.", "الصابون كيرغب وكيخرج كلو فالشطف."),
      c("La serviette essore sans tordre fort.", "تعصر المنشفة بلا ليّ شديد.", "المنشفة كتعصر بلا ليّ قوي."),
      c("Le peigne part des pointes.", "يبدأ المشط من الأطراف.", "المشط كيبدا من الأطراف."),
      c("Un nœud qui résiste arrête la main.", "عقدة تقاوم توقف اليد.", "عقدة قاومات كتوقف اليد."),
    ],
    usage: c("Lavage ordinaire, raconté pour ne pas arracher.", "غسل عادي، يُروى حتى لا يُنتف الشعر.", "غسل عادي، مروي باش ما يتنتفش الشعر."),
    caution: c("Le récit interdit le peigne sur cheveux savonnés et le tirage depuis les racines.", "تمنع الرواية المشط على الشعر المصبن والجذب من الأصول.", "الرواية كاتمنع المشط على الشعر المصبن والجبد من الأصول."),
  }),
  sheet({
    title: c("Jusqu'à l'eau nette", "حتى يصير الماء صافياً", "حتى الماء يولي صافي"),
    summary: c(
      "Quel que soit le geste d'avant, la voix ne s'arrête que lorsque l'eau des cheveux coule claire.",
      "مهما كانت الحركة السابقة، لا تتوقف الصوت إلا حين يجري ماء الشعر صافياً.",
      "كيف ما كانت الحركة اللي قبل، الصوت ما كتوقف حتى يجري ماء الشعر صافي.",
    ),
    origin: c("Repère éditorial : fin de lavage", "علامة تحريرية: نهاية الغسل", "علامة تحريرية: سالية الغسل"),
    voice,
    history: c(
      "Cette fiche ferme les autres gestes des cheveux. Henné, ghassoul, avoine ou savon : la voix regarde l'eau dans le creux de la bassine. Tant qu'elle est colorée ou granuleuse, elle rince encore. Elle ne met rien après si l'eau n'est pas nette. C'est un critère du récit, pas une mesure de laboratoire.",
      "تختم هذه البطاقة حركات الشعر الأخرى. حناء أو غاسول أو شوفان أو صابون: تنظر الصوت إلى الماء في قاع الطست. ما دام ملوناً أو محبباً تواصل الشطف. لا تضع شيئاً بعد ذلك إذا لم يصفُ الماء. هذا معيار الرواية، لا قياس مختبر.",
      "هاد البطاقة كتسد حركات الشعر الأخرى. حنا ولا غاسول ولا شوفان ولا صابون: الصوت كتشوف الماء فقاع الطاس. ما دام ملون ولا محبب كتكمل الشطف. ما كتحط حتى حاجة من بعد إلا ما صفا الماء. هذا معيار الرواية، ماشي قياس مختبر.",
    ),
    ingredients: [
      { name: c("Eau", "ماء", "ماء"), note: c("Autant de rinçages que l'eau le demande dans le récit.", "عدد الشطفات الذي يطلبه الماء في الرواية.", "قد الشطفات اللي الماء طلب فرواية.") },
    ],
    steps: [
      c("La bassine est regardée, pas seulement les cheveux.", "يُنظر إلى الطست، لا إلى الشعر وحده.", "الطاس كيتشاف، ماشي غير الشعر."),
      c("Couleur ou grain : on continue.", "لون أو حبيبات: نواصل.", "لون ولا حبيبات: نكمّلو."),
      c("Eau claire : le geste peut s'arrêter.", "ماء صافٍ: يمكن أن تتوقف الحركة.", "ماء صافي: الحركة تقدر توقف."),
      c("Rien n'est ajouté avant ce moment.", "لا يُضاف شيء قبل هذه اللحظة.", "حتى حاجة ما كتزاد قبل هاد اللحظة."),
    ],
    usage: c("Critère de fin, commun aux fiches des cheveux de cette démonstration.", "معيار نهاية، مشترك بين بطاقات الشعر في هذا العرض.", "معيار النهاية، مشترك بين بطاقات الشعر فهاد العرض."),
    caution: c("La voix ne frotte pas le cuir pour accélérer la clarté de l'eau.", "لا تحك الصوت الفروة لتسريع صفاء الماء.", "الصوت ما كتحكّش الفروة باش تسرّع صفاء الماء."),
  }),
  sheet({
    title: c("Le linge sur la tête", "القماش على الرأس", "التوب على الراس"),
    summary: c(
      "Après le henné ou le ghassoul, un linge couvre les cheveux sans être noué serré. Il tient le temps du récit, puis part au rinçage.",
      "بعد الحناء أو الغاسول، يغطي قماش الشعر بلا عقد مشدود. يبقى مدة الرواية ثم يُرفع عند الشطف.",
      "من بعد الحنا ولا الغاسول، توب كيغطي الشعر بلا عقدة مشدودة. كيبقا مدة الرواية ومن بعد كيتنحى فالشطف.",
    ),
    origin: c("Repère éditorial : maison", "علامة تحريرية: البيت", "علامة تحريرية: الدار"),
    voice,
    history: c(
      "La voix choisit un linge déjà lavé, pas celui du sol. Elle le pose sur la tête, le coin sous la nuque, sans épingle. Elle dit qu'un nœud trop serré fait mal aux tempes. Quand vient le rinçage, le linge part à la bassine à part, parce qu'il a pris la couleur. La fiche ne donne pas de durée autre que « le temps du repas » déjà dit pour le henné.",
      "تختار الصوت قماشاً مغسولاً، لا الذي على الأرض. تضعه على الرأس، طرفه تحت القفا، بلا دبوس. تقول إن العقدة الشديدة تؤلم الصدغين. عند الشطف يذهب القماش إلى طست وحده لأنه أخذ اللون. لا تعطي البطاقة مدة غير «مدة الأكل» المذكورة للحناء.",
      "الصوت كتختار توب مغسول، ماشي اللي فالأرض. كتحطو على الراس، طرفو تحت القفا، بلا دبوس. كتقول العقدة المشدودة كتوجع الصدغين. فالشطف التوب كيمشي لطاس بوحدو حيت خدا اللون. البطاقة ما كتعطيش مدة غير «مدة الماكلة» اللي تقالات للحنا.",
    ),
    ingredients: [
      { name: c("Linge lavé", "قماش مغسول", "توب مغسول"), note: c("Sans épingle et sans nœud serré.", "بلا دبوس وبلا عقدة مشدودة.", "بلا دبوس وبلا عقدة مشدودة.") },
    ],
    steps: [
      c("Le linge est propre avant de toucher les cheveux.", "يكون القماش نظيفاً قبل لمس الشعر.", "التوب يكون نقي قبل ما يمس الشعر."),
      c("Il couvre sans serrer les tempes.", "يغطي بلا شد الصدغين.", "كيغطي بلا ما يشد الصدغين."),
      c("Il part au rinçage, dans une eau à part.", "يذهب عند الشطف إلى ماء مستقل.", "كيمشي فالشطف لماء بوحدو."),
      c("La durée reste celle déjà dite dans le geste du henné, ou n'est pas dite.", "تبقى المدة تلك المذكورة في حركة الحناء، أو لا تُذكر.", "المدة كتبقى اللي تقالات فحركة الحنا، ولا ما تتقالش."),
    ],
    usage: c("Couverture pendant l'attente, pas un geste isolé.", "تغطية مدة الانتظار، ليست حركة مستقلة.", "تغطية مدة التسنا، ماشي حركة بوحدها."),
    caution: c("Le récit refuse l'épingle et le tissu sale. Il ne dit pas de dormir avec le henné.", "ترفض الرواية الدبوس والقماش الوسخ. لا تقول بالنوم والحناء على الرأس.", "الرواية كترفض الدبوس والتوب الوسخ. ما كتقولش النعاس والحنا على الراس."),
  }),
];
