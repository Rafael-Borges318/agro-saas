export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  status: 'error' | 'validation_error';
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PRODUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatarUrl?: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}
