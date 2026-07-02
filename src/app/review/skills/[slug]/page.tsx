import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ReviewForm } from "./ReviewForm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, User, Clock } from "lucide-react";
import Link from "next/link";

interface ReviewDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  // Tunggu agar parameter resolved dengan benar
  const resolvedParams = await params;

  const skill = await db.skill.findFirst({
    where: {
      slug: resolvedParams.slug,
      status: { not: "DRAFT" },
    },
    include: {
      author: true,
      category: true,
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
      default: return <span className="review-badge bg-zinc-100 text-zinc-500">{status}</span>;
    }
  };

  return (
    <div className="review-container">
      <Link href="/review/queue" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Queue
      </Link>

      <div className="review-detail-layout">
        
        {/* Kolom Kiri 30%: Review Form */}
        <div className="w-full">
          <ReviewForm skillId={skill.id} initialStatus={skill.status} />
        </div>

        {/* Kolom Kanan 70%: Postingan Content Preview */}
        <div className="w-full">
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
                  <span>Submitted {formatDistanceToNow(new Date(skill.updatedAt))} ago</span>
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

      </div>
    </div>
  );
}
