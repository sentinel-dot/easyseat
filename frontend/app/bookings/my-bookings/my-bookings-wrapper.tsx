"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import { MyBookingsContent } from "./my-bookings-content";

export function MyBookingsWrapper() {
  const auth = useCustomerAuthOptional();
  const router = useRouter();

  useEffect(() => {
    if (!auth?.isLoading && auth?.isAuthenticated) {
      router.replace("/customer/bookings");
    }
  }, [auth?.isLoading, auth?.isAuthenticated, router]);

  if (auth?.isLoading) {
    return (
      <div className="mt-6 flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (auth?.isAuthenticated) {
    return (
      <div className="mt-6 flex justify-center py-12">
        <p className="text-[var(--color-muted)]">Weiterleitung zu Ihren Buchungen …</p>
      </div>
    );
  }

  return <MyBookingsContent />;
}
