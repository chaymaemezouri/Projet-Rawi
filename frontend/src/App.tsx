import { Navigate, Route, Routes } from "react-router-dom";
import { ExpertGate } from "./components/ExpertGate";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CategoriesPage } from "./pages/CategoriesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { ComparePage } from "./pages/ComparePage";
import { GuidePage } from "./pages/GuidePage";
import { AdminPage } from "./pages/AdminPage";
import { RecipePage } from "./pages/RecipePage";
import { ReviewPage } from "./pages/ReviewPage";
import { ModulePage } from "./pages/ModulePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import { StoryLabPage } from "./pages/StoryLabPage";
import { StoryFormPage } from "./pages/StoryFormPage";
import { StoryListPage } from "./pages/StoryListPage";
import { ExplorePage, RitualPage, ThemeDetailPage, ThemesPage } from "./pages/LibraryPages";
import { HowItWorksPage, TransmitPage } from "./pages/PublicFlowPages";
import { ExpertPage } from "./pages/ExpertPage";
import { BrandsPage } from "./pages/BrandsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/explorer" element={<ExplorePage />} />
        <Route path="/themes" element={<ThemesPage />} />
        <Route path="/themes/:slug" element={<ThemeDetailPage />} />
        <Route path="/rituels/:slug" element={<RitualPage />} />
        <Route path="/transmettre" element={<TransmitPage />} />
        <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
        <Route path="/marques" element={<BrandsPage />} />
        <Route path="/marques/ingredients" element={<BrandsPage />} />
        <Route path="/marques/tendances" element={<BrandsPage />} />
        <Route path="/marques/:slug" element={<BrandsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stories" element={<StoryListPage />} />
          <Route path="/stories/new" element={<StoryFormPage />} />
          <Route path="/stories/:storyId" element={<StoryDetailPage />} />
          <Route path="/stories/:storyId/lab" element={<StoryLabPage />} />
          <Route path="/stories/:storyId/edit" element={<StoryFormPage />} />
          <Route path="/modules/ai" element={<ModulePage page="ai" />} />
          <Route path="/modules/analysis" element={<ComparePage />} />
          <Route path="/modules/validation" element={<ReviewPage />} />
          <Route path="/modules/recipes" element={<RecipePage />} />
          <Route path="/modules/guide" element={<GuidePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/experts" element={<Navigate to="/admin?section=validators" replace />} />
          <Route path="/admin/recits" element={<Navigate to="/admin?section=moderation" replace />} />
          <Route path="/admin/categories" element={<Navigate to="/admin?section=categories" replace />} />
          <Route path="/admin/statistiques" element={<Navigate to="/admin?section=overview" replace />} />
          <Route element={<ExpertGate />}>
            <Route path="/expert" element={<ExpertPage />} />
            <Route path="/expert/validations" element={<ReviewPage />} />
            <Route path="/expert/recits/:storyId" element={<StoryDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
