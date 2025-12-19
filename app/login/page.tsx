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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Login failed");
      }

      const user = json.data as UserProfile;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      router.push(nextPath);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials");
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
        Use your registered mobile number or email to continue.
      </p>

      {error && (
        <p className="mb-3 text-xs text-red-500">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-3"
      >
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Mobile number or Email
          </label>
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Registered mobile or email"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 text-white py-2.5 font-semibold disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
