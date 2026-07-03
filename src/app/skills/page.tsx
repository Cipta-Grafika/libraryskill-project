import { Header } from "@/components/Header";
import { DashboardSearch } from "@/components/DashboardSearch";
import { ChevronRight, Sparkles, Plus, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Explore Skills - LibrarySkill",
  description: "Search and explore published skills on LibrarySkill.",
};

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
        <h1 className="dashboard-title mb-8 mt-0 text-center relative z-10">Explore our skills!</h1>
        <div className="w-full relative z-10" style={{ maxWidth: '56rem', padding: '0 1.5rem', marginBottom: '-3rem' }}>
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
    </>
  );
}
