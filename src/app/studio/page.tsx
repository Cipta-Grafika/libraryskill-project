"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, BookOpen, Clock, CheckCircle, Edit3 } from "lucide-react";
import { useSession } from "next-auth/react";

type Skill = {
  id: string;
  status: string;
};

export default function AuthorDashboardPage() {
  const { data: session } = useSession();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSkills(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = {
    total: skills.length,
    drafts: skills.filter(s => s.status === "DRAFT").length,
    inReview: skills.filter(s => s.status === "IN_REVIEW").length,
    published: skills.filter(s => s.status === "PUBLISHED").length,
  };

  return (
    <div className="studio-container w-full">
      <div className="studio-header">
        <div>
          <h1 className="studio-title">
            Welcome back, {session?.user?.name || 'Author'}!
          </h1>
          <p className="studio-subtitle">
            Here&apos;s an overview of your prompt documentation studio.
          </p>
        </div>
        <div className="studio-actions">
          <Link 
            href="/studio/skills/new" 
            className="studio-btn studio-btn-primary"
          >
            <PlusCircle size={18} />
            <span>Create New Skill</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading your dashboard...</div>
      ) : (
        <div className="studio-stats-grid">
          <div className="studio-stat-card">
            <div className="studio-stat-header">
              <BookOpen size={16} className="text-blue-500" />
              <span className="studio-stat-title">Total Skills</span>
            </div>
            <span className="studio-stat-value">{stats.total}</span>
          </div>
          
          <div className="studio-stat-card">
            <div className="studio-stat-header">
              <Edit3 size={16} className="text-zinc-400" />
              <span className="studio-stat-title">Drafts</span>
            </div>
            <span className="studio-stat-value">{stats.drafts}</span>
          </div>

          <div className="studio-stat-card">
            <div className="studio-stat-header">
              <Clock size={16} className="text-yellow-500" />
              <span className="studio-stat-title">In Review</span>
            </div>
            <span className="studio-stat-value">{stats.inReview}</span>
          </div>

          <div className="studio-stat-card">
            <div className="studio-stat-header">
              <CheckCircle size={16} className="text-green-500" />
              <span className="studio-stat-title">Published</span>
            </div>
            <span className="studio-stat-value">{stats.published}</span>
          </div>
        </div>
      )}
    </div>
  );
}
