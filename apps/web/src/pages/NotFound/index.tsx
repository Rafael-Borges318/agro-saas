import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../utils/constants';

export function NotFound() {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl mb-6">🌾</p>
      <h1 className="text-6xl font-bold text-primary-700 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        A página que você procura não existe ou foi movida.
      </p>
      <Link to={ROUTES.HOME}>
        <Button>Voltar para o início</Button>
      </Link>
    </div>
  );
}
