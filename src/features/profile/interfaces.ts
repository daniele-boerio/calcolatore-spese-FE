// --- INTERFACCE ---

export interface AuthResponse {
  access_token: string;
  username: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams extends LoginParams {
  email: string;
}

export interface ProfileState {
  loading: boolean;
  token: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

export interface ProfileResponse {
  username: string;
  email: string;
}
