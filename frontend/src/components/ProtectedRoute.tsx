import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) {
    return <p className="container-page py-16 text-muted">{t("common.loading")}</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
