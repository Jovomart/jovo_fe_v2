import { Suspense } from "react";
import OrdersClient from "./OrdersClient";

// Suspense is required here because OrdersClient uses useSearchParams().
// Without it, Next.js App Router throws during SSR and the page 404s.
export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#B42225] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading your orders…</p>
          </div>
        </div>
      }
    >
      <OrdersClient />
    </Suspense>
  );
}