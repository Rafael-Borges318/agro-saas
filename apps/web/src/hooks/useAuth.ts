import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    setAuth(data.data.user, data.data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authService.register(name, email, password);
    setAuth(data.data.user, data.data.token);
  };

  return { user, token, isAuthenticated, login, register, logout };
}
