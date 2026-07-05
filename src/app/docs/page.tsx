import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardSearch } from "@/components/DashboardSearch";
import { ChevronRight, FileText, Plus, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Explore All Docs | Discover the Best Technical Documentation - LibrarySkill",
    description: "Browse, read, and discover the best published technical documentation and series on LibrarySkill.",
    keywords: ["library skill", "documentation", "technical docs", "series", "guides", "explore docs"],
    openGraph: {
      title: "Explore All Docs | Discover the Best Technical Documentation",
      description: "Browse, read, and discover the best published technical documentation and series on LibrarySkill.",
      url: "/docs",
      siteName: "LibrarySkill",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore All Docs | Discover the Best Technical Documentation",
      description: "Browse, read, and discover the best published technical documentation and series on LibrarySkill.",
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/docs",
    },
  };
}

export default async function PublicDocsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  
  let createHref = "/auth/login";
  if (role === "AUTHOR" || role === "SUPERADMIN") createHref = "/dashboard/docs/new";

  const recentDocs = await db.doc.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      seriesSlug: true,
      seriesOrder: true,
      series: {
        select: { title: true }
      }
    },
    orderBy: { publishedAt: "desc" },
    take: 5
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="w-full relative border-b border-[var(--search-border)] pt-12 pb-6 md:pt-16 md:pb-8 flex flex-col items-center">
        <div className="skills-hero-bg"></div>
        <h1 className="dashboard-title mb-2 mt-0 text-center relative z-10">Explore our documentation!</h1>
        <p className="text-center text-[var(--dash-text-muted)] max-w-2xl px-4 relative z-10 mb-8">
          Discover comprehensive guides, series, and technical documents written by our community.
        </p>
        <div className="w-full relative z-10" style={{ maxWidth: '59rem', padding: '0 1.5rem', marginBottom: '-3rem' }}>
          <DashboardSearch apiEndpoint="/api/public/docs" isPublicSearch={true} />
        </div>
      </div>

      <div className="dashboard-container flex-grow" style={{ paddingTop: '2rem' }}>
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Column 1 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title transition-colors">
                Recent Docs <ChevronRight size={14}/>
              </span>
              <Link href={createHref} className="hover:bg-[var(--card-hover)] p-1 rounded-md transition-colors text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"><Plus size={16} /></Link>
            </div>
            <div className="dashboard-card-list">
              {recentDocs.length > 0 ? (
                recentDocs.map((doc) => {
                  const href = doc.seriesSlug && doc.seriesOrder 
                    ? `/docs/${doc.seriesSlug}/${doc.seriesOrder}/${doc.slug}`
                    : `/docs/${doc.slug}`;
                  
                  return (
                    <Link href={href} key={doc.id} className="dashboard-card group">
                      <div className="dashboard-card-left flex items-center gap-3">
                        <FileText size={16} className="dashboard-card-icon text-[var(--dash-text-muted)]" />
                        <span className="text-[var(--dash-text)] font-medium">
                          {doc.series ? `${doc.series.title} ` : ''} 
                          {doc.seriesOrder ? <span className="text-zinc-500 font-mono text-xs border border-zinc-200 dark:border-zinc-800 rounded px-1 ml-1 mr-2">Part {doc.seriesOrder}</span> : ''}
                          <span className={doc.series ? "text-[var(--dash-text-muted)] font-normal" : ""}>
                            {doc.series ? `— ${doc.title}` : doc.title}
                          </span>
                        </span>
                      </div>
                      <ChevronRight size={16} className="dashboard-card-arrow opacity-0 group-hover:opacity-100 transition-opacity text-[var(--dash-text-muted)]" />
                    </Link>
                  )
                })
              ) : (
                <div className="p-4 text-center text-sm text-[var(--dash-text-muted)]">
                  No published documentation found.
                </div>
              )}
            </div>
            
            <Link href={createHref} className="dashboard-empty-card" style={{ marginTop: '1rem', width: '100%', textDecoration: 'none' }}>
              <Rocket size={16} />
              <span>Write new documentation</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
