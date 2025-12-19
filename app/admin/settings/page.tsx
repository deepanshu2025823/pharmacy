"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const CUSTOMER_ID = 1;

  const changePassword = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: CUSTOMER_ID,
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      setMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      setMessage(e.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Lock /> Security Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Change your account password
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          {message && (
            <p className="text-sm font-medium text-emerald-600">
              {message}
            </p>
          )}

          <button
            onClick={changePassword}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
