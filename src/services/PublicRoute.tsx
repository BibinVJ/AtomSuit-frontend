import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function PublicRoute() {
  const { user, loading } = useAuth();

  // Wait until auth finishes checking
  if (loading) return null;

  // If already logged in, bounce to dashboard
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
