"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api } from "../lib/api";

export type AuthUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role:
    | "CUSTOMER"
    | "SALON_ADMIN"
    | "STAFF"
    | "SUPER_ADMIN";
  createdAt?: string;
};

export type RegisterCustomerData = {
  name: string;
  email?: string;
  phone?: string;
  password: string;
};

export type RegisterSalonOwnerData = {
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  password: string;

  salonName: string;
  salonPhone?: string;
  salonEmail?: string;

  address: string;
  city: string;
  state: string;
  postalCode?: string;
  description?: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type RegisterResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    identifier: string,
    password: string,
  ) => Promise<AuthUser>;

  registerCustomer: (
    data: RegisterCustomerData,
  ) => Promise<AuthUser>;

  registerSalonOwner: (
    data: RegisterSalonOwnerData,
  ) => Promise<AuthUser>;

  logout: () => void;

  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

const TOKEN_KEY = "salonos_token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    api<AuthUser>("/auth/me", {
      token: storedToken,
    })
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(
    identifier: string,
    password: string,
  ): Promise<AuthUser> {
    const response =
      await api<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            identifier,
            password,
          }),
        },
      );

    localStorage.setItem(
      TOKEN_KEY,
      response.token,
    );

    setToken(response.token);
    setUser(response.user);

    return response.user;
  }

  async function registerCustomer(
    data: RegisterCustomerData,
  ): Promise<AuthUser> {
    const response =
      await api<RegisterResponse>(
        "/auth/register/customer",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

    localStorage.setItem(
      TOKEN_KEY,
      response.token,
    );

    setToken(response.token);
    setUser(response.user);

    return response.user;
  }

  async function registerSalonOwner(
    data: RegisterSalonOwnerData,
  ): Promise<AuthUser> {
    const response =
      await api<RegisterResponse>(
        "/auth/register/salon-owner",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

    localStorage.setItem(
      TOKEN_KEY,
      response.token,
    );

    setToken(response.token);
    setUser(response.user);

    return response.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser =
        await api<AuthUser>("/auth/me", {
          token,
        });

      setUser(currentUser);
    } catch {
      logout();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated:
          !!user && !!token,
        login,
        registerCustomer,
        registerSalonOwner,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}