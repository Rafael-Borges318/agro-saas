import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../utils/constants';

export function PublicRoutes() {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) return null;

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.onboardingCompleted ? ROUTES.DASHBOARD : ROUTES.ONBOARDING}
        replace
      />
    );
  }

  return <Outlet />;
}
