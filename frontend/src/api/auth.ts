import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function registerUser(
  request: RegisterRequest
): Promise<RegisterResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: request.username,
      password: request.password,
    }),
  });

  if (res.status === 409) {
    throw new AuthError("Username already exists", 409);
  }

  if (!res.ok) {
    throw new AuthError(`Failed to register: ${res.status}`, res.status);
  }

  return res.json();
}

export async function loginUser(request: LoginRequest): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: request.username,
      password: request.password,
    }),
  });

  if (res.status === 401) {
    throw new AuthError("Invalid username or password", 401);
  }

  if (!res.ok) {
    throw new AuthError(`Failed to login: ${res.status}`, res.status);
  }

  return res.json();
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const res = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    throw new AuthError("Not authenticated", 401);
  }

  if (!res.ok) {
    throw new AuthError(`Failed to fetch current user: ${res.status}`, res.status);
  }

  return res.json();
}
