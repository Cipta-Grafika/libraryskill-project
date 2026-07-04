"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("AUTHOR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.message || "Registration failed");
        } else {
          throw new Error("Server returned an unexpected response. Please try again.");
        }
      }

      router.push("/auth/login?registered=true");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-container relative">
      <Link href="/" className="absolute top-4 left-4 z-50 flex items-center gap-2 hover:opacity-80 transition-opacity" style={{ textDecoration: 'none' }}>
        <div className="header-logo-icon">L</div>
        <span className="header-title">LibrarySkill</span>
      </Link>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join LibrarySkill today</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                placeholder="John Doe"
              />
            </div>

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
                  minLength={6}
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
            
            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingRight: "2.5rem" }}
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-input-icon-btn"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="auth-select"
              >
                <option value="AUTHOR">Author (Can create drafts)</option>
                <option value="REVIEWER">Reviewer (Can review drafts)</option>
                <option value="SUPERADMIN">Superadmin (Full access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          
          <div className="auth-footer">
            Already have an account?{" "}
            <Link href="/auth/login" className="auth-link">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
