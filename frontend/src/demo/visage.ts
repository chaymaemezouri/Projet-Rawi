import { c, sheet, type Body } from "./sheet";

const voice = c(
  "La voix de cette fiche est une gardienne de maison, figure fictive. Aucune personne réelle n'est nommée.",
  "صوت هذه البطاقة ربة بيت، شخصية وهمية. لا يُذكر أي شخص حقيقي.",
  "الصوت فهاد البطاقة مولات الدار، شخصية وهمية. حتى شخص حقيقي ما متسمّاش.",
);

export const VISAGE: Body[] = [
  sheet({
    title: c("Ghassoul après le savon", "الغاسول بعد الصابون", "الغاسول من بعد الصابون"),
    summary: c(
      "Le ghassoul n'arrive qu'une fois le visage déjà savonné. La pâte se fait au bol, sans poids, et le rinçage ferme le geste.",
      "لا يأتي الغاسول إلا بعد غسل الوجه بالصابون. تُعجن العجينة في إناء بلا وزن، والشطف يختم الحركة.",
      "الغاسول ما كيجيش حتى يكون الوجه تغسل بالصابون. العجينة كتكون فالزلافة بلا وزن، والشطف كيسد الحركة.",
    ),
    origin: c("Repère éditorial : hammam et maison, Maghreb", "علامة تحريرية: الحمام والبيت، المغرب الكبير", "علامة تحريرية: الحمام والدار، المغرب الكبير"),
    voice,
    history: c(
      "La gardienne fictive place ce geste après le savon beldi, jamais sur un visage encore sec. Elle prend du ghassoul dans la paume, le délaye avec de l'eau jusqu'à une pâte qui tient sans couler, et l'étend en contournant les yeux. Elle le laisse le temps d'une conversation, puis rince à pleines mains, sans gratter. Le récit ne donne ni gramme ni minute.",
      "تضع الشخصية الوهمية هذه الحركة بعد الصابون البلدي، لا على وجه ما زال جافاً. تأخذ غاسولاً في الراحة، تذوّبه بالماء حتى عجينة تتماسك ولا تسيل، وتمدّه بعيداً عن العينين. تتركه مدة كلام، ثم تشطف بالكفين من غير حك. الرواية لا تعطي غراماً ولا دقيقة.",
      "الشخصية الوهمية كتحط هاد الحركة من بعد الصابون البلدي، ماشي على وجه باقي ناشف. كتخد الغاسول فالكف، كتذوّبو بالماء حتى عجينة شدّانة وما كتسيلش، وكتفرّدو بعيد على العينين. كتخليه مدة الهضرة، ومن بعد كتشطف بالكفين بلا حك. الرواية ما كتعطيش لا غرام لا دقيقة.",
    ),
    ingredients: [
      { name: c("Ghassoul", "غاسول", "غاسول"), note: c("Cité en pâte. Aucun poids n'est écrit.", "مذكور كعجينة. لا وزن مكتوب.", "مذكور كعجينة. حتى وزن ما مكتوب.") },
      { name: c("Eau", "ماء", "ماء"), note: c("Sert à délayer. La quantité reste celle du bol, non chiffrée.", "يُستخدم للذوبان. الكمية تبقى كمية الإناء، بلا رقم.", "كيتستعمل للذوبان. الكمية كتبقى كمية الزلافة، بلا رقم.") },
      { name: c("Savon beldi", "صابون بلدي", "صابون بلدي"), note: c("Il précède l'argile dans le récit. Il n'est pas mélangé au ghassoul.", "يسبق الطين في الرواية. لا يُخلط بالغاسول.", "كيجي قبل الطين فالرواية. ما كيتخلطش مع الغاسول.") },
    ],
    steps: [
      c("Le visage est d'abord passé au savon, puis rincé grossièrement.", "يُغسل الوجه أولاً بالصابون ثم يُشطف شطفاً أولياً.", "الوجه كيتغسل اللول بالصابون ومن بعد كيتشطف شطف أول."),
      c("Le ghassoul est délayé dans le bol jusqu'à tenir sur le doigt.", "يُذاب الغاسول في الإناء حتى يثبت على الإصبع.", "الغاسول كيتذاب فالزلافة حتى يثبت على الصبع."),
      c("La pâte couvre le visage en évitant les yeux et les lèvres.", "تغطي العجينة الوجه مع تجنّب العينين والشفتين.", "العجينة كتغطي الوجه وكتجنّب العينين والشفايف."),
      c("Le rinçage se fait à l'eau, sans frotter jusqu'à rougir.", "يكون الشطف بالماء، من غير فرك حتى الاحمرار.", "الشطف كيكون بالماء، بلا فرك حتى يحمار."),
    ],
    usage: c(
      "Le récit situe le geste au hammam ou dans la salle d'eau, après la chaleur. Il l'associe à une sensation de propre, sans promettre un effet sur la peau.",
      "تضع الرواية الحركة في الحمام أو في بيت الماء، بعد الحرارة. تربطها بإحساس النظافة، بلا وعد بأثر على البشرة.",
      "الرواية كتحط الحركة فالحمام ولا فبيت الماء، من بعد السخونية. كتربطها بإحساس النظافة، بلا وعد بأثر على البشرة.",
    ),
    caution: c(
      "La voix dit de ne pas laisser l'argile jusqu'à ce qu'elle craquèle, et de ne pas l'approcher des yeux. Ceci décrit le récit. Ce n'est pas une consigne à suivre.",
      "تقول الصوت ألا يُترك الطين حتى يتشقق، وألا يُقرب من العينين. هذا يصف الرواية. ليست تعليمة تُتّبع.",
      "الصوت كيقول ما يتخلاش الطين حتى يتشقق، وما يتقربش للعينين. هذا كيوصف الرواية. ماشي تعليمة تتبع.",
    ),
  }),
  sheet({
    title: c("Eau de rose au coton", "ماء الورد على قطعة قماش", "ما الورد على قطعة توب"),
    summary: c(
      "Après le rinçage, un coton ou un coin de linge trempe dans l'eau de rose et passe sur le visage, sans en boire et sans chiffre de cuillères.",
      "بعد الشطف، تُبلَّل قطعة قماش بماء الورد وتُمرَّر على الوجه، بلا شرب وبلا عدد ملاعق.",
      "من بعد الشطف، كتبل قطعة توب بما الورد وكدوز على الوجه، بلا شراب وبلا عدد المعالق.",
    ),
    origin: c("Repère éditorial : flacon d'eau florale, médina", "علامة تحريرية: قارورة ماء زهر، مدينة عتيقة", "علامة تحريرية: قارورة ما الزهر، المدينة القديمة"),
    voice,
    history: c(
      "La même voix fictive sort un petit flacon après le ghassoul. Elle ne vaporise pas : elle mouille un coin de linge propre et le passe du front vers le menton, puis derrière les oreilles. Elle dit que l'eau de rose sent la maison les jours de visite. Le récit ne nomme ni distillateur ni village précis, seulement « l'eau de rose de la maison ».",
      "تخرج الشخصية الوهمية نفسها قارورة صغيرة بعد الغاسول. لا ترشّ: تبلّ طرف قماش نظيف وتمرّره من الجبين إلى الذقن، ثم خلف الأذنين. تقول إن ماء الورد رائحة البيت في أيام الزيارة. لا تسمّي الرواية معمل تقطير ولا قرية، فقط «ماء ورد البيت».",
      "نفس الشخصية الوهمية كتخرج قارورة صغيرة من بعد الغاسول. ما كترشّش: كتبل طرف توب نقي وكتدوّزو من الجبهة للذقن، ومن بعد مورا الودنين. كتقول ما الورد هو ريحة الدار فأيام الزيارة. الرواية ما كتسميش معمل ولا قرية، غير «ما ورد الدار».",
    ),
    ingredients: [
      { name: c("Eau de rose", "ماء الورد", "ما الورد"), note: c("Quelques passages de linge. Aucun volume n'est dit.", "بضع تمريرات قماش. لا حجم مذكور.", "شي دوزات د التوب. حتى حجم ما مذكور.") },
      { name: c("Linge propre", "قماش نظيف", "توب نقي"), note: c("Remplace le vaporisateur dans ce récit.", "يحلّ محل البخاخ في هذه الرواية.", "كيعوّض الرشاش فهاد الرواية.") },
    ],
    steps: [
      c("Le visage est déjà rincé et encore humide.", "الوجه مشطوف وما زال رطباً.", "الوجه متشطّف وباقي رطب."),
      c("Le coin du linge trempe dans le flacon, sans le vider.", "يُغمس طرف القماش في القارورة دون إفراغها.", "طرف التوب كيتغمّس فالقارورة بلا ما يفرّغها."),
      c("Le passage va du front au menton, puis au cou.", "التمرير من الجبين إلى الذقن ثم العنق.", "الدوزة من الجبهة للذقن ومن بعد للعنق."),
      c("Le linge ne revient pas dans le flacon.", "لا يُعاد القماش إلى القارورة.", "التوب ما كيرجعش للقارورة."),
    ],
    usage: c(
      "Le geste clôt la toilette du visage les jours de visite. Le récit parle d'odeur et de fraîcheur, pas d'un résultat sur la peau.",
      "تختم الحركة غسل الوجه في أيام الزيارة. تتكلم الرواية عن الرائحة والانتعاش، لا عن نتيجة على البشرة.",
      "الحركة كتسد غسيل الوجه فأيام الزيارة. الرواية كتهضر على الريحة والبرودة، ماشي على نتيجة على البشرة.",
    ),
    caution: c(
      "La voix écarte les yeux. Elle ne dit pas d'avaler l'eau de rose. Ceci reste une description de démonstration.",
      "تبعد الصوت العينين. لا تقول بابتلاع ماء الورد. يبقى هذا وصفاً للعرض.",
      "الصوت كيبعد العينين. ما كيقولش يتشرب ما الورد. هذا كيبقا وصف ديال العرض.",
    ),
  }),
  sheet({
    title: c("Fleur d'oranger après le rinçage", "زهر النارنج بعد الشطف", "زهر النارنج من بعد الشطف"),
    summary: c(
      "L'eau de fleur d'oranger arrive en dernier, dans les mains en coupe, pour le visage et les tempes.",
      "يأتي ماء زهر النارنج في الآخر، في كفين مضمومتين، للوجه والصدغين.",
      "ما زهر النارنج كيجي فالآخر، فالكفين مجموعين، للوجه والصدغين.",
    ),
    origin: c("Repère éditorial : cours et jardins du Maghreb", "علامة تحريرية: أفنية وحدائق المغرب الكبير", "علامة تحريرية: الفناوي والجرادن د المغرب الكبير"),
    voice,
    history: c(
      "Dans ce récit de démonstration, la fleur d'oranger n'est pas un masque. La voix en garde une bouteille à part du savon. Après le rinçage, elle en verse un peu dans le creux des mains, souffle dessus parce qu'elle la dit froide, et la passe sur le front et les tempes. Elle raconte que sa mère fictive en mettait aussi sur l'oreiller les soirs chauds. Aucune distillation n'est expliquée.",
      "في هذا العرض، زهر النارنج ليس قناعاً. تحتفظ الصوت بقارورة منفصلة عن الصابون. بعد الشطف تصب قليلاً في راحة اليدين، تنفخ عليه لأنها تقول إنه بارد، وتمرّره على الجبين والصدغين. تحكي أن أمها الوهمية كانت تضع منه على الوسادة في الليالي الحارة. لا يُشرح أي تقطير.",
      "فهاد العرض، زهر النارنج ماشي قناع. الصوت كتحفظ قارورة بوحدها بعيد على الصابون. من بعد الشطف كتصب شوية فالكفين، كتنفخ عليه حيت كتقول بارد، وكتدوّزو على الجبهة والصدغين. كتحكي أن أمها الوهمية كانت تحطو على المخدة فالليالي السخونين. حتى تقطير ما مشرّح.",
    ),
    ingredients: [
      { name: c("Eau de fleur d'oranger", "ماء زهر النارنج", "ما زهر النارنج"), note: c("Une verse dans les mains. Le récit refuse un nombre de gouttes.", "صبّة في الكفين. ترفض الرواية عدد القطرات.", "صبّة فالكفين. الرواية كترفض عدد القطرات.") },
    ],
    steps: [
      c("La bouteille reste bouchée jusqu'à la fin du savon.", "تبقى القارورة مغلقة حتى نهاية الصابون.", "القارورة كتبقى مسدودة حتى يسالي الصابون."),
      c("Une petite verse tient dans les deux paumes.", "صبّة صغيرة تكفي الراحتين.", "صبّة صغيرة كتكفي الكفين."),
      c("Le passage touche le front, les tempes, puis le cou.", "التمرير يلمس الجبين والصدغين ثم العنق.", "الدوزة كتمس الجبهة والصدغين ومن بعد العنق."),
      c("Le reste, s'il y en a, n'est pas gardé dans les mains pour plus tard.", "الباقي، إن وُجد، لا يُحفظ في اليدين لوقت لاحق.", "الباقي، إلا كان، ما كيتخزّنش فالكفين لوقت آخر."),
    ],
    usage: c(
      "Le récit lie ce geste aux soirs chauds et à la fin de la toilette. Il ne le présente pas comme un soin du sommeil.",
      "تربط الرواية الحركة بالليالي الحارة وبنهاية الغسل. لا تقدمها كعناية بالنوم.",
      "الرواية كتربط الحركة بالليالي السخونين وبسالية الغسل. ما كتقدمهاش كعناية بالنوم.",
    ),
    caution: c(
      "La voix ne met pas cette eau dans les yeux et ne la mélange pas au ghassoul dans le même bol. Description seulement.",
      "لا تضع الصوت هذا الماء في العينين ولا تخلطه بالغاسول في الإناء نفسه. وصف فقط.",
      "الصوت ما كتحطش هاد الماء فالعينين وما كتخلطوش مع الغاسول فنفس الزلافة. وصف غير.",
    ),
  }),
  sheet({
    title: c("Miel de la cuisine", "عسل المطبخ", "عسل الكوزينة"),
    summary: c(
      "Un récit de cuisine parle d'un peu de miel étendu au doigt sur le visage, puis retiré à l'eau tiède. Aucune cuillerée n'est comptée.",
      "رواية مطبخ تتكلم عن قليل من العسل يُمد بالإصبع على الوجه ثم يُزال بماء فاتر. لا تُحسب أي ملعقة.",
      "رواية الكوزينة كتهضر على شوية عسل كيتفرّد بالصبع على الوجه ومن بعد كيتنحى بما فاتر. حتى معالقة ما معدودة.",
    ),
    origin: c("Repère éditorial : cuisine de maison", "علامة تحريرية: مطبخ البيت", "علامة تحريرية: كوزينة الدار"),
    voice: c(
      "La voix est une cuisinière fictive, pas une personne identifiée.",
      "الصوت طبّاخة وهمية، ليست شخصاً معروفاً.",
      "الصوت طبّاخة وهمية، ماشي شخص معروف.",
    ),
    history: c(
      "Elle ouvre le pot qui sert au thé. Du bout du doigt elle prend ce qui tient, sans racler le fond, et l'étale sur les joues et le menton en laissant le tour des lèvres si la personne parle. Elle dit que le miel colle et qu'il faut une eau tiède, pas chaude, pour l'enlever. Le récit s'arrête au rinçage. Il ne parle ni de durée ni de bienfait.",
      "تفتح الوعاء المستعمل للشاي. بطرف الإصبع تأخذ ما يثبت، دون كشط القاع، وتمدّه على الخدين والذقن وتترك محيط الشفتين إذا كانت صاحبة الوجه تتكلم. تقول إن العسل يلصق وإن الماء الفاتر، لا الساخن، هو ما يزيله. تتوقف الرواية عند الشطف. لا تذكر مدة ولا فائدة.",
      "كتفتح القادوس اللي كيتستعمل لأتي. بطرف الصبع كتخد اللي ثبت، بلا ما تحك القاع، وكتفرّدو على الخدين والذقن وكتخلي داير الشفايف إلا كانت صاحبته كتهضر. كتقول العسل كيلصق والماء الفاتر، ماشي السخون، هو اللي كينحّيه. الرواية كتوقف فالشطف. ما كاتذكرش مدة ولا فائدة.",
    ),
    ingredients: [
      { name: c("Miel", "عسل", "عسل"), note: c("Ce qui tient au doigt. Le pot du thé n'est pas dosé.", "ما يثبت على الإصبع. وعاء الشاي غير مقدّر.", "اللي ثبت على الصبع. قادوس أتي ما مقادش.") },
      { name: c("Eau tiède", "ماء فاتر", "ماء فاتر"), note: c("Pour retirer le miel. La voix refuse l'eau très chaude.", "لإزالة العسل. ترفض الصوت الماء الشديد السخونة.", "باش يتنحى العسل. الصوت كترفض الماء السخون بزاف.") },
    ],
    steps: [
      c("Le visage est propre et sec, dans la cuisine, pas au hammam.", "الوجه نظيف وجاف، في المطبخ لا في الحمام.", "الوجه نقي وناشف، فالكوزينة ماشي فالحمام."),
      c("Le doigt prend le miel en surface.", "يأخذ الإصبع العسل من السطح.", "الصبع كيخد العسل من الفوق."),
      c("L'étalement évite les yeux et l'intérieur des lèvres.", "المدّ يتجنب العينين وداخل الشفتين.", "التفريد كيتجنّب العينين وداخل الشفايف."),
      c("L'eau tiède enlève le collant. Le récit ne dit pas de recommencer.", "الماء الفاتر يزيل اللصق. لا تقول الرواية بالإعادة.", "الماء الفاتر كينحّي اللصق. الرواية ما كتقولش تعاود."),
    ],
    usage: c(
      "Geste rare dans le récit, lié à un pot déjà ouvert pour le thé. Aucune promesse n'accompagne le miel.",
      "حركة نادرة في الرواية، مرتبطة بوعاء مفتوح أصلاً للشاي. لا وعد يرافق العسل.",
      "حركة نادرة فالرواية، مربوطة بقادوس محلول أصلاً لأتي. حتى وعد ما كيرافق العسل.",
    ),
    caution: c(
      "La voix dit que ça colle aux cheveux s'ils tombent sur le visage, et qu'il ne faut pas laisser le miel sécher au soleil. Ce n'est pas un protocole.",
      "تقول الصوت إنه يلتصق بالشعر إذا سقط على الوجه، وإن العسل لا يُترك ليجف في الشمس. ليس هذا بروتوكولاً.",
      "الصوت كتقول كيلصق فالشعر إلا طاح على الوجه، والعسل ما يتخلاش ينشف فالشمس. هذا ماشي بروتوكول.",
    ),
  }),
  sheet({
    title: c("Ghassoul plus clair", "غاسول أخف", "غاسول خف"),
    summary: c(
      "Une autre version met moins d'argile et plus d'eau, pour un visage que le récit dit « déjà tiré ».",
      "نسخة أخرى تضع طيناً أقل وماءً أكثر، لوجه تقول الرواية إنه «مشدود أصلاً».",
      "نسخة أخرى فيها طين قل وماء كتر، لوجه الرواية كتقول عليه «مشدود أصلاً».",
    ),
    origin: c("Repère éditorial : variante de maison", "علامة تحريرية: شكل منزلي", "علامة تحريرية: شكل ديال الدار"),
    voice,
    history: c(
      "La voix distingue deux ghassouls. Le premier est épais, après le hammam. Celui-ci est presque une eau trouble : elle laisse l'argile tomber au fond du bol et n'utilise que le dessus. Elle le passe vite, comme une dernière eau, et elle rince tout de suite. Elle dit le réserver aux jours où la peau tire déjà, sans expliquer pourquoi et sans mesurer.",
      "تميّز الصوت بين غاسولين. الأول كثيف بعد الحمام. هذا أقرب إلى ماء عكر: تترك الطين يهبط لقاع الإناء ولا تستعمل إلا الوجه. تمرّره بسرعة كأنه ماء أخير وتشطف فوراً. تقول إنها تبقيه للأيام التي تشدّ فيها البشرة، بلا تفسير وبلا قياس.",
      "الصوت كتفرّق بين جوج غاسولات. اللول تقيل من بعد الحمام. هذا قريب لماء عكر: كتخلي الطين يهبط لقاع الزلافة وما كتستعملش غير الفوق. كتدوزو بالزربة بحال ماء أخير وكتشطف دغيا. كتقول كتخلّيه للأيام اللي البشرة كاتشدّ، بلا تفسير وبلا قياس.",
    ),
    ingredients: [
      { name: c("Ghassoul", "غاسول", "غاسول"), note: c("Seul le liquide du dessus est pris. Le dépôt reste au bol.", "يُؤخذ سائل السطح فقط. الراسب يبقى في الإناء.", "كيتاخد غير الماء ديال الفوق. الراسب كيبقا فالزلافة.") },
      { name: c("Eau", "ماء", "ماء"), note: c("Plus présente que l'argile dans cette version. Toujours sans mesure.", "أكثر حضوراً من الطين في هذه النسخة. بلا مقدار دائماً.", "كتبان كتر من الطين فهاد النسخة. بلا مقدار ديما.") },
    ],
    steps: [
      c("L'argile repose au fond. La voix ne remue plus.", "يرقد الطين في القاع. لا تعود الصوت تحرّك.", "الطين كيرقد فالقاع. الصوت ما كتعاودش تحرّك."),
      c("Elle verse le dessus dans sa paume.", "تصب السطح في راحة يدها.", "كتصب الفوق فكفها."),
      c("Le passage est rapide, joues et front seulement.", "التمرير سريع، الخدان والجبهة فقط.", "الدوزة زربيّة، غير الخدين والجبهة."),
      c("Le rinçage suit aussitôt.", "يلي الشطف مباشرة.", "الشطف كيجي من بعدو دغيا."),
    ],
    usage: c(
      "Version courte, racontée pour un visage déjà inconfortable. Le récit ne dit pas que l'eau d'argile arrange quoi que ce soit.",
      "نسخة قصيرة، تُروى لوجه غير مرتاح أصلاً. لا تقول الرواية إن ماء الطين يصلح شيئاً.",
      "نسخة قصيرة، مروية لوجه مرتاحش أصلاً. الرواية ما كتقولش ماء الطين كيصلح شي حاجة.",
    ),
    caution: c(
      "La voix interdit de garder le dépôt épais pour « finir le bol ». Elle jette le fond. Description de démonstration.",
      "تمنع الصوت الاحتفاظ بالراسب الكثيف «لإنهاء الإناء». ترمي القاع. وصف للعرض.",
      "الصوت كاتمنع يتخزن الراسب التقيل باش «يسالي الزلافة». كترمي القاع. وصف ديال العرض.",
    ),
  }),
  sheet({
    title: c("Linge et pétales", "قماش وبتلات", "توب ووريقات"),
    summary: c(
      "Des pétales de rose sont posés sur un linge humide, puis le linge est tenu un moment contre les joues. Rien n'est écrasé en masque.",
      "توضع بتلات الورد على قماش رطب، ثم يُمسك القماش لحظة على الخدين. لا يُهرس شيء كقناع.",
      "وريقات الورد كيتحطو على توب رطب، ومن بعد التوب كيتشد شي لحظة على الخدين. حتى حاجة ما كتتهرس كقناع.",
    ),
    origin: c("Repère éditorial : cour intérieure", "علامة تحريرية: فناء داخلي", "علامة تحريرية: فناء داخلي"),
    voice,
    history: c(
      "La voix cueille, dans le récit, les pétales déjà tombés, pas les boutons. Elle les pose sur un linge qu'elle a passé sous l'eau froide et essoré. Elle tient ce paquet contre les joues « le temps de s'asseoir ». Ensuite elle secoue les pétales et étend le linge. Il n'y a pas de jus, pas de mixage, pas de temps compté.",
      "تقطف الصوت، في الرواية، البتلات الساقطة لا البراعم. تضعها على قماش مرّرته تحت ماء بارد وعصرته. تمسك هذه اللفّة على الخدين «مدة الجلوس». ثم تنفض البتلات وتنشر القماش. لا عصير ولا خلط ولا وقت محسوب.",
      "الصوت كتجبد، فالرواية، الوريقات اللي طاحو ماشي البراعم. كتحطهم على توب دازتو تحت ماء بارد وعصراته. كتشد هاد اللفّة على الخدين «مدة الجلوس». ومن بعد كتنفض الوريقات وكتنشر التوب. حتى عصير حتى خلط وحتى وقت محسوب.",
    ),
    ingredients: [
      { name: c("Pétales tombés", "بتلات ساقطة", "وريقات طايحين"), note: c("Ceux du sol du récit, non achetés, non pesés.", "التي على أرض الرواية، غير مشتراة وغير موزونة.", "اللي فالأرض د الرواية، ما مشريينش وما موزونينش.") },
      { name: c("Linge humide", "قماش رطب", "توب رطب"), note: c("Essoré. Il porte les pétales, il ne les broie pas.", "معصور. يحمل البتلات ولا يهرسها.", "معصور. كيشيل الوريقات وما كيهرسهمش.") },
    ],
    steps: [
      c("Seuls les pétales déjà tombés entrent dans le geste.", "لا تدخل الحركة إلا البتلات الساقطة.", "غير الوريقات اللي طاحو كيدخلو للحركة."),
      c("Le linge est mouillé à l'eau froide et essoré.", "يُبلل القماش بماء بارد ويُعصر.", "التوب كيتبل بماء بارد وكيتعصر."),
      c("Les pétales restent entiers sur le tissu.", "تبقى البتلات كاملة على القماش.", "الوريقات كيبقاو كاملين على التوب."),
      c("Le contact avec les joues dure le temps de s'asseoir, puis tout est retiré.", "يدوم لمس الخدين مدة الجلوس، ثم يُرفع كل شيء.", "لمس الخدين كيدوم مدة الجلوس، ومن بعد كلشي كيتنحى."),
    ],
    usage: c(
      "Geste d'après-midi dans la cour, raconté comme une pause. Le récit ne dit pas que la rose change la peau.",
      "حركة عصر في الفناء، تُروى كاستراحة. لا تقول الرواية إن الورد يغيّر البشرة.",
      "حركة د العشية فالفناء، مروية كوقفة. الرواية ما كتقولش الورد كيبدل البشرة.",
    ),
    caution: c(
      "La voix ne ferme pas le linge sur le nez ni sur les yeux. Les pétales abîmés ou mouillés depuis longtemps sont écartés dans le récit.",
      "لا تغلق الصوت القماش على الأنف ولا على العينين. البتلات التالفة أو المبللة منذ وقت طويل تُستبعد في الرواية.",
      "الصوت ما كتسدّش التوب على النف ولا على العينين. الوريقات الخايبين ولا المبلولين من مدة كيتنحّاو فالرواية.",
    ),
  }),
  sheet({
    title: c("Avoine de la cuisine", "شوفان المطبخ", "شوفان الكوزينة"),
    summary: c(
      "Des flocons sont écrasés grossièrement avec un peu d'eau et passés au visage comme une farine humide, puis rincés.",
      "تُهرس رقائق الشوفان بخشونة مع قليل من الماء وتُمرر على الوجه كدقيق رطب، ثم تُشطف.",
      "رقائق الشوفان كتتهرس بالخشونة مع شوية ماء وكتدوز على الوجه كدقيق رطب، ومن بعد كتشطف.",
    ),
    origin: c("Repère éditorial : garde-manger", "علامة تحريرية: خزانة المؤونة", "علامة تحريرية: خزانة المؤونة"),
    voice: c("Cuisinière fictive, la même maison que le miel.", "طبّاخة وهمية، البيت نفسه الذي فيه العسل.", "طبّاخة وهمية، نفس الدار ديال العسل."),
    history: c(
      "Elle prend une poignée dans le bocal des flocons, celle qui tient dans la main fermée, et l'écrase au fond d'un bol avec le dos de la cuillère. L'eau vient ensuite, juste assez pour coller. Elle frotte très peu, « comme pour enlever la farine des mains », et elle insiste sur le rinçage parce que les miettes restent dans les sourcils. Aucune promesse n'est dite.",
      "تأخذ قبضة من وعاء الرقائق، ما ينغلق في الكف، وتهرسها في قاع إناء بظهر الملعقة. يأتي الماء بعد ذلك بما يكفي للالتصاق فقط. تحك قليلاً جداً، «كما يُزال الدقيق عن اليدين»، وتشدد على الشطف لأن الفتات يبقى في الحاجبين. لا يُقال أي وعد.",
      "كتاخد قبضة من قادوس الرقائق، اللي كيسد فالكف، وكتهرسها فقاع الزلافة بظهر المعالقة. الماء كيجي من بعد غير اللي كافي للصق. كتحك شوية بزاف، «بحال ما يتنحى الدقيق من اليدين»، وكتأكّد على الشطف حيت الفتات كيبقا فالحواجب. حتى وعد ما كيتقال.",
    ),
    ingredients: [
      { name: c("Flocons d'avoine", "رقائق الشوفان", "رقائق الشوفان"), note: c("Une poignée fermée. Pas un poids de cuisine.", "قبضة مغلقة. ليس وزن مطبخ.", "قبضة مسدودة. ماشي وزن ديال الكوزينة.") },
      { name: c("Eau", "ماء", "ماء"), note: c("Assez pour coller les miettes, pas pour faire une soupe.", "ما يكفي للصق الفتات، لا لصنع حساء.", "اللي كافي باش يلصق الفتات، ماشي باش يدير حريرة.") },
    ],
    steps: [
      c("Les flocons sont écrasés secs, d'abord.", "تُهرس الرقائق جافة أولاً.", "الرقائق كتتهرس ناشفة، اللول."),
      c("L'eau est ajoutée jusqu'à ce que ça tienne.", "يُضاف الماء حتى يتماسك.", "الماء كيتزاد حتى يثبت."),
      c("Le passage sur le visage est léger.", "التمرير على الوجه خفيف.", "الدوزة على الوجه خفيفة."),
      c("Le rinçage insiste sur les sourcils et la racine des cheveux.", "يشدد الشطف على الحاجبين وأصل الشعر.", "الشطف كيتأكّد على الحواجب وأصل الشعر."),
    ],
    usage: c(
      "Raconté comme un geste de cuisine, un jour où le bocal est ouvert. Le récit ne le relie à aucun résultat.",
      "يُروى كحركة مطبخ، في يوم يكون فيه الوعاء مفتوحاً. لا تربطه الرواية بأي نتيجة.",
      "مروي كحركة كوزينة، فنهار القادوس محلول. الرواية ما كتربطوش بأي نتيجة.",
    ),
    caution: c(
      "Les miettes dans les yeux sont le seul avertissement du récit. Il dit de rincer longtemps. Ceci n'est pas un mode d'emploi.",
      "الفتات في العينين هو التنبيه الوحيد في الرواية. تقول بالشطف طويلاً. هذا ليس طريقة استعمال.",
      "الفتات فالعينين هو التحذير الوحيد فالرواية. كتقول تشطف مزيان. هذا ماشي طريقة الاستعمال.",
    ),
  }),
  sheet({
    title: c("L'autre argile", "الطين الآخر", "الطين الآخر"),
    summary: c(
      "Le récit sépare une argile rouge du ghassoul gris. Elle est plus rare dans la maison fictive et ne sert qu'au visage, en couche fine.",
      "تفصل الرواية طيناً أحمر عن الغاسول الرمادي. هو أندر في البيت الوهمي ولا يُستعمل إلا للوجه، بطبقة رقيقة.",
      "الرواية كتفرّق طين حمر على الغاسول الرمادي. هو قل ف الدار الوهمية وما كيتستعملش غير للوجه، بطبقة رقيقة.",
    ),
    origin: c("Repère éditorial : jarre de maison, sans gisement nommé", "علامة تحريرية: جرّة البيت، بلا منجم مسمّى", "علامة تحريرية: القلة د الدار، بلا منجم مسمّى"),
    voice,
    history: c(
      "La voix ouvre une jarre différente de celle du hammam. La poudre est rosée. Elle en prend moins que pour le corps, la mélange à l'eau du bout des doigts, et n'en met que sur le front et le nez, là où elle dit que « le soleil tape ». Elle ne connaît pas, dans le récit, le lieu d'extraction. Elle tient la jarre de « la maison d'avant », figure fictive elle aussi. Le rinçage est immédiat si ça tire.",
      "تفتح الصوت جرّة غير جرّة الحمام. المسحوق وردي. تأخذ أقل مما للجسم، تخلطه بالماء بأطراف الأصابع، ولا تضعه إلا على الجبين والأنف، حيث تقول إن «الشمس تضرب». لا تعرف في الرواية مكان الاستخراج. أخذت الجرّة من «بيت سابق»، وهو أيضاً شخصية وهمية. الشطف فوري إذا شدّ.",
      "الصوت كتفتح قلة ماشي قلة الحمام. البودرة وردية. كتخد قل من اللي للجسم، كتخلطو بالماء بطراف الصباع، وما كتحطوش غير على الجبهة والنيف، فين كتقول «الشمس كاتضرب». ما كتعرفش فالرواية فين تخرج. القلة جاتها من «دار سابقة»، وهي حتى هي شخصية وهمية. الشطف دغيا إلا شدّ.",
    ),
    ingredients: [
      { name: c("Argile rosée", "طين وردي", "طين وردي"), note: c("Poudre de la jarre. Origine d'extraction non dite.", "مسحوق الجرّة. أصل الاستخراج غير مذكور.", "بودرة القلة. أصل الخروج ما مذكورش.") },
      { name: c("Eau", "ماء", "ماء"), note: c("Peu, pour une couche qui ne coule pas.", "قليل، لطبقة لا تسيل.", "شوية، لطبقة ما كتسيلش.") },
    ],
    steps: [
      c("La jarre du hammam reste fermée.", "تبقى جرّة الحمام مغلقة.", "قلة الحمام كتبقى مسدودة."),
      c("La poudre rosée est mouillée du bout des doigts.", "يُبلل المسحوق الوردي بأطراف الأصابع.", "البودرة الوردية كتبلل بطراف الصباع."),
      c("Seuls le front et le nez sont couverts.", "يُغطى الجبين والأنف فقط.", "غير الجبهة والنيف اللي كيتغطاو."),
      c("Si la voix dit que ça tire, le rinçage commence tout de suite.", "إذا قالت الصوت إن الجلد يشد، يبدأ الشطف فوراً.", "إلا قالت الصوت البشرة كاتشد، الشطف كيبدا دغيا."),
    ],
    usage: c(
      "Associé dans le récit aux journées de soleil, comme une habitude de maison, pas comme une protection expliquée.",
      "مربوط في الرواية بأيام الشمس، كعادة بيت، لا كوقاية مشروحة.",
      "مربوط فالرواية بأيام الشمس، كعادة دار، ماشي كوقاية مشرحة.",
    ),
    caution: c(
      "Le récit dit d'arrêter dès que la peau tire et de ne pas confondre cette jarre avec le ghassoul du corps. Pas une autorisation d'usage.",
      "تقول الرواية بالتوقف حالما تشد البشرة وبعدم خلط هذه الجرّة بغاسول الجسم. ليست إذناً بالاستعمال.",
      "الرواية كتقول وقف غير البشرة تشد وما تخلطش هاد القلة مع غاسول الجسم. ماشي إذن بالاستعمال.",
    ),
  }),
  sheet({
    title: c("Le flacon du Dadès", "قارورة دادس", "قارورة دادس"),
    summary: c(
      "Le récit montre un flacon étiqueté rose du Dadès. Il sert d'eau de toilette, et la voix ne prétend pas avoir vu la distillation.",
      "تعرض الرواية قارورة مكتوب عليها ورد دادس. تُستعمل كماء غسل، والصوت لا تدّعي أنها رأت التقطير.",
      "الرواية كتعرض قارورة مكتوب عليها ورد دادس. كتستعمل كماء الغسل، والصوت ما كادّعيش أنها شافت التقطير.",
    ),
    origin: c("Repère éditorial : nom de vallée sur une étiquette, non vérifié", "علامة تحريرية: اسم وادٍ على لصيقة، غير متحقَّق", "علامة تحريرية: سمية واد على اللصيقة، ما متحققاش"),
    voice,
    history: c(
      "Le flacon est un cadeau fictif, apporté « d'un voyage ». L'étiquette dit Dadès. La voix s'en sert comme de l'autre eau de rose : linge mouillé, tempes, coin de l'oreiller. Elle ajoute qu'elle n'a pas vu les fleurs ni l'alambic, et que le nom sur le verre ne prouve pas le lieu. La fiche garde cette prudence. Aucune propriété n'est attribuée à la vallée.",
      "القارورة هدية وهمية، أُتت «من سفرة». تقول اللصيقة دادس. تستعملها الصوت كماء الورد الآخر: قماش مبلل، صدغان، طرف وسادة. تضيف أنها لم تر الزهر ولا الإنبيق، وأن الاسم على الزجاج لا يثبت المكان. تحفظ البطاقة هذا الحذر. لا تُنسب أي خاصية إلى الوادي.",
      "القارورة هدية وهمية، جات «من سفرة». اللصيقة كتقول دادس. الصوت كتستعملها بحال ما الورد الآخر: توب مبلل، الصدغين، طرف المخدة. كتزيد أنها ما شافتش الزهر ولا القطارة، والسمية على الزجاج ما كاتبتش البلاصة. البطاقة كتحفظ هاد الحذر. حتى خاصية ما متنسباش للوادي.",
    ),
    ingredients: [
      { name: c("Eau de rose étiquetée", "ماء ورد بلصيقة", "ما ورد بلصيقة"), note: c("Le nom Dadès est sur le verre. Le récit ne confirme pas l'origine.", "اسم دادس على الزجاج. الرواية لا تؤكد الأصل.", "سمية دادس على الزجاج. الرواية ما كاتأكّدش الأصل.") },
    ],
    steps: [
      c("La voix lit l'étiquette à voix haute, puis dit qu'elle ne sait pas.", "تقرأ الصوت اللصيقة جهراً ثم تقول إنها لا تعلم.", "الصوت كتقرا اللصيقة بصوت عالي ومن بعد كتقول ما كتعرفش."),
      c("Le linge est mouillé comme pour l'autre eau de rose.", "يُبلل القماش كما في ماء الورد الآخر.", "التوب كيتبل بحال ما الورد الآخر."),
      c("Tempes et oreiller seulement.", "الصدغان والوسادة فقط.", "غير الصدغين والمخدة."),
      c("Le flacon est rebouché. Rien n'est transvasé.", "تُغلق القارورة. لا يُنقل شيء إلى وعاء آخر.", "القارورة كتسد. حتى حاجة ما كتنقل لوعاء آخر."),
    ],
    usage: c(
      "Eau de toilette de démonstration. Le nom géographique reste une étiquette, pas une preuve.",
      "ماء غسل للعرض. يبقى الاسم الجغرافي لصيقة، لا دليلاً.",
      "ماء غسل ديال العرض. السمية الجغرافية كتبقى لصيقة، ماشي دليل.",
    ),
    caution: c(
      "Ne pas lire cette fiche comme une origine certifiée ni comme un conseil. La voix elle-même doute de l'étiquette.",
      "لا تُقرأ هذه البطاقة كأصل موثّق ولا كنصيحة. الصوت نفسها تشك في اللصيقة.",
      "هاد البطاقة ما تتقراش كأصل موثّق ولا كنصيحة. الصوت راسها شاكّة فاللصيقة.",
    ),
  }),
  sheet({
    title: c("La dernière eau", "الماء الأخير", "الماء الأخير"),
    summary: c(
      "Avant le miroir, une dernière eau claire retire ce qui reste de savon, d'argile ou de miel. C'est le geste qui ferme toutes les autres fiches du visage.",
      "قبل المرآة، ماء صافٍ أخير يزيل ما بقي من صابون أو طين أو عسل. هذه الحركة تختم بطاقات الوجه الأخرى.",
      "قبل المراية، ماء صافي أخير كينحّي اللي بقا من الصابون ولا الطين ولا العسل. هاد الحركة كتسد بطاقات الوجه الآخرين.",
    ),
    origin: c("Repère éditorial : salle d'eau", "علامة تحريرية: بيت الماء", "علامة تحريرية: بيت الماء"),
    voice,
    history: c(
      "La voix dit que le visage n'est pas fini tant que l'eau qui coule n'est pas claire. Elle recommence le rinçage si elle sent le savon au coin des lèvres ou une granule au sourcil. Ensuite seulement elle se regarde. Il n'y a pas de produit dans cette fiche : c'est l'eau, les mains, et le temps qu'il faut pour que plus rien ne glisse sous les doigts.",
      "تقول الصوت إن الوجه لا ينتهي حتى يصبح الماء النازل صافياً. تعيد الشطف إذا شمّت الصابون عند الشفتين أو حبّة عند الحاجب. بعد ذلك فقط تنظر في المرآة. لا منتج في هذه البطاقة: الماء واليدان والوقت اللازم حتى لا ينزلق شيء تحت الأصابع.",
      "الصوت كتقول الوجه ما كيساليش حتى الماء اللي كيهبط يولي صافي. كتعاود الشطف إلا شمّات الصابون عند الشفايف ولا حبّة عند الحاجب. من بعد غير كتشوف فالمراية. حتى منتج فهاد البطاقة: الماء والكفين والوقت اللي خاص حتى حتى حاجة ما تزولق تحت الصباع.",
    ),
    ingredients: [
      { name: c("Eau claire", "ماء صافٍ", "ماء صافي"), note: c("Autant de passages que le récit en demande, sans compte.", "عدد التمريرات الذي تطلبه الرواية، بلا حساب.", "قد الدوزات اللي الرواية طلبات، بلا حساب.") },
    ],
    steps: [
      c("Les mains passent le front, les ailes du nez, le menton.", "تمر الكفّان على الجبين وجانبي الأنف والذقن.", "الكفين كيدوزو على الجبهة وجوانب النيف والذقن."),
      c("Les sourcils sont rincés du bout des doigts.", "يُشطف الحاجبان بأطراف الأصابع.", "الحواجب كيتشطّفو بطراف الصباع."),
      c("Si l'eau mousse encore, le geste recommence.", "إذا بقي الماء يرغو، تُعاد الحركة.", "إلا بقا الماء كيرغب، الحركة كتعاود."),
      c("Le miroir vient après, pas pendant.", "تأتي المرآة بعد ذلك، لا أثناء الشطف.", "المراية كتجي من بعد، ماشي فاش كيتشطف."),
    ],
    usage: c(
      "Fin de toilette, commune aux autres gestes du visage dans cette démonstration.",
      "نهاية الغسل، مشتركة مع حركات الوجه الأخرى في هذا العرض.",
      "سالية الغسل، مشتركة مع حركات الوجه الأخرى فهاد العرض.",
    ),
    caution: c(
      "Le récit ne dit pas de frotter jusqu'à rougir pour « être sûr ». L'eau claire suffit, dans ses mots.",
      "لا تقول الرواية بالفرك حتى الاحمرار «للتأكد». الماء الصافي يكفي، بكلامها.",
      "الرواية ما كتقولش الفرك حتى الحمار «باش نتأكدو». الماء الصافي كافي، بكلامها.",
    ),
  }),
];
