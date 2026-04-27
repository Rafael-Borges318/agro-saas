import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../utils/constants';

// Auth required, but does NOT enforce onboarding completion.
// Used for /onboarding and /planos so users can complete these steps.
export function AuthOnlyRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
