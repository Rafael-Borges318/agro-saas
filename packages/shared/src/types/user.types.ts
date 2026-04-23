export type UserRole = 'PRODUTOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends User {
  token: string;
}

export interface Produtor {
  id: string;
  userId: string;
  cpf: string;
  telefone?: string;
  estado?: string;
  cidade?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Propriedade {
  id: string;
  produtorId: string;
  nome: string;
  areaHectares: number;
  municipio: string;
  estado: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}
