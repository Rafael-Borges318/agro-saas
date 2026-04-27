import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AppLayout } from '../components/layout/Layout';
import { ROUTES } from '../utils/constants';

export function PrivateRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Force onboarding before accessing the main app
  if (!user?.onboardingCompleted) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
