import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CategoriesPage } from "./pages/CategoriesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { ModulePage } from "./pages/ModulePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StoryDetailPage } from "./pages/StoryDetailPage";
import { StoryFormPage } from "./pages/StoryFormPage";
import { StoryListPage } from "./pages/StoryListPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stories" element={<StoryListPage />} />
          <Route path="/stories/new" element={<StoryFormPage />} />
          <Route path="/stories/:storyId" element={<StoryDetailPage />} />
          <Route path="/stories/:storyId/edit" element={<StoryFormPage />} />
          <Route path="/modules/ai" element={<ModulePage page="ai" />} />
          <Route path="/modules/analysis" element={<ModulePage page="analysis" />} />
          <Route path="/modules/validation" element={<ModulePage page="validation" />} />
          <Route path="/modules/recipes" element={<ModulePage page="recipes" />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
