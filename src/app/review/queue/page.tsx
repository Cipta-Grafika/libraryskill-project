import { db } from "@/lib/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Clock, User } from "lucide-react";

// Server component to fetch skills ready for review
export default async function ReviewQueuePage() {
  const queuedSkills = await db.skill.findMany({
    where: {
      status: "IN_REVIEW",
    },
    include: {
      author: true,
      category: true,
    },
    orderBy: {
      updatedAt: "asc", // Oldest first for queue
    },
  });

  return (
    <div className="review-container">
      <div className="review-header-section">
        <h1 className="review-title">Review Queue</h1>
        <p className="review-subtitle">
          Skills submitted by authors that are waiting for your review.
        </p>
      </div>

      {queuedSkills.length === 0 ? (
        <div className="review-empty-state">
          <Clock className="review-empty-icon" />
          <h3 className="review-empty-title">Queue is empty</h3>
          <p className="review-empty-desc">
            Awesome! All submitted skills have been reviewed. Check back later for new submissions.
          </p>
        </div>
      ) : (
        <div className="review-grid">
          {queuedSkills.map((skill) => (
            <div key={skill.id} className="review-card">
              <div className="review-card-header">
                <span className="review-badge in_review">IN REVIEW</span>
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
                <div className="review-card-meta-item">
                  <Clock size={14} />
                  <span>Submitted {formatDistanceToNow(new Date(skill.updatedAt))} ago</span>
                </div>
              </div>

              <div className="review-card-footer">
                <Link href={`/review/skills/${skill.slug}`} className="review-btn w-full">
                  Start Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
