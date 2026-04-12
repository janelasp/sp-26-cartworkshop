export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  username: string;
}

export interface MeResponse {
  userId: string | null;
  username: string | null;
  role: string | null;
}
