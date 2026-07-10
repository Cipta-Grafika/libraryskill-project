import { db as prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { BookOpen, User, List } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BackToTop } from "@/components/BackToTop";
import { PageBanner } from "@/components/PageBanner";
import Link from "next/link";

interface AdminPreviewDocPageProps {
  params: {
    slug: string[];
  };
}

export default async function AdminPreviewDocPage({ params }: AdminPreviewDocPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

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

  const doc = await prisma.doc.findFirst({
    where: {
      slug: docSlug,
    },
    include: {
      author: true,
      series: {
        include: {
          docs: {
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
      <PageBanner backHref="/admin/docs" backText="Back to Docs">
        <span className="header-role-badge" style={{ display: 'inline-block', margin: 0 }}>preview</span>
      </PageBanner>
      
      <main className="public-skill-container flex-grow mt-4 md:mt-8">
        <div className="public-skill-layout">
          
          {/* Main Content (Left) */}
          <div className="public-skill-main">
            <div className="public-skill-card">
              <div className="public-skill-card-header min-w-0">
                <BookOpen size={16} className="text-zinc-500 shrink-0" />
                <span className="truncate" title={`${doc.slug}.md`}>{doc.slug}.md</span>
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
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={doc.content || ""} />
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
                        // Admin preview needs to route to admin preview pages
                        const href = `/admin/docs/view/${doc.seriesSlug}/${order}/${seriesDoc.slug}`;
                        
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
                  <strong>Status:</strong> {doc.status}
                </p>
                <p className="public-sidebar-text public-published-indicator">
                  <span className="public-published-dot" style={{ backgroundColor: 'transparent' }}></span>
                  <strong>Updated:</strong> {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
                <p className="public-sidebar-text">
                  <span className="text-zinc-400 dark:text-zinc-500 cursor-not-allowed">
                    Raw Markdown (Disabled in Preview)
                  </span>
                </p>
              </div>
            </div>

          </aside>

        </div>
      </main>
      <BackToTop />
    </div>
  );
}
