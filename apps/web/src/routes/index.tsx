import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './public-routes';
import { PrivateRoutes } from './private-routes';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Clima } from '../pages/Clima';
import { Precos } from '../pages/Precos';
import { Financeiro } from '../pages/Financeiro';
import { Animais } from '../pages/Animais';
import { Marketplace } from '../pages/Marketplace';
import { Admin } from '../pages/Admin';
import { NotFound } from '../pages/NotFound';
import { ROUTES } from '../utils/constants';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path={ROUTES.HOME} element={<Landing />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
        </Route>

        <Route element={<PrivateRoutes />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.CLIMA} element={<Clima />} />
          <Route path={ROUTES.PRECOS} element={<Precos />} />
          <Route path={ROUTES.FINANCEIRO} element={<Financeiro />} />
          <Route path={ROUTES.ANIMAIS} element={<Animais />} />
          <Route path={ROUTES.MARKETPLACE} element={<Marketplace />} />
          <Route path={ROUTES.ADMIN} element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
