export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
