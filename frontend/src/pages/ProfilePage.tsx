import { Navigate } from "react-router-dom";

export function ProfilePage() {
  return <Navigate to="/dashboard?section=profile" replace />;
}
