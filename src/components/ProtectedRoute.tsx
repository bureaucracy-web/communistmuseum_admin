import type { JSX } from "react";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  isAuthenticated: boolean;
  children: JSX.Element;
};

export default function ProtectedRoute({
  isAuthenticated,
  children,
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
