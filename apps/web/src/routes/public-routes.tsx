import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../utils/constants';

export function PublicRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Authenticated users: go to onboarding if not done, otherwise dashboard
    return (
      <Navigate
        to={user?.onboardingCompleted ? ROUTES.DASHBOARD : ROUTES.ONBOARDING}
        replace
      />
    );
  }

  return <Outlet />;
}
