"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/i18n/locale-context";



export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(t.login.invalidCredentials);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  function fillDemo() {
    setEmail("demo@laby.app");
    setPassword("demo1234");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3">
            <Image src="/laby-finance-logo.png" alt="Laby Finance" width={64} height={64} className="rounded-xl" priority />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t.login.title}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t.login.subtitle}</p>
        </div>

        {/* Demo banner */}
        <button
          type="button"
          onClick={fillDemo}
          className="w-full mb-4 flex items-center gap-3 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-left hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors group"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-800 group-hover:bg-primary-200 dark:group-hover:bg-primary-700 transition-colors">
            <PlayCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">Try Demo</p>
            <p className="text-xs text-primary-500 dark:text-primary-400 mt-0.5">
              demo@laby.app · demo1234
            </p>
          </div>
          <span className="text-xs text-primary-500 dark:text-primary-400 shrink-0">Click to fill →</span>
        </button>

        {/* Login form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t.login.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label={t.login.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              {t.login.signIn}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-4">
          {t.login.tagline}
        </p>
      </div>
    </div>
  );
}
