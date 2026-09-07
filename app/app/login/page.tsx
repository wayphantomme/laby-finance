"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PiggyBank } from "lucide-react";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 mb-3">
            <PiggyBank className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{t.login.title}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t.login.subtitle}</p>
        </div>

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
