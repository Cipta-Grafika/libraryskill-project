import { db as prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { BookOpen, User } from "lucide-react";
import modelsData from "@/data/models.json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BackToTop } from "@/components/BackToTop";

interface PreviewSkillPageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { PageBanner } from "@/components/PageBanner";

export default async function PreviewSkillPage({ params }: PreviewSkillPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const { slug } = await params;

  const skill = await prisma.skill.findFirst({
    where: {
      slug,
    },
    include: {
      author: true,
      category: true,
    },
  });

  if (!skill) {
    notFound();
  }

  // Security check: Only the author or SUPERADMIN can view this preview.
  if (skill.authorId !== session.user.id && session.user.role !== "SUPERADMIN") {
    redirect("/studio/skills");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageBanner backHref="/studio/skills" backText="Back to Skills">
        <span className="header-role-badge" style={{ display: 'inline-block', margin: 0 }}>preview</span>
      </PageBanner>
      
      <main className="public-skill-container flex-grow mt-4 md:mt-8">
        <div className="public-skill-layout">
          
          {/* Main Content (Left) */}
          <div className="public-skill-main">
            <div className="public-skill-card">
              <div className="public-skill-card-header min-w-0">
                <BookOpen size={16} className="text-zinc-500 shrink-0" />
                <span className="truncate" title={`${skill.slug}.md`}>{skill.slug}.md</span>
              </div>
              
              <div className="public-skill-card-body" style={{ borderBottom: '1px solid var(--studio-border)' }}>
                <h1 className="public-skill-title">{skill.title}</h1>
                {skill.description && (
                  <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    {skill.description}
                  </p>
                )}
              </div>
                
              <div className="public-skill-card-body pt-8">
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={skill.content || ""} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="public-skill-sidebar">
            
            <div className="public-sidebar-card">
              {/* People Section */}
              <div className="public-sidebar-card-header">Author</div>
              <div className="public-sidebar-card-body">
                <div className="public-author-item">
                  <div className="public-author-avatar">
                    <User size={20} />
                  </div>
                  <span className="public-author-name">{skill.author.name}</span>
                </div>
              </div>

              {/* Top languages / Categories Section */}
              {skill.category && (
                <>
                  <div className="public-sidebar-card-header">Scope Category</div>
                  <div className="public-sidebar-card-body">
                    <div className="public-category-item">
                      <span className="public-category-dot"></span>
                      {skill.category.name}
                    </div>
                  </div>
                </>
              )}

              {/* Keywords Section */}
              {skill.tags && skill.tags.length > 0 && (
                <>
                  <div className="public-sidebar-card-header">Keywords</div>
                  <div className="public-sidebar-card-body">
                    <div className="public-topics-list">
                      {skill.tags.map(tag => (
                        <span key={tag} className="public-topic-badge">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Metadata Section */}
              <div className="public-sidebar-card-header">Info</div>
              <div className="public-sidebar-card-body space-y-2">
                <p className="public-sidebar-text public-published-indicator">
                  <span className="public-published-dot"></span>
                  <strong>Updated:</strong> {new Date(skill.updatedAt).toLocaleDateString()}
                </p>
                <p className="public-sidebar-text">
                  <span className="text-zinc-400 dark:text-zinc-500 cursor-not-allowed">
                    Raw Markdown (Disabled in Preview)
                  </span>
                </p>
              </div>

              {/* Compatibility Section */}
              <div className="public-sidebar-card-header">Compatibility</div>
              <div className="public-sidebar-card-body">
                <div className="public-topics-list">
                  {modelsData.map((model) => (
                    <span key={model.id} className="public-topic-badge" style={{ 
                      backgroundColor: 'transparent',
                      border: '1px solid var(--studio-border)',
                      color: 'var(--studio-text-muted)',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '999px'
                    }}>
                      {model.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </aside>

        </div>
      </main>
      <BackToTop />
    </div>
  );
}
