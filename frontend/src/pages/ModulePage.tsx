import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchModuleStatus } from "../api/resources";
import { ModuleStatusPanel } from "../components/ModuleStatusPanel";

const PAGES = {
  ai: {
    title: "module.aiTitle",
    lead: "module.aiLead",
    owner: "module.aiOwner",
    keys: ["transcription", "extraction", "classification"],
  },
  analysis: {
    title: "module.analysisTitle",
    lead: "module.analysisLead",
    owner: "module.analysisOwner",
    keys: ["comparison", "contradictions", "confidence"],
  },
  validation: {
    title: "module.validationTitle",
    lead: "module.validationLead",
    owner: "module.validationOwner",
    keys: [],
  },
  recipes: {
    title: "module.recipesTitle",
    lead: "module.recipesLead",
    owner: "module.recipesOwner",
    keys: ["recipe_generation"],
  },
} as const;

export function ModulePage({ page }: { page: keyof typeof PAGES }) {
  const { t } = useTranslation();
  const content = PAGES[page];
  const status = useQuery({ queryKey: ["modules"], queryFn: fetchModuleStatus });

  return (
    <section className="container-page py-10">
      <p className="text-sm font-semibold text-clay">{t(content.owner)}</p>
      <h1 className="mt-2 text-4xl">{t(content.title)}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t(content.lead)}</p>
      {status.isLoading ? <p className="mt-8 text-muted">{t("common.loading")}</p> : null}
      {status.isError ? <p className="mt-8 text-danger">{t("common.error")}</p> : null}
      <div className="mt-8 grid gap-4">
        {content.keys.map((key) => {
          const module = status.data?.modules[key];
          if (!module || !status.data) return null;
          return (
            <ModuleStatusPanel
              key={key}
              status={module.status}
              message={module.message}
              disclaimer={status.data.disclaimer}
            />
          );
        })}
        {content.keys.length === 0 && status.data ? (
          <ModuleStatusPanel status="not_implemented" message={t(content.lead)} disclaimer={status.data.disclaimer} />
        ) : null}
      </div>
    </section>
  );
}
