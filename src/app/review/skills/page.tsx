import { db } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Search, User, Filter } from "lucide-react";

// Server component to fetch all skills (except DRAFTs)
export default async function ReviewAllSkillsPage() {
  const allSkills = await db.skill.findMany({
    where: {
      status: {
        not: "DRAFT",
      },
    },
    include: {
      author: true,
      category: true,
    },
    orderBy: {
      updatedAt: "desc", // Newest first
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="review-badge published">PUBLISHED</span>;
      case "APPROVED":
        return <span className="review-badge approved">APPROVED</span>;
      case "REJECTED":
        return <span className="review-badge rejected">REJECTED</span>;
      case "IN_REVIEW":
        return <span className="review-badge in_review">IN REVIEW</span>;
      case "ARCHIVED":
        return <span className="review-badge bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">ARCHIVED</span>;
      default:
        return <span className="review-badge bg-zinc-100 text-zinc-500">{status}</span>;
    }
  };

  return (
    <div className="review-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="review-header-section" style={{ marginBottom: 0 }}>
          <h1 className="review-title">All Skills</h1>
          <p className="review-subtitle">
            Browse and manage all submitted skills across the platform.
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Search skills..." 
              className="studio-input pl-10"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button className="studio-btn studio-btn-secondary px-3" aria-label="Filter">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {allSkills.length === 0 ? (
        <div className="review-empty-state">
          <Search className="review-empty-icon" />
          <h3 className="review-empty-title">No skills found</h3>
          <p className="review-empty-desc">
            There are no submitted skills to display yet.
          </p>
        </div>
      ) : (
        <div className="review-grid">
          {allSkills.map((skill) => (
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
                  <span>{skill.author.name || "Unknown Author"}</span>
                </div>
                <span>•</span>
                <span className="text-xs">
                  Updated {formatDistanceToNow(new Date(skill.updatedAt))} ago
                </span>
              </div>

              <div className="review-card-footer">
                <Link href={`/review/skills/${skill.slug}`} className="review-btn review-btn-secondary w-full text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
