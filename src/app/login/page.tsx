"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Replace with real login logic
    setTimeout(() => {
      setLoading(false);
      if (email === "demo@cashapp.com" && password === "demo123") {
        window.location.href = "/dashboard";
      } else {
        setError("Invalid email or password");
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <Image src="/icons/cashapp-logo.png" alt="CashApp Logo" width={60} height={60} className="mb-4" />
        <h1 className="text-2xl font-bold text-blue-800 mb-2">Sign in to CashApp</h1>
        <p className="text-blue-700 mb-6 text-center">Manage your business cashbook, staff, and approvals in one place.</p>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-sm text-blue-700">
          Don&apos;t have an account? <Link href="/register" className="underline font-semibold">Sign up</Link>
        </div>
      </div>
      <div className="mt-8 text-blue-700 text-center text-xs opacity-70">&copy; {new Date().getFullYear()} CashApp. All rights reserved.</div>
    </main>
  );
}
