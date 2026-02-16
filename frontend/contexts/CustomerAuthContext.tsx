"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  getCurrentCustomer,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type CustomerPublic,
  type CustomerLoginRequest,
  type CustomerRegisterRequest,
} from "@/lib/api/customer-auth";

type CustomerAuthState = {
  customer: CustomerPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type CustomerAuthContextValue = CustomerAuthState & {
  login: (data: CustomerLoginRequest) => Promise<{ success: boolean; message?: string }>;
  register: (data: CustomerRegisterRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CustomerAuthState>({
    customer: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshCustomer = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await getCurrentCustomer();
      if (res.success && res.data) {
        setState({
          customer: res.data,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          customer: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch {
      setState({
        customer: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  const login = useCallback(
    async (data: CustomerLoginRequest) => {
      const res = await apiLogin(data);
      if (res.success) {
        await refreshCustomer();
        return { success: true };
      }
      return { success: false, message: res.message ?? "Anmeldung fehlgeschlagen" };
    },
    [refreshCustomer]
  );

  const register = useCallback(
    async (data: CustomerRegisterRequest) => {
      const res = await apiRegister(data);
      if (res.success) {
        await refreshCustomer();
        return { success: true };
      }
      return { success: false, message: res.message ?? "Registrierung fehlgeschlagen" };
    },
    [refreshCustomer]
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setState({
      customer: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const value: CustomerAuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshCustomer,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}

export function useCustomerAuthOptional() {
  return useContext(CustomerAuthContext);
}
