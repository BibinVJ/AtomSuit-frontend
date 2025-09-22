import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  // Wait until auth finishes checking
  if (loading) return null;

  // If logged in, show the route. Else, redirect to signin
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
}
