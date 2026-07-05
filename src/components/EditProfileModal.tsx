"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAlert } from "@/components/AlertProvider";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { update } = useSession();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      setError("");
      setPassword("");
      setConfirmPassword("");
      setIsSlugManuallyEdited(false);
      
      // Fetch current profile data
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setName(data.name || "");
            setEmail(data.email || "");
            setSlug(data.slug || "");
            setBio(data.bio || "");
          }
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load profile data");
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, bio, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
      } else {
        await update({ name }); 
        onClose();
        showAlert({ 
          type: "success", 
          title: "Success", 
          message: "Profile updated successfully" 
        });
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors rounded-md p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {fetching ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800/30">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email <span className="text-zinc-400 text-xs font-normal ml-1">(Cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-shadow"
                  placeholder="Your full name"
                />
              </div>



              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-shadow resize-none"
                  placeholder="Tell us a little about yourself"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  New Password <span className="text-zinc-400 text-xs font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-shadow"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm Password <span className="text-zinc-400 text-xs font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-shadow"
                  placeholder="Retype new password"
                  required={!!password}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-zinc-900 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
