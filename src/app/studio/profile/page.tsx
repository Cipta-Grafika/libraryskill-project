"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // In a real app, you might want a GET /api/users/me endpoint 
    // to fetch the user's bio. For now we assume bio is loaded from session 
    // or you can add the fetch logic here.
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      // Assuming you have an API route to update profile, e.g. /api/users/me
      // If not, this is a placeholder where you'd send the PUT request
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        // Update session if needed
        update();
      } else {
        setMessage("Failed to update profile.");
      }
    } catch {
      setMessage("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="studio-container w-full">
      <div className="studio-header">
        <h1 className="studio-title">Edit Profile</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="studio-form-section space-y-6">
        <div className="studio-form-group">
          <label className="studio-label">Name</label>
          <input
            type="text"
            value={session?.user?.name || ""}
            disabled
            className="studio-input opacity-70 cursor-not-allowed"
          />
        </div>
        
        <div className="studio-form-group">
          <label className="studio-label">Email</label>
          <input
            type="email"
            value={session?.user?.email || ""}
            disabled
            className="studio-input opacity-70 cursor-not-allowed"
          />
        </div>

        <div className="studio-form-group">
          <label className="studio-label">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a little bit about yourself..."
            className="studio-textarea"
            style={{ minHeight: '8rem', resize: 'none' }}
          />
          <p className="text-xs text-zinc-500 mt-1">Brief description for your profile.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="studio-btn studio-btn-primary"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
