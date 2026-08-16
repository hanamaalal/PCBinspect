'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User,Eye, EyeOff} from 'lucide-react';
import Image from "next/image";
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
    const{login}=useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
     await login(email,password);
      router.push('/dashboard');
    } catch (err: any) {

  setError(
    err.response?.data?.message 
    ?? "Identifiants incorrects"
  );


    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/back.png')",
          filter: 'brightness(0.9)',
        }}
      />

    
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-2xl">

          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
                 <Image  src="/images/Logo.png" alt="logo" width={48} height={48}/>
                  
            </div>
            <span className="text-lg font-semibold text-gray-800">PCBInspect</span>
            <h1 className="text-2xl font-bold text-gray-900">Authentification</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="mb-1.5 block text-sm text-gray-600">
                Identifiant Personnel
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Identifiant"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
                <User
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}