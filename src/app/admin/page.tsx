import { DashboardSearch } from "@/components/DashboardSearch";
import { Rocket, Plus, ChevronRight, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  // Fetch top 5 most recently updated skills that are PUBLISHED
  const recentSkills = await db.skill.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: {
        select: { name: true }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 5
  });

  return (
    <div className="dashboard-container">
        <h1 className="dashboard-title">Explore your skills!</h1>
        
        <DashboardSearch />

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Column 1 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <Link href="/admin/skills" className="dashboard-column-header-title transition-colors">
                All Skills <ChevronRight size={14}/>
              </Link>
              <button><Plus size={16} /></button>
            </div>
            <div className="dashboard-card-list">
              {recentSkills.length > 0 ? (
                recentSkills.map((skill) => (
                  <Link href={`/admin/skills/${skill.slug}`} key={skill.id} className="dashboard-card group">
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
            
            <div className="dashboard-empty-card" style={{ marginTop: '1rem', width: '100%' }}>
              <Rocket size={16} />
              <span>Create something new</span>
            </div>
          </div>
        </div>
      </div>
  );
}
