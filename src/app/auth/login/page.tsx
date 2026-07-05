"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/"); 
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container relative">
      <Link href="/" className="absolute top-4 left-4 z-50 flex items-center gap-2 hover:opacity-80 transition-opacity mix-blend-multiply dark:mix-blend-screen" style={{ textDecoration: 'none' }}>
        <div className="header-logo-icon bg-transparent border-0 shadow-none text-transparent">
          <Image 
            src="/libraryskill.svg" 
            alt="LibrarySkill Logo" 
            width={32} 
            height={32} 
            className="dark:invert dark:hue-rotate-180 dark:brightness-110 transition-all object-contain scale-[1.35]"
          />
        </div>
        <span className="header-title">LibrarySkill</span>
      </Link>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your LibrarySkill account</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingRight: "2.5rem" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-icon-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
              <div className="px-4 text-sm text-zinc-500">OR</div>
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium text-sm shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Log in with Google
            </button>
          </form>
          
          <div className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="auth-link">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
