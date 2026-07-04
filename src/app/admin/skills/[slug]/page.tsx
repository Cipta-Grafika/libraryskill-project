import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";
import { User, Clock } from "lucide-react";
import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";

interface AdminSkillDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function AdminSkillDetailPage({ params }: AdminSkillDetailPageProps) {
  const resolvedParams = await params;

  const skill = await db.skill.findFirst({
    where: {
      slug: resolvedParams.slug,
    },
    include: {
      author: true,
      category: true,
      reviews: {
        include: { reviewer: true },
        orderBy: { createdAt: 'desc' },
      }
    },
  });

  if (!skill) {
    notFound();
  }

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
      <PageBanner 
        backHref="/admin/skills" 
        backText="Back to Skills" 
      />
      <div className="review-container pt-4 md:pt-8">

        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-5">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <article className="review-content">
              <header className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {getStatusBadge(skill.status)}
                  {skill.category && (
                    <span className="review-badge-category">
                      {skill.category.name}
                    </span>
                  )}
                </div>
                
                <h1 className="review-detail-title">
                  {skill.title}
                </h1>
                
                <p className="review-detail-desc">
                  {skill.description}
                </p>
                
                <div className="review-detail-meta">
                  <div className="review-detail-meta-item">
                    <User size={16} />
                    <span className="review-detail-meta-item-bold">{skill.author.name}</span>
                  </div>
                  <span>•</span>
                  <div className="review-detail-meta-item">
                    <Clock size={16} />
                    <span>Updated {formatDistanceToNow(new Date(skill.updatedAt))} ago</span>
                  </div>
                </div>
                
                {skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {skill.tags.map((tag) => (
                      <span key={tag} className="studio-tag-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="review-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {skill.content || "*No content provided.*"}
                </ReactMarkdown>
              </div>
            </article>
          </div>

          {/* Aside / Sidebar */}
          <aside className="w-full lg:w-80 flex flex-col shrink-0">
            <div className="review-aside-card">
              {/* Author Information Section */}
              <div className="p-4 md:p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[var(--studio-text)]">
                  <User size={16} className="text-[var(--studio-text-muted)]" />
                  Author Information
                </h3>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-[var(--studio-text)]">{skill.author.name}</span>
                  <span className="text-sm text-[var(--studio-text-muted)]">{skill.author.email}</span>
                </div>
              </div>

              <hr className="border-[var(--studio-border)]" />

              {/* Review History Section */}
              <div className="p-4 md:p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[var(--studio-text)]">
                  <Clock size={16} className="text-[var(--studio-text-muted)]" />
                  Review History
                </h3>
                
                {skill.reviews.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {skill.reviews.map((review) => (
                      <div key={review.id} className="flex flex-col gap-3 border-b border-[var(--studio-border)] pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[var(--studio-text)] truncate">{review.reviewer.name}</span>
                          <span className="text-xs text-[var(--studio-text-muted)] shrink-0 ml-2">{formatDistanceToNow(new Date(review.createdAt))} ago</span>
                        </div>
                        <div>
                          {getStatusBadge(review.status)}
                        </div>
                        {review.noteMarkdown && (
                          <p className="text-sm text-[var(--studio-text-muted)] bg-[var(--studio-surface-hover)] p-3 rounded-lg border border-[var(--studio-border)] leading-relaxed">
                            {review.noteMarkdown}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--studio-text-muted)] italic">No review history yet.</p>
                )}
              </div>

              {/* Actions Section */}
              {skill.status === "PUBLISHED" && (
                <>
                  <hr className="border-[var(--studio-border)]" />
                  <div className="p-4 md:p-5">
                    <Link 
                      href={`/${skill.category?.slug || 'uncategorized'}/${skill.slug}`}
                      className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 hover:opacity-90"
                      style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Public Page
                    </Link>
                  </div>
                </>
              )}
            </div>
          </aside>
          
        </div>
      </div>
    </>
  );
}
