import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "framer-motion";

type Lang = "fr" | "ar" | "ary";
type Tone = "user" | "ai" | "human" | "index";

const STORY =
  "Ma grand-mère m'a appris à préparer une huile de nigelle. Elle nettoyait les graines, les laissait sécher puis les pressait doucement. Elle conservait ensuite l'huile dans une petite bouteille en verre.";

const STEPS: { n: string; tone: Tone; title: Record<Lang, string>; role: Record<Lang, string>; points: Record<Lang, string[]> }[] = [
  {
    n: "01",
    tone: "user",
    title: { fr: "Tout commence par une histoire", ar: "كل شيء يبدأ بحكاية", ary: "كلشي كيبدا بحكاية" },
    role: {
      fr: "La personne enregistre un récit, l'écrit, choisit sa langue, ajoute une région si elle la connaît, et donne son accord.",
      ar: "يسجّل الشخص الحكاية أو يكتبها، يختار لغته، ويضيف الجهة إن عرفها، ثم يوافق على الاستعمال.",
      ary: "البنادم كيسجّل الحكاية ولا كيكتبها، كيختار اللغة، وكيقدر يزيد الجهة إلا كان عارفها، ومن بعد كيعطي الموافقة.",
    },
    points: {
      fr: ["Récit audio ou texte.", "Langue choisie.", "Région seulement si elle est donnée.", "Consentement conservé avec l'enregistrement et ses métadonnées."],
      ar: ["صوت أو نص.", "لغة مختارة.", "الجهة فقط إذا ذُكرت.", "الموافقة تُحفظ مع التسجيل ومعطياته."],
      ary: ["صوت ولا نص.", "اللغة اللي تختار.", "الجهة غير إلا تذكرات.", "الموافقة كتحبس مع التسجيل والمعطيات ديالو."],
    },
  },
  {
    n: "02",
    tone: "ai",
    title: { fr: "Speech & Language", ar: "الكلام واللغة", ary: "الكلام واللغة" },
    role: {
      fr: "Transcription et détection de langue. Pour un texte déjà écrit, cette étape ne transcrit pas : elle prépare le texte.",
      ar: "تفريغ وكشف اللغة. إذا كان النص مكتوباً، لا يوجد تفريغ صوتي.",
      ary: "التفريغ وكشف اللغة. إلا كان النص مكتوب، ما كاينش تفريغ ديال الصوت.",
    },
    points: {
      fr: ["Langues visées : darija, arabe, français, variantes amazighes, selon ce que le modèle couvre vraiment.", "Découpage des phrases et passages peu clairs.", "Confiance affichée seulement si le moteur la fournit.", "Technologie possible : reconnaissance vocale multilingue. Rien n'est lancé depuis cette page."],
      ar: ["اللغات المستهدفة حسب التغطية الفعلية للنموذج.", "تقطيع الجمل والإشارة إلى المواضع غير الواضحة.", "درجة الثقة تظهر فقط إذا أعطاها المحرك.", "لا يُستدعى أي نموذج من هذه الصفحة."],
      ary: ["اللغات على حساب اللي النموذج كيغطيها بصح.", "تقطيع الجمل والمواضع اللي ما واضحينش.", "الثقة كتبان غير إلا المحرك عطاتها.", "هاد الصفحة ما كتصيفط والو لمحرك."],
    },
  },
  {
    n: "03",
    tone: "ai",
    title: { fr: "Compréhension du récit", ar: "فهم الحكاية", ary: "فهم الحكاية" },
    role: {
      fr: "Repérer le sujet, les personnes, le contexte, les objets, les ingrédients et les gestes présents dans le texte.",
      ar: "استخراج ما هو موجود في النص فقط: الموضوع، الأشخاص، السياق، الأدوات، المكونات والخطوات.",
      ary: "يخرج غير اللي كاين فالنص: الموضوع، الناس، السياق، الأدوات، المكونات والحركات.",
    },
    points: {
      fr: ["Aucune information absente du récit n'est ajoutée.", "Un même témoignage peut contenir plusieurs pratiques.", "Chaque élément reste relié au passage source."],
      ar: ["لا تُضاف معلومة غير موجودة.", "شهادة واحدة قد تضم أكثر من ممارسة.", "كل عنصر يبقى مربوطاً بمقطعه."],
      ary: ["ما كيتزاد حتى معلومة ما كايناش.", "شهادة واحدة تقدر تجمع أكثر من ممارسة.", "كل عنصر كيبقا مربوط بالمقطع ديالو."],
    },
  },
  {
    n: "04",
    tone: "ai",
    title: { fr: "Extraction des fiches", ar: "استخراج البطاقات", ary: "خروج البطاقات" },
    role: {
      fr: "Proposer un titre, un résumé, des ingrédients, des étapes et une origine, uniquement à partir du récit.",
      ar: "اقتراح عنوان وملخص ومكونات وخطوات وأصل، فقط مما قيل.",
      ary: "اقتراح عنوان، ملخص، مكونات، خطوات وأصل، غير من اللي تقالت.",
    },
    points: {
      fr: ["Une fiche par pratique identifiée.", "Champ absent : « Non renseigné ».", "Les quantités ne sont pas inventées.", "Statut initial : en attente de validation."],
      ar: ["بطاقة لكل ممارسة.", "الحقل الناقص: « غير مذكور ».", "لا تُخترع الكميات.", "الحالة الأولى: في انتظار المراجعة."],
      ary: ["بطاقة لكل ممارسة.", "الخانة الخاوية: « ما مذكوراش ».", "الكميات ما كيتاخترعوش.", "الحالة اللولة: كتسنا المراجعة."],
    },
  },
  {
    n: "05",
    tone: "ai",
    title: { fr: "Classification", ar: "التصنيف", ary: "التصنيف" },
    role: {
      fr: "Ranger le récit dans les thématiques RAWI et proposer des tags tirés du texte.",
      ar: "وضع الحكاية في محاور راوي واقتراح وسوم من النص.",
      ary: "يحط الحكاية فمحاور راوي ويقترح كلمات من النص.",
    },
    points: {
      fr: ["Plusieurs catégories possibles.", "Tags seulement s'ils sont dans le récit : nigelle, huile, grand-mère, préparation.", "La région n'est pas taguée si elle est inconnue."],
      ar: ["يمكن أكثر من محور.", "الوسوم فقط إذا وردت في النص.", "لا وسم للجهة إذا كانت مجهولة."],
      ary: ["يقدر يكون أكثر من محور.", "الكلمات غير إلا كانو فالنص.", "الجهة ما كتزادش إلا كانت مجهولة."],
    },
  },
  {
    n: "06",
    tone: "ai",
    title: { fr: "Contrôle de cohérence", ar: "مراقبة التماسك", ary: "مراقبة التماسك" },
    role: {
      fr: "Signaler les manques, les contradictions et les données sensibles. Ce contrôle aide la relecture. Il ne certifie pas l'authenticité et ne remplace pas un expert.",
      ar: "ينبّه إلى النقص والتناقض والمعطيات الحساسة. لا يشهد على الأصالة ولا يحل محل الخبير.",
      ary: "كيشير للنقص والتناقض والمعطيات الحساسة. ما كيشهدش على الأصالة وما كيعوّضش الخبير.",
    },
    points: {
      fr: ["Champs manquants et doublons possibles.", "Incohérence entre ingrédients et étapes.", "Contenu inapproprié, affirmation médicale, donnée personnelle.", "Rapport d'aide, pas une certification."],
      ar: ["حقول ناقصة وتكرار محتمل.", "تناقض بين المكونات والخطوات.", "محتوى غير مناسب أو ادعاء طبي أو معطى شخصي.", "تقرير مساعدة، لا شهادة."],
      ary: ["خانات ناقصة وتكرار محتمل.", "تناقض بين المكونات والخطوات.", "محتوى ما مناسبش، ولا كلام طبي، ولا معطى شخصي.", "تقرير مساعدة، ماشي شهادة."],
    },
  },
  {
    n: "07",
    tone: "human",
    title: { fr: "La technologie assiste, l'humain valide", ar: "التقنية تساعد، والإنسان يعتمد", ary: "التقنية كتعاون، والإنسان هو اللي كيعتمد" },
    role: {
      fr: "Une personne du domaine compare le récit et la fiche. Rien n'est publié comme patrimoine vérifié sans cette validation.",
      ar: "يراجع صاحب الاختصاص الحكاية والبطاقة. لا نشر كمادة محققة من دون هذه المراجعة.",
      ary: "واحد من المجال كيقارن الحكاية والبطاقة. والو ما كيتنشر كمادة محققة بلا هاد المراجعة.",
    },
    points: {
      fr: ["Écouter l'audio, corriger, approuver, demander une reprise ou refuser avec un motif.", "États : Brouillon, Analyse IA, À vérifier, Validé, Publié."],
      ar: ["الاستماع، التصحيح، القبول، طلب التصحيح أو الرفض مع سبب.", "الحالات: مسودة، تحليل، للمراجعة، معتمد، منشور."],
      ary: ["يسمع، يصحح، يقبل، يطلب التصحيح ولا يرفض بسبب.", "الحالات: مسودة، تحليل، للمراجعة، معتمد، منشور."],
    },
  },
  {
    n: "08",
    tone: "index",
    title: { fr: "Indexation", ar: "الفهرسة", ary: "الفهرسة" },
    role: {
      fr: "Après validation, la fiche peut être enregistrée, indexée et reliée à son témoignage.",
      ar: "بعد الاعتماد يمكن حفظ البطاقة وفهرستها وربطها بشهادتها.",
      ary: "من بعد الاعتماد، البطاقة تقدر تتحبس وتتفهرس وتربط بالشهادة.",
    },
    points: {
      fr: ["Base et recherche par le sens, pas seulement par mot exact.", "Technologies possibles : PostgreSQL, pgvector, embeddings multilingues.", "La référence au récit source est conservée."],
      ar: ["بحث بالمعنى لا بالكلمة وحدها.", "تقنيات ممكنة، وليست مشغّلة من هذه الصفحة.", "مرجع الشهادة الأصلية يبقى محفوظاً."],
      ary: ["البحث بالمعنى، ماشي غير بالكلمة.", "تقنيات ممكنة، ما خداماش من هاد الصفحة.", "مرجع الشهادة الأصلية كيبقا محفوظ."],
    },
  },
  {
    n: "09",
    tone: "ai",
    title: { fr: "Découverte", ar: "الاكتشاف", ary: "الاكتشاف" },
    role: {
      fr: "Proposer des récits, des préparations et des terroirs proches de la question, par le sens.",
      ar: "اقتراح حكايات وتحضيرات ومواطن قريبة من السؤال، حسب المعنى.",
      ary: "اقتراح حكايات وتحضيرات ومواطن قراب للسؤال، على حساب المعنى.",
    },
    points: {
      fr: ["Exemple de question : comment préparer une huile traditionnelle pour les cheveux.", "Un lien vers un produit n'existe que si l'ingrédient et le geste correspondent.", "Huile d'argan et Tifawt Oils : même ingrédient, pas un placement publicitaire."],
      ar: ["الربط بمنتج فقط إذا تطابق المكوّن والمعرفة.", "زيت الأركان وTifawt Oils: نفس المكوّن، لا إعلان."],
      ary: ["الربط بمنتج غير إلا المكوّن والمعرفة كيتطابقو.", "زيت الأركان وTifawt Oils: نفس المكوّن، ماشي إشهار."],
    },
  },
  {
    n: "10",
    tone: "ai",
    title: { fr: "Assistant sur les récits validés", ar: "مساعد على الحكايات المعتمدة", ary: "مساعد على الحكايات المعتمدة" },
    role: {
      fr: "Répondre à partir des passages validés, montrer les références, et dire clairement ce qui n'est pas connu.",
      ar: "يجيب من المقاطع المعتمدة، يعرض المراجع، ويقول ما لا يعرفه.",
      ary: "كيجاوب من المقاطع المعتمدة، كيبين المراجع، وكيقول اللي ما يعرفوش.",
    },
    points: {
      fr: ["Comprendre la question, retrouver les passages, répondre, citer.", "Aucune tradition ni référence inventée.", "Cette page ne pose pas la question à un modèle."],
      ar: ["لا تقليد مخترع ولا مرجع مخترع.", "هذه الصفحة لا ترسل السؤال إلى نموذج."],
      ary: ["حتى تقليد مخترع وحتى مرجع مخترع.", "هاد الصفحة ما كتصيفطش السؤال لموديل."],
    },
  },
];

const AGENTS: { id: string; name: string; role: Record<Lang, string>; input: Record<Lang, string>; work: Record<Lang, string>; output: Record<Lang, string>; tech: Record<Lang, string> }[] = [
  { id: "speech", name: "Speech", role: STEPS[1].role, input: { fr: "Audio ou texte, langue, consentement.", ar: "صوت أو نص، لغة، موافقة.", ary: "صوت ولا نص، لغة، موافقة." }, work: { fr: "Transcrire si un audio existe. Sinon préparer le texte.", ar: "تفريغ الصوت إن وُجد، وإلا تجهيز النص.", ary: "يفرغ الصوت إلا كان، وإلا يجهز النص." }, output: { fr: "Texte relié à l'enregistrement.", ar: "نص مربوط بالتسجيل.", ary: "نص مربوط بالتسجيل." }, tech: { fr: "Reconnaissance vocale multilingue, si le service est disponible.", ar: "تعرف صوتي متعدد اللغات، إذا توفرت الخدمة.", ary: "تعرف على الصوت بلغات، إلا كانت الخدمة موجودة." } },
  { id: "narrative", name: "Narrative", role: STEPS[2].role, input: { fr: "Texte source.", ar: "النص المصدر.", ary: "النص المصدر." }, work: { fr: "Repérer sujets, personnes, gestes et objets cités.", ar: "تحديد ما ذُكر فقط.", ary: "يحدد غير اللي تذكر." }, output: { fr: "Structure avec passages sources.", ar: "بنية مع المقاطع.", ary: "بنية مع المقاطع." }, tech: { fr: "Lecture du texte. Pas d'invention.", ar: "قراءة النص بلا اختراع.", ary: "قراية النص بلا اختراع." } },
  { id: "extract", name: "Extraction", role: STEPS[3].role, input: { fr: "Structure du récit.", ar: "بنية الحكاية.", ary: "بنية الحكاية." }, work: { fr: "Une fiche par pratique. Les vides restent vides.", ar: "بطاقة لكل ممارسة. الفراغ يبقى فراغاً.", ary: "بطاقة لكل ممارسة. الخاوي كيبقا خاوي." }, output: { fr: "Fiche en attente.", ar: "بطاقة في الانتظار.", ary: "بطاقة كتسنا." }, tech: { fr: "Champs fixes, sans complétion artificielle.", ar: "حقول ثابتة بلا إكمال مصطنع.", ary: "خانات ثابتة بلا تكملة مصطنعة." } },
  { id: "class", name: "Classification", role: STEPS[4].role, input: { fr: "Fiche et récit.", ar: "البطاقة والحكاية.", ary: "البطاقة والحكاية." }, work: { fr: "Thématiques RAWI et tags présents dans le texte.", ar: "محاور راوي ووسوم موجودة في النص.", ary: "محاور راوي وكلمات كاينين فالنص." }, output: { fr: "Catégories et récits proches proposés.", ar: "تصنيفات وحكايات قريبة مقترحة.", ary: "تصنيفات وحكايات قراب مقترحين." }, tech: { fr: "Plusieurs catégories possibles.", ar: "أكثر من تصنيف ممكن.", ary: "أكثر من تصنيف ممكن." } },
  { id: "quality", name: "Quality", role: STEPS[5].role, input: { fr: "Fiche comparée au récit.", ar: "البطاقة مقارنة بالحكاية.", ary: "البطاقة مقارنة مع الحكاية." }, work: { fr: "Manques, contradictions, données sensibles.", ar: "نواقص وتناقضات ومعطيات حساسة.", ary: "نواقص وتناقضات ومعطيات حساسة." }, output: { fr: "Rapport d'aide à la relecture.", ar: "تقرير لمساعدة المراجعة.", ary: "تقرير باش يعاون المراجعة." }, tech: { fr: "Ne certifie pas le patrimoine.", ar: "لا يشهد على التراث.", ary: "ما كيشهدش على التراث." } },
  { id: "human", name: "Expert", role: STEPS[6].role, input: { fr: "Récit original et fiche proposée.", ar: "الحكاية الأصلية والبطاقة المقترحة.", ary: "الحكاية الأصلية والبطاقة المقترحة." }, work: { fr: "Comparer, corriger, approuver ou refuser.", ar: "مقارنة وتصحيح وقبول أو رفض.", ary: "يقارن، يصحح، يقبل ولا يرفض." }, output: { fr: "Décision humaine. Pas de publication automatique.", ar: "قرار بشري. لا نشر تلقائي.", ary: "قرار ديال بنادم. حتى نشر أوتوماتيكي." }, tech: { fr: "Relecture humaine. Aucun modèle ne valide à sa place.", ar: "مراجعة بشرية. لا نموذج يقرر مكانه.", ary: "مراجعة بشرية. حتى موديل ما كيقرر بلاصتو." } },
  { id: "index", name: "Indexation", role: STEPS[7].role, input: { fr: "Fiche validée par une personne.", ar: "بطاقة اعتمدها شخص.", ary: "بطاقة اعتمدها بنادم." }, work: { fr: "Enregistrer, indexer, garder la source.", ar: "حفظ وفهرسة والإبقاء على المصدر.", ary: "يحبس ويفهرس ويخلي المصدر." }, output: { fr: "Fiche cherchable.", ar: "بطاقة قابلة للبحث.", ary: "بطاقة تقدر تتقاد." }, tech: { fr: "PostgreSQL et embeddings, quand le service existe.", ar: "PostgreSQL وتمثيلات معنوية، عند توفر الخدمة.", ary: "PostgreSQL وتمثيلات، إلا كانت الخدمة." } },
  { id: "discover", name: "Discovery", role: STEPS[8].role, input: { fr: "Question du visiteur.", ar: "سؤال الزائر.", ary: "سؤال الزائر." }, work: { fr: "Recherche par le sens dans les fiches validées.", ar: "بحث بالمعنى في البطاقات المعتمدة.", ary: "بحث بالمعنى فالبطاقات المعتمدة." }, output: { fr: "Récits, gestes, terroirs pertinents.", ar: "حكايات وإيماءات ومواطن مناسبة.", ary: "حكايات وحركات ومواطن مناسبين." }, tech: { fr: "Le lien produit suit l'ingrédient, pas une publicité.", ar: "ربط المنتج يتبع المكوّن لا الإعلان.", ary: "الربط بالمنتج كيتبع المكوّن، ماشي الإشهار." } },
  { id: "rag", name: "Assistant", role: STEPS[9].role, input: { fr: "Question et passages validés.", ar: "سؤال ومقاطع معتمدة.", ary: "سؤال ومقاطع معتمدة." }, work: { fr: "Réponse limitée aux sources retrouvées.", ar: "جواب محصور في المصادر الموجودة.", ary: "جواب محصور فالمصايدر اللي تلقاو." }, output: { fr: "Réponse, références, et les inconnues.", ar: "جواب ومراجع وما هو مجهول.", ary: "جواب ومراجع واللي مجهول." }, tech: { fr: "Aucune tradition inventée.", ar: "لا تقليد مخترع.", ary: "حتى تقليد مخترع." } },
];

const STATES = [
  { fr: "Brouillon", ar: "مسودة", ary: "مسودة" },
  { fr: "Analyse IA", ar: "تحليل", ary: "تحليل" },
  { fr: "À vérifier", ar: "للمراجعة", ary: "للمراجعة" },
  { fr: "Validé", ar: "معتمد", ary: "معتمد" },
  { fr: "Publié", ar: "منشور", ary: "منشور" },
];

function pick<T>(lang: Lang, value: Record<Lang, T>) {
  return value[lang];
}

export function HowItWorksPage() {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language?.startsWith("ary") ? "ary" : i18n.language?.startsWith("ar") ? "ar" : "fr";
  const dir = lang === "fr" ? "ltr" : "rtl";
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [agent, setAgent] = useState(AGENTS[0].id);
  const [stage, setStage] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const current = STEPS[step];
  const currentAgent = AGENTS.find((item) => item.id === agent) ?? AGENTS[0];

  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setStage(6);
      setPlaying(false);
      return;
    }
    if (stage >= 6) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStage((value) => Math.min(6, value + 1)), 850);
    return () => window.clearTimeout(timer);
  }, [playing, stage, reduced]);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function onStepKey(event: KeyboardEvent) {
    const next = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const prev = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (event.key !== next && event.key !== prev && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const target = event.key === "Home" ? 0 : event.key === "End" ? STEPS.length - 1 : event.key === next ? Math.min(STEPS.length - 1, step + 1) : Math.max(0, step - 1);
    setStep(target);
    stepRefs.current[target]?.focus();
  }

  const ui = {
    kicker: pick(lang, { fr: "Parcours envisagé", ar: "المسار المستهدف", ary: "المسار اللي باغيين" }),
    title: pick(lang, {
      fr: "Comment RAWI transforme vos souvenirs en patrimoine vivant ?",
      ar: "كيف يحوّل راوي الذكريات إلى تراث حي؟",
      ary: "كيفاش راوي كيحوّل الذكريات لتراث حي؟",
    }),
    lead: pick(lang, {
      fr: "Découvrez comment des agents peuvent écouter, comprendre, structurer et relier des savoir-faire transmis. Ils ne sont pas lancés depuis cette page.",
      ar: "هكذا يمكن لوكلاء أن يسمعوا ويفهموا وينظموا معارف منقولة. هذه الصفحة لا تشغّلهم.",
      ary: "هكذا وكلاء يقدرو يسمعو ويفهمو وينظمو معارف منقولة. هاد الصفحة ما كتشغلهمش.",
    }),
    explore: pick(lang, { fr: "Explorer le processus", ar: "استكشاف المسار", ary: "شوف المسار" }),
    demo: pick(lang, { fr: "Voir une démonstration", ar: "مشاهدة محاكاة", ary: "شوف المحاكاة" }),
    process: pick(lang, { fr: "De la voix à la fiche", ar: "من الصوت إلى البطاقة", ary: "من الصوت للبطاقة" }),
    arch: pick(lang, { fr: "RAWI AI Orchestrator", ar: "منسّق راوي", ary: "منسّق راوي" }),
    archLead: pick(lang, {
      fr: "Il répartit le travail. La validation humaine reste au milieu du parcours, avant toute publication.",
      ar: "يوزّع العمل. المراجعة البشرية تبقى قبل أي نشر.",
      ary: "كيوزّع الخدمة. المراجعة البشرية كاتبقى قبل أي نشر.",
    }),
    sim: pick(lang, { fr: "Essayez le parcours RAWI", ar: "جرّب مسار راوي", ary: "جرّب مسار راوي" }),
    simNote: pick(lang, {
      fr: "Simulation. Aucun audio n'est envoyé et aucun modèle n'est appelé. Le texte de référence est affiché tel quel.",
      ar: "محاكاة. لا يُرسل صوت ولا يُستدعى نموذج. نص المرجع يُعرض كما هو.",
      ary: "محاكاة. حتى صوت ما كيتصيفط وحتى موديل ما كيتستدعيش. النص كيبان كما هو.",
    }),
    launch: pick(lang, { fr: "Lancer la simulation IA", ar: "بدء المحاكاة", ary: "بدا المحاكاة" }),
    restart: pick(lang, { fr: "Recommencer", ar: "إعادة", ary: "عاود" }),
    after: pick(lang, { fr: "Après la publication", ar: "بعد النشر", ary: "من بعد النشر" }),
    example: pick(lang, {
      fr: "Exemple de lien pertinent : un récit d'huile d'argan peut mener à l'huile d'argan de Tifawt Oils, parce que l'ingrédient est le même.",
      ar: "مثال على ربط مناسب: حكاية زيت الأركان قد تقود إلى زيت أركان Tifawt Oils لأن المكوّن واحد.",
      ary: "مثال على ربط مناسب: حكاية زيت الأركان تقدر تودي لزيت الأركان ديال Tifawt Oils حيت المكوّن واحد.",
    }),
    input: pick(lang, { fr: "Entrée", ar: "الدخل", ary: "الدخول" }),
    work: pick(lang, { fr: "Traitement", ar: "المعالجة", ary: "المعالجة" }),
    output: pick(lang, { fr: "Sortie", ar: "الخرج", ary: "الخروج" }),
    tech: pick(lang, { fr: "Technologie envisagée", ar: "تقنية ممكنة", ary: "تقنية ممكنة" }),
    open: pick(lang, { fr: "Détail de l'étape", ar: "تفاصيل الخطوة", ary: "تفاصيل الخطوة" }),
  };

  const tone = current.tone === "human" ? "#16A085" : current.tone === "user" ? "#722333" : "#7357F6";

  return (
    <article className="bg-white text-[#172033]">
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#722333]">{ui.kicker}</p>
          <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight md:text-5xl">{ui.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#516072]">{ui.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="rounded-full bg-[#722333] px-5 py-3 text-sm text-white" onClick={() => go("processus")}>{ui.explore}</button>
            <button type="button" className="rounded-full border border-[#D9DEE7] bg-white px-5 py-3 text-sm" onClick={() => go("demo")}>{ui.demo}</button>
          </div>
        </div>
        <FlowSketch reduced={Boolean(reduced)} />
      </section>

      <section id="processus" className="scroll-mt-24 border-t border-[#E6EAF0] py-14">
        <div className="container-page">
          <h2 className="font-serif text-3xl">{ui.process}</h2>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label={ui.process} onKeyDown={onStepKey}>
            {STEPS.map((item, index) => {
              const active = index === step;
              return (
                <button
                  key={item.n}
                  ref={(node) => { stepRefs.current[index] = node; }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  className="min-w-14 rounded-2xl border px-3 py-3 text-left"
                  style={{ borderColor: active ? "#722333" : "#E6EAF0", background: active ? "#722333" : "#fff", color: active ? "#fff" : "#172033" }}
                  onClick={() => setStep(index)}
                >
                  <span className="block text-xs opacity-80">{item.n}</span>
                  <span className="mt-1 block max-w-28 text-sm leading-5">{pick(lang, item.title)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-3xl border border-[#E6EAF0] bg-white p-6 md:p-8" role="tabpanel" aria-label={ui.open}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: tone }}>{current.n}</p>
            <h3 className="mt-2 font-serif text-3xl">{pick(lang, current.title)}</h3>
            <p className="mt-3 max-w-2xl leading-7 text-[#516072]">{pick(lang, current.role)}</p>
            <ul className="mt-5 grid gap-2 md:grid-cols-2">
              {pick(lang, current.points).map((point) => (
                <li key={point} className="rounded-2xl border border-[#E6EAF0] px-4 py-3 text-sm leading-6">{point}</li>
              ))}
            </ul>
            {step === 0 ? (
              <blockquote className="mt-5 border-s-2 border-[#722333] ps-4 text-base leading-7">
                « Quand j'étais petite, ma grand-mère préparait une huile traditionnelle avec des graines de nigelle. Elle m'expliquait comment les nettoyer, les sécher et les presser… »
              </blockquote>
            ) : null}
            {step === 6 ? (
              <ol className="mt-5 flex flex-wrap gap-2">
                {STATES.map((item, index) => (
                  <li key={item.fr} className="rounded-full px-3 py-1 text-xs" style={{ background: index === 3 ? "#16A085" : "#F4F6F8", color: index === 3 ? "#fff" : "#172033" }}>
                    {pick(lang, item)}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-[#E6EAF0] bg-[#FAFBFD] py-14">
        <div className="container-page">
          <div className="max-w-2xl rounded-3xl border border-[#722333] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#722333]">Orchestrator</p>
            <h2 className="mt-2 font-serif text-3xl">{ui.arch}</h2>
            <p className="mt-3 leading-7 text-[#516072]">{ui.archLead}</p>
          </div>
          <div className="ai-flow mt-4 h-1 rounded-full" aria-hidden="true" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AGENTS.map((item) => {
              const active = item.id === agent;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={pick(lang, item.role)}
                  aria-pressed={active}
                  className="rounded-3xl border bg-white p-4 text-left"
                  style={{ borderColor: active ? "#7357F6" : "#E6EAF0", boxShadow: active ? "0 0 0 3px rgba(115,87,246,0.15)" : undefined }}
                  onClick={() => setAgent(item.id)}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full text-white" style={{ background: item.id === "quality" || item.id === "human" ? "#16A085" : "#7357F6" }}><Glyph name={item.id} /></span>
                  <span className="mt-3 block font-semibold">{item.name}</span>
                  <span className="mt-1 block text-sm leading-5 text-[#516072]">{pick(lang, item.role)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid gap-3 rounded-3xl border border-[#E6EAF0] bg-white p-5 md:grid-cols-2">
            <p className="md:col-span-2 font-serif text-2xl">{currentAgent.name}</p>
            {([
              [ui.input, currentAgent.input],
              [ui.work, currentAgent.work],
              [ui.output, currentAgent.output],
              [ui.tech, currentAgent.tech],
            ] as const).map(([label, value]) => (
              <p key={label} className="rounded-2xl bg-[#F7F8FB] p-4 text-sm leading-6">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#7357F6]">{label}</span>
                {pick(lang, value)}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 border-t border-[#E6EAF0] py-14">
        <div className="container-page">
          <h2 className="font-serif text-3xl">{ui.sim}</h2>
          <p className="mt-3 max-w-2xl rounded-2xl border border-[#7357F6]/30 bg-[#F6F4FF] px-4 py-3 text-sm leading-6">{ui.simNote}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[#7357F6] px-5 py-3 text-sm text-white"
              onClick={() => { setStage(0); setPlaying(true); }}
            >
              {ui.launch}
            </button>
            <button type="button" className="rounded-full border border-[#D9DEE7] px-5 py-3 text-sm" onClick={() => { setPlaying(false); setStage(-1); }}>
              {ui.restart}
            </button>
          </div>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-[#EEF1F6]" aria-hidden="true">
            <div className="h-full bg-[#7357F6]" style={{ width: stage < 0 ? "0%" : `${((stage + 1) / 7) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#516072]">{stage < 0 ? "0 / 7" : `${stage + 1} / 7`}</p>
          <div className="mt-4 grid gap-3">
            {stage >= 0 ? <SimCard title={pick(lang, { fr: "1. Récit original", ar: "1. الحكاية الأصلية", ary: "1. الحكاية الأصلية" })} body={STORY} /> : null}
            {stage >= 1 ? <SimCard title={pick(lang, { fr: "2. Transcription de référence", ar: "2. نص المرجع", ary: "2. نص المرجع" })} body={STORY} note={ui.simNote} /> : null}
            {stage >= 2 ? <SimCard title={pick(lang, { fr: "3. Informations présentes dans le récit", ar: "3. ما ورد في الحكاية", ary: "3. اللي كاين فالحكاية" })} body={pick(lang, { fr: "Titre proposé : Préparation traditionnelle de l'huile de nigelle. Ingrédients : graines de nigelle. Étapes citées : nettoyage, séchage, pressage, conservation dans une bouteille en verre. Outils : Non renseigné. Origine : Non renseigné. Statut : en attente de validation.", ar: "العنوان المقترح: تحضير تقليدي لزيت حبة البركة. المكونات: حبات البركة. الخطوات المذكورة: تنظيف، تجفيف، عصر، حفظ في قارورة زجاج. الأدوات: غير مذكور. الأصل: غير مذكور.", ary: "العنوان: تحضير تقليدي لزيت حبة البركة. المكونات: حبات البركة. الخطوات: تنظيف، نشاف، عصر، حفظ فقريعة دالزعاج. الأدوات: ما مذكوراش. الأصل: ما مذكورش." })} /> : null}
            {stage >= 3 ? <SimCard title={pick(lang, { fr: "4. Classification", ar: "4. التصنيف", ary: "4. التصنيف" })} body={pick(lang, { fr: "Huiles naturelles. Tags présents dans le texte : nigelle, huile, grand-mère, préparation traditionnelle. Région : Non renseigné.", ar: "زيوت طبيعية. الوسوم الموجودة: حبة البركة، زيت، جدة، تحضير تقليدي. الجهة: غير مذكور.", ary: "زيوت طبيعية. الكلمات اللي فالنص: حبة البركة، زيت، جدة، تحضير تقليدي. الجهة: ما مذكوراش." })} /> : null}
            {stage >= 4 ? <SimCard title={pick(lang, { fr: "5. Contrôle", ar: "5. المراقبة", ary: "5. المراقبة" })} body={pick(lang, { fr: "Région et outil absents. Aucune contradiction relevée dans ces trois phrases. Aucune promesse médicale. Ce contrôle ne certifie pas l'authenticité.", ar: "الجهة والأداة غير مذكورتين. لا تناقض في هذه الجمل. لا وعد طبي. هذه المراقبة لا تشهد على الأصالة.", ary: "الجهة والأداة ما مذكورينش. حتى تناقض فهاد الجمل. حتى وعد طبي. هاد المراقبة ما كتشهدش على الأصالة." })} /> : null}
            {stage >= 5 ? <SimCard title={pick(lang, { fr: "6. Validation humaine simulée", ar: "6. مراجعة بشرية محاكاة", ary: "6. مراجعة بشرية محاكاة" })} body={pick(lang, { fr: "État simulé : À vérifier, puis Validé. Aucun expert n'a statué. La fiche n'est pas publiée.", ar: "حالة محاكاة: للمراجعة ثم معتمد. لم يقرر أي خبير. البطاقة غير منشورة.", ary: "حالة محاكاة: للمراجعة ومن بعد معتمد. حتى خبير ما قرر. البطاقة ما منشوراش." })} /> : null}
            {stage >= 6 ? <SimCard title={pick(lang, { fr: "7. Fiche de simulation", ar: "7. بطاقة المحاكاة", ary: "7. بطاقة المحاكاة" })} body={pick(lang, { fr: "Préparation traditionnelle de l'huile de nigelle. Catégorie : Huiles naturelles. Étapes : nettoyage, séchage, pressage, bouteille en verre. Origine : Non renseigné. Ceci n'est pas une fiche publiée.", ar: "تحضير تقليدي لزيت حبة البركة. المحور: زيوت طبيعية. الخطوات المذكورة فقط. الأصل: غير مذكور. هذه ليست بطاقة منشورة.", ary: "تحضير تقليدي لزيت حبة البركة. المحور: زيوت طبيعية. غير الخطوات اللي تذكرو. الأصل: ما مذكورش. هادي ماشي بطاقة منشورة." })} /> : null}
          </div>
        </div>
      </section>

      <section className="border-t border-[#E6EAF0] py-14">
        <div className="container-page">
          <h2 className="font-serif text-3xl">{ui.after}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <After to="/explorer" title={pick(lang, { fr: "Explorer", ar: "استكشاف", ary: "استكشاف" })} text={pick(lang, { fr: "Les récits par thématique.", ar: "الحكايات حسب المحور.", ary: "الحكايات على حساب المحور." })} />
            <After to="/explorer" title={pick(lang, { fr: "Rechercher", ar: "بحث", ary: "قلب" })} text={pick(lang, { fr: "Retrouver une connaissance.", ar: "العثور على معرفة.", ary: "تلقا معرفة." })} />
            <After to="/rituels/huiles-1" title={pick(lang, { fr: "Interagir", ar: "تفاعل", ary: "تفاعل" })} text={pick(lang, { fr: "Lire une fiche et ses retours.", ar: "قراءة بطاقة وتفاعلاتها.", ary: "قرا بطاقة والتفاعلات ديالها." })} />
            <After to="/marques" title={pick(lang, { fr: "Découvrir les terroirs", ar: "اكتشاف المواطن", ary: "اكتشف المواطن" })} text={pick(lang, { fr: "Maisons et produits liés au geste.", ar: "بيوت ومنتجات مرتبطة بالمعرفة.", ary: "ديور ومنتجات مربوطين بالمعرفة." })} />
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#516072]">{ui.example}</p>
          <Link className="mt-3 inline-flex rounded-full border border-[#722333] px-4 py-2 text-sm text-[#722333]" to="/marques/tifawt-oils/huile-argan">
            Tifawt Oils — {pick(lang, { fr: "Huile d'argan", ar: "زيت الأركان", ary: "زيت الأركان" })}
          </Link>
        </div>
      </section>
    </article>
  );
}

function Glyph({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", "aria-hidden": true, className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.7 };
  if (name === "speech") return <svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v3" /></svg>;
  if (name === "narrative") return <svg {...common}><path d="M5 5h10a4 4 0 0 1 4 4v10H9a4 4 0 0 1-4-4V5Z" /><path d="M9 9h6M9 13h4" /></svg>;
  if (name === "extract") return <svg {...common}><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><path d="M14 3.5V8h4M8 12h8M8 16h5" /></svg>;
  if (name === "class") return <svg {...common}><path d="M4 8h7v12H4zM13 4h7v16h-7z" /></svg>;
  if (name === "quality") return <svg {...common}><path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z" /><path d="m8.5 12 2.2 2.2 4.3-4.4" /></svg>;
  if (name === "human") return <svg {...common}><circle cx="12" cy="8" r="3" /><path d="M5.5 19c1.2-3 3.4-4.5 6.5-4.5S17.3 16 18.5 19" /></svg>;
  if (name === "index") return <svg {...common}><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>;
  if (name === "discover") return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
  return <svg {...common}><path d="M5 6h14v9H8l-3 3V6Z" /></svg>;
}

function FlowSketch({ reduced }: { reduced: boolean }) {
  const nodes = [
    ["speech", "Audio", "#722333"],
    ["narrative", "Langue", "#7357F6"],
    ["extract", "Récit", "#7357F6"],
    ["quality", "Fiche", "#16A085"],
  ] as const;
  return (
    <div className="rounded-[2rem] border border-[#E6EAF0] bg-white p-6 shadow-[0_20px_50px_rgba(23,32,51,0.06)]">
      <div className="grid grid-cols-4 gap-2">
        {nodes.map(([name, label, color]) => (
          <div key={label} className="rounded-2xl border border-[#E6EAF0] px-2 py-4 text-center">
            <span className="mx-auto grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: color }}><Glyph name={name} /></span>
            <span className="mt-2 block text-xs font-semibold">{label}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-4 h-2 rounded-full bg-[#EEF1F6]">
        <span className="ai-dot absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#7357F6]" style={reduced ? { left: "calc(100% - 0.75rem)" } : undefined} />
      </div>
    </div>
  );
}

function SimCard({ title, body, note }: { title: string; body: string; note?: string }) {
  return (
    <article className="rounded-3xl border border-[#E6EAF0] bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 leading-7">{body}</p>
      {note ? <p className="mt-2 text-xs leading-5 text-[#7357F6]">{note}</p> : null}
    </article>
  );
}

function After({ to, title, text }: { to: string; title: string; text: string }) {
  return (
    <Link to={to} className="rounded-3xl border border-[#E6EAF0] bg-white p-5 transition hover:border-[#722333]">
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#516072]">{text}</p>
    </Link>
  );
}
