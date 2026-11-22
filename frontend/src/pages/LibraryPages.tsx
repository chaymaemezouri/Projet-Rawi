import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchStories } from "../api/resources";
import { useAuth } from "../auth/AuthContext";
import { RITUALS, THEMES, ritualBySlug, ritualsFor, text, themeBySlug, type Ritual } from "../demo/catalog";

function opening(value: { fr: string; ar: string; ary: string }) {
  const cut = (line: string) => {
    const match = line.match(/^[\s\S]*?[.!?؟]/);
    return (match ? match[0] : line).trim();
  };
  return { fr: cut(value.fr), ar: cut(value.ar), ary: cut(value.ary) };
}

const COMMENTERS = [
  { first: { fr: "Yasmine", ar: "ياسمين", ary: "ياسمين" }, last: { fr: "El Amrani", ar: "العمراني", ary: "العمراني" }, image: "/images/profile-yasmine.jpg" },
  { first: { fr: "Mehdi", ar: "مهدي", ary: "مهدي" }, last: { fr: "Bennani", ar: "بناني", ary: "بناني" }, image: "/images/profile-mehdi.jpg" },
  { first: { fr: "Salma", ar: "سلمى", ary: "سلمى" }, last: { fr: "Cherkaoui", ar: "الشرقاوي", ary: "الشرقاوي" }, image: "/images/profile-salma.jpg" },
  { first: { fr: "Anas", ar: "أنس", ary: "أنس" }, last: { fr: "Tazi", ar: "التازي", ary: "التازي" }, image: "/images/profile-anas.jpg" },
  { first: { fr: "Nadia", ar: "نادية", ary: "نادية" }, last: { fr: "Ouazzani", ar: "الوزاني", ary: "الوزاني" }, image: "/images/profile-nadia.jpg" },
  { first: { fr: "Karim", ar: "كريم", ary: "كريم" }, last: { fr: "Idrissi", ar: "الإدريسي", ary: "الإدريسي" }, image: "/images/profile-karim.jpg" },
  { first: { fr: "Houda", ar: "هدى", ary: "هدى" }, last: { fr: "Filali", ar: "الفيلالي", ary: "الفيلالي" }, image: "/images/profile-houda.jpg" },
  { first: { fr: "Omar", ar: "عمر", ary: "عمر" }, last: { fr: "Squalli", ar: "السقالي", ary: "السقالي" }, image: "/images/profile-omar.jpg" },
] as const;

function commentersFor(slug: string) {
  let n = 0;
  for (const char of slug) n += char.charCodeAt(0);
  return [COMMENTERS[n % COMMENTERS.length], COMMENTERS[(n + 3) % COMMENTERS.length]];
}

function spoken(text: { fr: string; ar: string; ary: string }, voice: 0 | 1) {
  const cut = (line: string) => line.replace(/[.!?؟]\s*$/, "");
  if (voice === 0) {
    return {
      fr: `Je retiens ça : ${cut(text.fr)}.`,
      ar: `هذا ما أحتفظ به: ${cut(text.ar)}.`,
      ary: `هذا اللي حافظا: ${cut(text.ary)}.`,
    };
  }
  return {
    fr: `Chez nous, on s'arrête ici. ${text.fr}`,
    ar: `عندنا نقف هنا. ${text.ar}`,
    ary: `عندنا كنوقفو هنا. ${text.ary}`,
  };
}

function useCopy() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  return (value: { fr: string; ar: string; ary: string }) => text(language, value);
}

export function RitualCard({ ritual, tall = false }: { ritual: Ritual; tall?: boolean }) {
  const { t } = useTranslation();
  const label = useCopy();
  const theme = themeBySlug(ritual.theme);
  return (
    <Link to={`/rituels/${ritual.slug}`} className="group block overflow-hidden rounded-[1.5rem] border border-line bg-paper">
      <span className={`zoom-frame relative block ${tall ? "min-h-[22rem]" : "min-h-[14rem]"}`}>
        <img src={ritual.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute start-4 top-4 rounded-full bg-cream/95 px-3 py-1 text-xs font-medium text-forest">{t("atlas.demo")}</span>
      </span>
      <span className="block p-5">
        <span className="text-xs uppercase tracking-[0.16em] text-clay-ink rtl:tracking-normal">{theme ? label(theme.title) : ""} · {t(`atlas.complexity_${ritual.complexity}`)}</span>
        <span className="mt-2 block font-serif text-3xl leading-tight text-ink">{label(ritual.title)}</span>
        <span className="mt-3 block text-sm leading-6 text-muted">{label(ritual.summary)}</span>
      </span>
    </Link>
  );
}

export function ThemesPage() {
  const { t } = useTranslation();
  const label = useCopy();
  return (
    <section className="container-page py-12 md:py-16">
      <p className="kicker">{t("atlas.demo")}</p>
      <h1 className="mt-3 max-w-3xl text-5xl">{t("atlas.themesTitle")}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{t("atlas.themesLead")}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme, index) => (
          <Link key={theme.slug} to={`/themes/${theme.slug}`} className={`zoom-frame group relative block overflow-hidden rounded-[1.75rem] ${index % 5 === 0 ? "min-h-[26rem] md:col-span-2 xl:col-span-2" : "min-h-[18rem]"}`}>
            <img src={theme.image} alt={label(theme.alt)} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-cream">
              <span className="text-xs text-gold">{t("atlas.sheetCount", { count: ritualsFor(theme.slug).length })}</span>
              <span className="mt-2 block font-serif text-4xl">{label(theme.title)}</span>
              <span className="mt-2 block max-w-md text-sm leading-6 text-cream/85">{label(theme.intro)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ThemeDetailPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const label = useCopy();
  const theme = themeBySlug(slug);
  const all = ritualsFor(slug);
  const [query, setQuery] = useState("");
  const [complexity, setComplexity] = useState("all");
  const [ingredient, setIngredient] = useState("all");
  const names = useMemo(() => {
    const map = new Map<string, Ritual["ingredients"][number]["name"]>();
    all.forEach((ritual) => ritual.ingredients.forEach((item) => map.set(item.name.fr, item.name)));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr"));
  }, [all]);
  if (!theme) {
    return (
      <section className="container-page py-16">
        <h1 className="text-4xl">{t("atlas.empty")}</h1>
        <Link className="btn mt-6" to="/themes">{t("atlas.backThemes")}</Link>
      </section>
    );
  }
  const sheets = all.filter((ritual) => {
    if (complexity !== "all" && ritual.complexity !== complexity) return false;
    if (ingredient !== "all" && !ritual.ingredients.some((item) => item.name.fr === ingredient)) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    const blob = `${label(ritual.title)} ${label(ritual.summary)} ${label(ritual.history)}`.toLowerCase();
    return blob.includes(needle);
  });
  return (
    <article>
      <header className="relative min-h-[24rem] bg-ink text-cream">
        <img src={theme.image} alt={label(theme.alt)} className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="container-page relative flex min-h-[24rem] flex-col justify-end py-12">
          <p className="text-xs uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{t("atlas.demo")}</p>
          <h1 className="mt-3 max-w-3xl text-5xl md:text-6xl">{label(theme.title)}</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-cream/85">{label(theme.intro)}</p>
        </div>
      </header>
      <div className="container-page py-12">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="label">{t("atlas.search")}</span>
            <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="block">
            <span className="label">{t("atlas.complexity")}</span>
            <select className="field" value={complexity} onChange={(event) => setComplexity(event.target.value)}>
              <option value="all">{t("atlas.allComplexities")}</option>
              <option value="simple">{t("atlas.complexity_simple")}</option>
              <option value="detail">{t("atlas.complexity_detail")}</option>
              <option value="deep">{t("atlas.complexity_deep")}</option>
            </select>
          </label>
          <label className="block">
            <span className="label">{t("atlas.ingredient")}</span>
            <select className="field" value={ingredient} onChange={(event) => setIngredient(event.target.value)}>
              <option value="all">{t("atlas.allIngredients")}</option>
              {names.map(([key, name]) => <option key={key} value={key}>{label(name)}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-6 text-sm text-muted">{t("atlas.sheetCount", { count: sheets.length })}</p>
        {sheets.length === 0 ? <p className="mt-8 text-lg">{t("atlas.empty")}</p> : null}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((ritual, index) => (
            <RitualCard key={ritual.slug} ritual={ritual} tall={index % 5 === 0} />
          ))}
        </div>
      </div>
    </article>
  );
}

export function ExplorePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const label = useCopy();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("all");
  const [language, setLanguage] = useState("all");
  const [complexity, setComplexity] = useState("all");
  const [ingredient, setIngredient] = useState("all");
  const [sort, setSort] = useState("title");
  const ingredientNames = useMemo(() => {
    const map = new Map<string, Ritual["ingredients"][number]["name"]>();
    RITUALS.forEach((ritual) => ritual.ingredients.forEach((item) => map.set(item.name.fr, item.name)));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr"));
  }, []);
  const stories = useQuery({
    queryKey: ["public-visible-stories", user?.id],
    queryFn: () => fetchStories({ limit: 24 }),
    enabled: Boolean(user),
    retry: false,
  });
  const sheets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = RITUALS.filter((ritual) => {
      if (theme !== "all" && ritual.theme !== theme) return false;
      if (language !== "all" && ritual.language !== language) return false;
      if (complexity !== "all" && ritual.complexity !== complexity) return false;
      if (ingredient !== "all" && !ritual.ingredients.some((item) => item.name.fr === ingredient)) return false;
      if (!needle) return true;
      const blob = `${label(ritual.title)} ${label(ritual.summary)} ${label(ritual.history)} ${ritual.ingredients.map((item) => label(item.name)).join(" ")}`.toLowerCase();
      return blob.includes(needle);
    });
    return rows.sort((a, b) => {
      const left = sort === "theme" ? a.theme : label(a.title);
      const right = sort === "theme" ? b.theme : label(b.title);
      return left.localeCompare(right, i18n.language === "fr" ? "fr" : "ar");
    });
  }, [query, theme, language, complexity, ingredient, sort, label, i18n.language]);
  const collected = (stories.data?.items ?? []).filter(
    (story) => story.workflow_status === "submitted" && story.publish_authorized && story.validation_status === "validated" && story.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section className="container-page py-12 md:py-16">
      <p className="kicker">{t("atlas.demo")}</p>
      <h1 className="mt-3 text-5xl">{t("nav.explore")}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">{t("atlas.exploreLead")}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="label">{t("atlas.search")}</span>
          <input className="field" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="block">
          <span className="label">{t("nav.themes")}</span>
          <select className="field" value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="all">{t("atlas.allThemes")}</option>
            {THEMES.map((item) => (
              <option key={item.slug} value={item.slug}>{label(item.title)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">{t("atlas.language")}</span>
          <select className="field" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="all">{t("atlas.allLanguages")}</option>
            <option value="fr">FR</option>
            <option value="ar">AR</option>
            <option value="ary">ARY</option>
          </select>
        </label>
        <label className="block">
          <span className="label">{t("atlas.complexity")}</span>
          <select className="field" value={complexity} onChange={(event) => setComplexity(event.target.value)}>
            <option value="all">{t("atlas.allComplexities")}</option>
            <option value="simple">{t("atlas.complexity_simple")}</option>
            <option value="detail">{t("atlas.complexity_detail")}</option>
            <option value="deep">{t("atlas.complexity_deep")}</option>
          </select>
        </label>
        <label className="block">
          <span className="label">{t("atlas.ingredient")}</span>
          <select className="field" value={ingredient} onChange={(event) => setIngredient(event.target.value)}>
            <option value="all">{t("atlas.allIngredients")}</option>
            {ingredientNames.map(([key, name]) => <option key={key} value={key}>{label(name)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">{t("atlas.sort")}</span>
          <select className="field" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="title">{t("atlas.sortTitle")}</option>
            <option value="theme">{t("atlas.sortTheme")}</option>
          </select>
        </label>
      </div>
      <p className="mt-6 text-sm text-muted">{t("atlas.sheetCount", { count: sheets.length })}</p>
      {sheets.length === 0 ? <p className="mt-8 text-lg">{t("atlas.empty")}</p> : null}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sheets.map((ritual, index) => (
          <RitualCard key={ritual.slug} ritual={ritual} tall={index % 7 === 0} />
        ))}
      </div>
      <div className="mt-16 border-t border-line pt-10">
        <h2 className="text-3xl">{t("atlas.collected")}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{user ? t("atlas.collectedLead") : t("atlas.collectedLocked")}</p>
        {user && collected.length > 0 ? (
          <ul className="mt-6 grid gap-3">
            {collected.map((story) => (
              <li key={story.id}>
                <Link className="block rounded-2xl border border-line bg-paper px-4 py-3 hover:bg-cream" to={`/stories/${story.id}`}>
                  <span className="text-xs text-clay-ink">{t("atlas.collected")}</span>
                  <span className="mt-1 block font-serif text-2xl">{story.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function RitualPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const label = useCopy();
  const ritual = ritualBySlug(slug);
  const [active, setActive] = useState("histoire");
  const [stepOn, setStepOn] = useState(0);
  useEffect(() => {
    setStepOn(0);
    setActive("histoire");
    const nodes = ["histoire", "ingredients", "preparation", "usage", "duree", "variantes", "sources", "commentaires"]
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [slug]);
  if (!ritual) {
    return (
      <section className="container-page py-16">
        <h1 className="text-4xl">{t("atlas.empty")}</h1>
        <Link className="btn mt-6" to="/themes">{t("atlas.backThemes")}</Link>
      </section>
    );
  }
  const siblings = ritualsFor(ritual.theme);
  const index = siblings.findIndex((item) => item.slug === ritual.slug);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const similar = siblings.filter((item) => item.slug !== ritual.slug).slice(0, 3);
  const people = commentersFor(ritual.slug);
  const notes = [
    { person: people[0], text: spoken(opening(ritual.summary), 0) },
    { person: people[1], text: spoken(opening(ritual.usage), 1) },
  ];
  const sections = [
    ["histoire", t("atlas.history")],
    ["ingredients", t("atlas.ingredients")],
    ["preparation", t("atlas.timeline")],
    ["usage", t("atlas.usage")],
    ["duree", t("atlas.duration")],
    ["variantes", t("atlas.variants")],
    ["sources", t("atlas.sources")],
    ["commentaires", t("atlas.comments")],
  ] as const;
  return (
    <article className="container-page space-y-6 py-8">
      <header className="overflow-hidden rounded-[1.75rem] bg-paper shadow-card">
        <div className="grid md:grid-cols-[16rem_1fr]">
          <img src={ritual.image} alt="" className="h-52 w-full object-cover md:h-full" />
          <div className="p-6 md:p-8">
            <p className="kicker">{t("atlas.demo")}</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-ink">{label(ritual.title)}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted">{label(ritual.summary)}</p>
            <p className="mt-3 text-xs text-muted">{t("atlas.imageNote")}</p>
          </div>
        </div>
      </header>
      <nav className="sticky top-20 z-20 -mx-1 flex gap-2 overflow-x-auto rounded-full bg-cream/90 p-1 backdrop-blur" aria-label={t("atlas.toc")}>
        {sections.map(([id, name]) => (
          <a key={id} href={`#${id}`} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${active === id ? "bg-forest text-cream" : "text-ink hover:bg-paper"}`} onClick={() => setActive(id)}>{name}</a>
        ))}
      </nav>
      <section id="histoire" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
        <h2 className="font-serif text-3xl">{t("atlas.history")}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8">{label(ritual.history)}</p>
        <div className="mt-6 rounded-2xl bg-cream p-5">
          <h3 className="text-sm font-semibold text-forest">{t("atlas.transmission")}</h3>
          <p className="mt-2 leading-7 text-muted">{label(ritual.voice)}</p>
        </div>
      </section>
      <section id="ingredients" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
        <h2 className="font-serif text-3xl">{t("atlas.ingredients")}</h2>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ritual.ingredients.map((item, itemIndex) => (
            <li key={`${item.name.fr}-${itemIndex}`} className="flex flex-col items-center text-center">
              <img src={item.image} alt="" className="h-36 w-36 rounded-full object-cover ring-4 ring-gold/80 transition duration-300 hover:scale-105" />
              <p className="mt-4 font-serif text-2xl">{label(item.name)}</p>
              {item.original ? <p className="mt-1 text-xs text-clay-ink">{t("atlas.originalName")} · {label(item.original)}</p> : null}
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted">{label(item.note)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section id="preparation" className="scroll-mt-36">
        <h2 className="font-serif text-3xl">{t("atlas.timeline")}</h2>
        <ol className="mt-6">
          {ritual.steps.map((step, stepIndex) => {
            const selected = stepOn === stepIndex;
            const linked = stepIndex < ritual.steps.length - 1;
            return (
              <li key={step.fr}>
                <button
                  type="button"
                  className="flex w-full items-stretch gap-4 text-start"
                  onClick={() => setStepOn(stepIndex)}
                  aria-pressed={selected}
                >
                  <span className="relative w-8 shrink-0">
                    {linked ? (
                      <span className={`absolute left-1/2 top-8 bottom-0 w-px -translate-x-1/2 ${stepIndex < stepOn ? "bg-forest" : "bg-forest/25"}`} aria-hidden="true" />
                    ) : null}
                    <span className={`relative z-10 mt-1 grid h-8 w-8 place-items-center rounded-full text-sm ring-4 ring-cream ${selected ? "bg-forest text-cream" : "bg-cream text-forest"}`}>{stepIndex + 1}</span>
                  </span>
                  <span className={`min-w-0 flex-1 py-1 pb-6 leading-8 ${selected ? "font-medium text-forest" : "text-ink"}`}>{label(step)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
      <section id="usage" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
        <h2 className="font-serif text-3xl">{t("atlas.usage")}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8">{label(ritual.usage)}</p>
        <div className="mt-6 rounded-2xl border border-gold/70 bg-cream p-5">
          <h3 className="text-sm font-semibold text-forest">{t("atlas.caution")}</h3>
          <p className="mt-2 leading-7">{label(ritual.caution)}</p>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section id="duree" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
          <h2 className="font-serif text-3xl">{t("atlas.duration")}</h2>
          <p className="mt-4 leading-8">{label(ritual.duration)}</p>
        </section>
        <section id="variantes" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
          <h2 className="font-serif text-3xl">{t("atlas.variants")}</h2>
          <p className="mt-4 leading-8">{label(ritual.variants)}</p>
        </section>
      </div>
      <section id="sources" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
        <h2 className="font-serif text-3xl">{t("atlas.sources")}</h2>
        <p className="mt-4 max-w-3xl leading-7">{label(ritual.source)}</p>
      </section>
      <section id="commentaires" className="scroll-mt-36 rounded-[1.75rem] bg-paper p-6 shadow-card md:p-8">
        <h2 className="font-serif text-3xl">{t("atlas.comments")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{t("atlas.commentsNote")}</p>
        <ul className="mt-6 space-y-4">
          {notes.map((note) => (
            <li key={note.person.first.fr} className="flex gap-4 rounded-[1.25rem] bg-cream p-4">
              <img src={note.person.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover object-top" />
              <div className="min-w-0">
                <p className="font-medium">{label(note.person.first)} {label(note.person.last)}</p>
                <p className="mt-1 leading-7">{label(note.text)}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-muted">{t("atlas.notValidated")}</p>
      </section>
      <div className="flex flex-wrap gap-3">
        {previous ? <Link className="btn-secondary" to={`/rituels/${previous.slug}`}>{t("atlas.prev")}</Link> : null}
        {next ? <Link className="btn-secondary" to={`/rituels/${next.slug}`}>{t("atlas.next")}</Link> : null}
      </div>
      <section>
        <h2 className="font-serif text-3xl">{t("atlas.similar")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {similar.map((item) => <RitualCard key={item.slug} ritual={item} />)}
        </div>
      </section>
    </article>
  );
}
