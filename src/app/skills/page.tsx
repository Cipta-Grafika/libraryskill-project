import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardSearch } from "@/components/DashboardSearch";
import { ChevronRight, Sparkles, Plus, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return {
    title: "Explore All Skills | Discover the Best Prompts & Tutorials - LibrarySkill",
    description: "Browse, search, and discover the best published skills, prompts, and knowledge bases on LibrarySkill. Find high-quality guides for various roles.",
    keywords: ["library skill", "prompts", "knowledge base", "tutorials", "guides", "explore skills", "tech skills", "best prompts"],
    openGraph: {
      title: "Explore All Skills | Discover the Best Prompts & Tutorials",
      description: "Browse, search, and discover the best published skills, prompts, and knowledge bases on LibrarySkill.",
      url: `${baseUrl}/skills`,
      siteName: "LibrarySkill",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore All Skills | Discover the Best Prompts & Tutorials",
      description: "Browse, search, and discover the best published skills, prompts, and knowledge bases on LibrarySkill.",
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
      canonical: "/skills",
    },
  };
}

export default async function PublicSkillsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  
  let createHref = "/auth/login";
  if (role === "AUTHOR") createHref = "/studio/skills/new";
  else if (role === "SUPERADMIN") createHref = "/admin";
  else if (role === "REVIEWER") createHref = "/review";

  const recentSkills = await db.skill.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: {
        select: { name: true, slug: true }
      }
    },
    orderBy: { publishedAt: "desc" },
    take: 10
  });

  return (
    <>
      <Header />
      
      {/* Hero Search Section */}
      <div className="w-full relative border-b border-[var(--search-border)] pt-12 pb-6 md:pt-16 md:pb-8 flex flex-col items-center">
        <div className="skills-hero-bg"></div>
        <h1 className="dashboard-title mb-2 mt-0 text-center relative z-10">Explore our skills!</h1>
        <p className="text-center text-[var(--dash-text-muted)] max-w-2xl px-4 relative z-10 mb-8">
          Discover comprehensive prompt collections, system instructions, and curated AI knowledge bases tailored for maximum effectiveness.
        </p>
        <div className="w-full relative z-10" style={{ maxWidth: '59rem', padding: '0 1.5rem', marginBottom: '-3rem' }}>
          <DashboardSearch apiEndpoint="/api/public/skills" isPublicSearch={true} />
        </div>
      </div>

      <div className="dashboard-container" style={{ paddingTop: '2rem' }}>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Column 1 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title transition-colors">
                All Skills <ChevronRight size={14}/>
              </span>
              <Link href={createHref} className="hover:bg-[var(--card-hover)] p-1 rounded-md transition-colors text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"><Plus size={16} /></Link>
            </div>
            <div className="dashboard-card-list">
              {recentSkills.length > 0 ? (
                recentSkills.map((skill) => (
                  <Link href={`/${skill.category?.slug}/${skill.slug}`} key={skill.id} className="dashboard-card group">
                    <div className="dashboard-card-left flex items-center gap-3">
                      <Sparkles size={16} className="dashboard-card-icon text-[var(--dash-text-muted)]" />
                      <span className="text-[var(--dash-text)] font-medium">
                        {skill.category?.name?.toLowerCase() || 'uncategorized'} <span className="text-[var(--dash-text-muted)] font-normal">— {skill.title}</span>
                      </span>
                    </div>
                    <ChevronRight size={16} className="dashboard-card-arrow opacity-0 group-hover:opacity-100 transition-opacity text-[var(--dash-text-muted)]" />
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-[var(--dash-text-muted)]">
                  No published skills found.
                </div>
              )}
            </div>
            
            <Link href={createHref} className="dashboard-empty-card" style={{ marginTop: '1rem', width: '100%', textDecoration: 'none' }}>
              <Rocket size={16} />
              <span>Create something new</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
