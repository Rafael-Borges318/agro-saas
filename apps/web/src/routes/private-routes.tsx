import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { AppLayout } from '../components/layout/Layout';
import { ROUTES } from '../utils/constants';

export function PrivateRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
