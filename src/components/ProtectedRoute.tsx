import { useNavigate } from "react-router-dom";

type ProtectedRouteProps = {
  isAuthenticated: boolean;
  requiredRole?: string; // admin կամ art
  children: React.ReactNode;
};

export default function ProtectedRoute({
  isAuthenticated,
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    if (role === "art") {
      navigate("/art");
    } else {
      navigate("/"); // fallback
    }
    return null;
  }

  return <>{children}</>;
}
