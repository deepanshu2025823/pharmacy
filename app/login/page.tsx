"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

const STORAGE_KEY = "pharmacy_user";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/checkout";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login failed");
      }

      const json = await res.json();
      const user = json.data as UserProfile;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }

      router.push(nextPath);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message?.includes("error")
          ? err.message
          : "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-6 md:py-10">
      <h1 className="text-xl md:text-2xl font-bold mb-2">
        Login to continue
      </h1>
      <p className="text-xs md:text-sm text-slate-600 mb-4">
        Use your registered mobile number or email to continue to checkout.
      </p>

      {error && (
        <p className="mb-3 text-xs text-red-500">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-3 text-xs md:text-sm"
      >
        <div className="space-y-1">
          <label className="block text-[11px] text-slate-600">
            Mobile number or Email
          </label>
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Registered mobile or email"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] text-slate-600">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold py-2.5 hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-1">
          New to Pharmacy?{" "}
          <button
            type="button"
            onClick={() =>
              router.push(`/register?next=${encodeURIComponent(nextPath)}`)
            }
            className="text-emerald-600 font-semibold hover:underline"
          >
            Create an account
          </button>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-sm mx-auto px-4 py-6 md:py-10">
            <div className="text-center">Loading...</div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}