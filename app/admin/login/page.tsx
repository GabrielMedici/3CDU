"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin/upload");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#13002b] to-[#1e0047] text-white selection:bg-[#c299ff] selection:text-[#13002b]">
      <Navbar />

      <section className="pt-32 pb-20 px-6 max-w-md mx-auto">
        <div className="glass border-gold-glow rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#ffaa00]">
            Área Restrita
          </h1>
          <p className="text-center text-[#a399b8] mb-8 text-sm">
            Faça login para gerenciar as fotos da galeria.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#c299ff]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c299ff] focus:outline-none focus:ring-1 focus:ring-[#c299ff] transition-all"
                placeholder="admin@3cdu.com.br"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#c299ff]">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] focus:border-[#c299ff] focus:outline-none focus:ring-1 focus:ring-[#c299ff] transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-[rgba(255,0,0,0.1)] p-3 rounded-lg border border-red-500/20">
                {error === "Invalid login credentials" ? "Email ou senha incorretos." : error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#ffd700] to-[#ffaa00] text-[#13002b] shadow-[0_0_15px_rgba(232,170,26,0.4)] hover:shadow-[0_0_25px_rgba(232,170,26,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
