import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { PageBanner } from "@/components/PageBanner";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import modelsData from "@/data/models.json";

interface PublicSkillPageProps {
  params: {
    categorySlug: string;
    skillSlug: string;
  };
}

// Generate Dynamic SEO Metadata
export async function generateMetadata(
  { params }: PublicSkillPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const skill = await db.skill.findFirst({
    where: {
      slug: resolvedParams.skillSlug,
      category: {
        slug: resolvedParams.categorySlug,
      },
    },
    include: {
      category: true,
      author: true,
    },
  });

  if (!skill || skill.status !== "PUBLISHED") {
    return {
      title: "Not Found - LibrarySkill",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${skill.title} - LibrarySkill`,
    description: skill.description || `Read ${skill.title} by ${skill.author.name} on LibrarySkill.`,
    keywords: skill.tags.join(", "),
    openGraph: {
      title: skill.title,
      description: skill.description || "",
      type: "article",
      authors: [skill.author.name],
      tags: skill.tags,
      images: [...previousImages],
    },
    twitter: {
      card: "summary_large_image",
      title: skill.title,
      description: skill.description || "",
    },
    alternates: {
      canonical: `/${resolvedParams.categorySlug}/${resolvedParams.skillSlug}`,
      types: {
        "text/markdown": `${process.env.NEXT_PUBLIC_APP_URL || 'https://libraryskill.com'}/raw/${resolvedParams.categorySlug}/${resolvedParams.skillSlug}.md`
      }
    },
  };
}

export default async function PublicSkillPage({ params }: PublicSkillPageProps) {
  const resolvedParams = await params;

  const skill = await db.skill.findFirst({
    where: {
      slug: resolvedParams.skillSlug,
      category: {
        slug: resolvedParams.categorySlug,
      },
    },
    include: {
      author: true,
      category: true,
    },
  });

  console.log("DEBUG PublicSkillPage:", { resolvedParams, skillFound: !!skill });

  if (!skill || skill.status !== "PUBLISHED") {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": skill.title,
    "author": {
      "@type": "Person",
      "name": skill.author.name
    },
    "about": [
      ...skill.tags,
      "AI Agent Skill"
    ],
    "inLanguage": "id-ID"
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <PageBanner backHref="/skills" backText="Back to Skills" />
      
      <main className="public-skill-container flex-grow mt-4 md:mt-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="public-skill-layout">
          
          {/* Main Content (Left) */}
          <div className="public-skill-main">
            <div className="public-skill-card">
              <div className="public-skill-card-header">
                <BookOpen size={16} className="text-zinc-500" />
                <span>{skill.slug}.md</span>
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
                <div className="review-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {skill.content || "*No content provided.*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="public-skill-sidebar">
            
            {/* People Section */}
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
                  <strong>Published:</strong> {new Date(skill.publishedAt || skill.updatedAt).toLocaleDateString()}
                </p>
                <p className="public-sidebar-text">
                  <Link href={`/raw/${skill.category?.slug}/${skill.slug}.md`} target="_blank" className="text-primary-600 hover:underline">
                    View Raw Markdown
                  </Link>
                </p>
                <p className="public-sidebar-text">
                  <a href={`/raw/${skill.category?.slug}/${skill.slug}.md`} download={`${skill.title}-${skill.slug}.md`} className="text-primary-600 hover:underline">
                    Download Skill
                  </a>
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
      <Footer />
      <BackToTop />
    </div>
  );
}
