"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

type CheckoutButtonProps = {
  disabled?: boolean;
};

export default function CheckoutButton({ disabled = false }: CheckoutButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleCheckout = () => {
    if (loading) {
      // Wait for auth state to resolve
      toast.loading("Please wait...");
      return;
    }

    if (!user) {
      // Redirect to login if not authenticated
      toast.error("Please sign in to checkout");
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    // User is authenticated, proceed to checkout
    router.push("/checkout");
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled}
      className={`w-full px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors flex items-center justify-center ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      Proceed to Checkout
    </button>
  );
}
