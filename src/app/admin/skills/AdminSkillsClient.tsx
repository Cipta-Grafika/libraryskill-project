"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Search, User, Filter } from "lucide-react";

type SkillData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  updatedAt: Date;
  author: { name: string };
  category?: { name: string } | null;
};

export default function AdminSkillsClient({ initialSkills }: { initialSkills: SkillData[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return initialSkills;
    
    const q = searchQuery.toLowerCase();
    return initialSkills.filter(skill => 
      skill.title.toLowerCase().includes(q) ||
      skill.slug.toLowerCase().includes(q) ||
      (skill.description && skill.description.toLowerCase().includes(q)) ||
      (skill.author?.name && skill.author.name.toLowerCase().includes(q))
    );
  }, [initialSkills, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <span className="review-badge published">PUBLISHED</span>;
      case "APPROVED": return <span className="review-badge approved">APPROVED</span>;
      case "REJECTED": return <span className="review-badge rejected">REJECTED</span>;
      case "IN_REVIEW": return <span className="review-badge in_review">IN REVIEW</span>;
      case "ARCHIVED": return <span className="review-badge bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">ARCHIVED</span>;
      case "DRAFT": return <span className="review-badge draft">DRAFT</span>;
      default: return <span className="review-badge bg-zinc-100 text-zinc-500">{status}</span>;
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="review-header-section" style={{ marginBottom: 0 }}>
          <h1 className="review-title">Manage All Skills</h1>
          <p className="review-subtitle">
            Admin view of all skills across the platform, including drafts.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Search skills..." 
              className="studio-input pl-10 w-full"
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="studio-btn studio-btn-secondary px-3" aria-label="Filter">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="review-empty-state">
          <Search className="review-empty-icon" />
          <h3 className="review-empty-title">No skills found</h3>
          <p className="review-empty-desc">
            {searchQuery ? "No skills matched your search criteria." : "There are no skills to display yet."}
          </p>
        </div>
      ) : (
        <div className="review-grid">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="review-card">
              <div className="review-card-header">
                {getStatusBadge(skill.status)}
                {skill.category && (
                  <span className="review-badge-category">
                    {skill.category.name}
                  </span>
                )}
              </div>
              
              <h2 className="review-card-title">{skill.title}</h2>
              <p className="review-card-desc">
                {skill.description || "No description provided."}
              </p>
              
              <div className="review-card-meta">
                <div className="review-card-meta-item">
                  <User size={14} />
                  <span>{skill.author?.name || "Unknown Author"}</span>
                </div>
                <span>•</span>
                <span className="text-xs">
                  Updated {formatDistanceToNow(new Date(skill.updatedAt))} ago
                </span>
              </div>

              <div className="review-card-footer">
                <Link href={`/admin/skills/${skill.slug}`} className="review-btn review-btn-secondary w-full text-center transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
