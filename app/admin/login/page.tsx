export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
          Admin Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
            Login
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
