import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchModuleStatus } from "../api/resources";
import { ModuleStatusPanel } from "../components/ModuleStatusPanel";
import { AnalysisFlow, type FlowStage } from "../components/studio/AnalysisFlow";
import { RecipeFrame } from "../components/studio/RecipeFrame";
import { RitualGuide } from "../components/studio/RitualGuide";
import { ErrorState, LoadingState, SectionHeading } from "../components/ui/Chrome";

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
  const showFlow = page === "ai" || page === "analysis";

  const stages: FlowStage[] = [
    { id: "classification", label: t("design.stageClassification"), moduleKey: "classification" },
    { id: "sources", label: t("design.stageSources"), moduleKey: "comparison" },
    { id: "anomalies", label: t("design.stageAnomalies"), moduleKey: "extraction" },
    { id: "conflicts", label: t("design.stageConflicts"), moduleKey: "contradictions" },
    { id: "validation", label: t("design.stageValidation"), moduleKey: null },
  ];

  return (
    <section className="container-page space-y-8 py-12 md:py-16">
      <SectionHeading as="h1" kicker={t(content.owner)} title={t(content.title)} text={t(content.lead)} />
      {page === "validation" ? (
        <Link className="btn" to="/stories?status=pending">
          {t("design.openReview")}
        </Link>
      ) : null}
      {showFlow && status.data ? (
        <AnalysisFlow stages={stages} modules={status.data.modules} disclaimer={status.data.disclaimer} />
      ) : null}
      {page === "recipes" ? (
        <>
          <RecipeFrame />
          <RitualGuide />
        </>
      ) : null}
      {status.isLoading ? <LoadingState label={t("common.loading")} /> : null}
      {status.isError ? <ErrorState label={t("common.error")} /> : null}
      {status.data ? <h2 className="text-3xl">{t("design.serverMessages")}</h2> : null}
      <div className="grid gap-4">
        {content.keys.map((key) => {
          const module = status.data?.modules[key];
          if (!module || !status.data) return null;
          return (
            <ModuleStatusPanel key={key} status={module.status} message={module.message} disclaimer={status.data.disclaimer} />
          );
        })}
        {content.keys.length === 0 && status.data ? (
          <ModuleStatusPanel status="not_implemented" message={t(content.lead)} disclaimer={status.data.disclaimer} />
        ) : null}
      </div>
    </section>
  );
}
