import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { EmptyState } from "./ui/Chrome";

export function ExpertGate() {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "validator" && user.role !== "admin") {
    return (
      <section className="container-page py-16">
        <EmptyState title={t("atlas.expertForbidden")} />
      </section>
    );
  }
  return <Outlet />;
}
