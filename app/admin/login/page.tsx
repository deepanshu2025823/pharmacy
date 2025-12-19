"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldPlus } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }

    window.location.href = "/admin/dashboard";

  } catch {
    setError("Something went wrong");
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-gray-900 to-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl p-8 animate-fadeIn">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShieldPlus className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Pharmacy Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Secure healthcare administration access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pharmacy.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11
                focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-emerald-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-emerald-600 text-white py-2.5
            font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Authorized medical personnel only
        </p>
      </div>
    </div>
  );
}
