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
import { BookOpen, User, List } from "lucide-react";

interface PublicDocPageProps {
  params: {
    slug: string[];
  };
}

// Generate Dynamic SEO Metadata
export async function generateMetadata(
  { params }: PublicDocPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug;
  let docSlug = "";

  if (slugArray.length === 1) {
    docSlug = slugArray[0];
  } else if (slugArray.length === 3) {
    docSlug = slugArray[2];
  } else {
    return { title: "Not Found - LibrarySkill" };
  }

  const doc = await db.doc.findFirst({
    where: { slug: docSlug, status: "PUBLISHED" },
    include: { author: true },
  });

  if (!doc) {
    return { title: "Not Found - LibrarySkill" };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${doc.title} - LibrarySkill`,
    description: doc.description || `Read ${doc.title} by ${doc.author.name} on LibrarySkill.`,
    openGraph: {
      title: doc.title,
      description: doc.description || "",
      type: "article",
      authors: [doc.author.name],
      images: [...previousImages],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description || "",
    },
    alternates: {
      canonical: `/docs/${slugArray.join("/")}`,
    },
  };
}

export default async function PublicDocPage({ params }: PublicDocPageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug;
  let docSlug = "";

  if (slugArray.length === 1) {
    docSlug = slugArray[0];
  } else if (slugArray.length === 3) {
    docSlug = slugArray[2];
  } else {
    notFound();
  }

  const doc = await db.doc.findFirst({
    where: { slug: docSlug, status: "PUBLISHED" },
    include: {
      author: true,
      series: {
        include: {
          docs: {
            where: { status: "PUBLISHED" },
            orderBy: { seriesOrder: "asc" },
            select: { title: true, slug: true, seriesOrder: true, seriesSlug: true },
          }
        }
      }
    },
  });

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <PageBanner backHref="/docs" backText="Back to Docs" />

      <main className="public-skill-container flex-grow mt-4 md:mt-8">
        <div className="public-skill-layout">

          {/* Main Content (Left) */}
          <div className="public-skill-main">
            <div className="public-skill-card">
              <div className="public-skill-card-header">
                <BookOpen size={16} className="text-zinc-500" />
                <span>{doc.slug}.md</span>
              </div>

              <div className="public-skill-card-body" style={{ borderBottom: '1px solid var(--studio-border)' }}>
                <h1 className="public-skill-title">{doc.title}</h1>
                {doc.description && (
                  <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    {doc.description}
                  </p>
                )}
              </div>

              <div className="public-skill-card-body pt-8">
                <div className="review-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {doc.content || "*No content provided.*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="public-skill-sidebar">

            <div className="public-sidebar-card">
              {/* Author Section */}
              <div className="public-sidebar-card-header">Author</div>
              <div className="public-sidebar-card-body">
                <div className="public-author-item">
                  <div className="public-author-avatar">
                    <User size={20} />
                  </div>
                  <span className="public-author-name">{doc.author.name}</span>
                </div>
              </div>

              {/* Series Section */}
              {doc.series && (
                <>
                  <div className="public-sidebar-card-header flex items-center gap-2">
                    <List size={16} /> Content Series
                  </div>
                  <div className="public-sidebar-card-body space-y-2">
                    <div className="text-sm font-medium mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      {doc.series.title}
                    </div>
                    <ul className="space-y-2">
                      {doc.series.docs.map((seriesDoc, index) => {
                        const order = seriesDoc.seriesOrder ?? (index + 1);
                        const isCurrent = seriesDoc.slug === doc.slug;
                        const href = `/docs/${doc.seriesSlug}/${order}/${seriesDoc.slug}`;

                        return (
                          <li key={seriesDoc.slug} className="flex items-start gap-2 text-sm">
                            <span className="font-mono text-zinc-400 min-w-[2ch]">{order}.</span>
                            <Link
                              href={href}
                              className={`hover:underline flex-grow ${isCurrent ? 'text-primary-600 font-semibold' : 'text-zinc-600 dark:text-zinc-400'}`}
                            >
                              {seriesDoc.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}

              {/* Metadata Section */}
              <div className="public-sidebar-card-header">Info</div>
              <div className="public-sidebar-card-body space-y-2">
                <p className="public-sidebar-text public-published-indicator">
                  <span className="public-published-dot"></span>
                  <strong>Published:</strong> {new Date(doc.publishedAt || doc.updatedAt).toLocaleDateString()}
                </p>
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
