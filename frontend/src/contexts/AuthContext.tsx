import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { fetchMe, loginUser, registerUser } from "../api/auth";
import type { MeResponse } from "../types/auth";

const ACCESS_TOKEN_STORAGE_KEY = "buckeye.accessToken";

type AuthStatus = "anonymous" | "loading" | "authenticated";

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  me: MeResponse | null;
  errorMessage: string | null;
}

type AuthAction =
  | { type: "INIT_START" }
  | { type: "INIT_ANONYMOUS" }
  | { type: "SET_AUTH"; accessToken: string; me: MeResponse }
  | { type: "SET_ERROR"; message: string | null }
  | { type: "LOGOUT" };

const initialState: AuthState = {
  status: "loading",
  accessToken: null,
  me: null,
  errorMessage: null,
};

function assertNever(value: never): never {
  throw new Error(`Unhandled auth action: ${JSON.stringify(value)}`);
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_START":
      return { ...state, status: "loading", errorMessage: null };

    case "INIT_ANONYMOUS":
      return {
        status: "anonymous",
        accessToken: null,
        me: null,
        errorMessage: null,
      };

    case "SET_AUTH":
      return {
        status: "authenticated",
        accessToken: action.accessToken,
        me: action.me,
        errorMessage: null,
      };

    case "SET_ERROR":
      return { ...state, errorMessage: action.message };

    case "LOGOUT":
      return {
        status: "anonymous",
        accessToken: null,
        me: null,
        errorMessage: null,
      };
  }

  return assertNever(action);
}

interface AuthContextType {
  state: AuthState;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      dispatch({ type: "INIT_START" });
      const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

      if (!token) {
        dispatch({ type: "INIT_ANONYMOUS" });
        return;
      }

      try {
        const me = await fetchMe(token);
        dispatch({ type: "SET_AUTH", accessToken: token, me });
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        dispatch({ type: "INIT_ANONYMOUS" });
      }
    };

    void init();
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: "SET_ERROR", message: null });
    const res = await loginUser({ username, password });
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, res.accessToken);
    const me = await fetchMe(res.accessToken);
    dispatch({ type: "SET_AUTH", accessToken: res.accessToken, me });
  };

  const register = async (username: string, password: string) => {
    dispatch({ type: "SET_ERROR", message: null });
    await registerUser({ username, password });
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        isAuthenticated: state.status === "authenticated",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// This module exports a Provider + hook, which is a common pattern for contexts.
// Disable the react-refresh boundary rule for this export.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. Wrap your component tree with <AuthProvider>."
    );
  }
  return context;
}
