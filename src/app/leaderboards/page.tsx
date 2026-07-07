import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Trophy, Medal, Award, Code } from "lucide-react";
import { db } from "@/lib/db";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Leaderboard | Top Authors - LibrarySkill",
    description: "Check out the top authors on LibrarySkill who have contributed the most published skills.",
  };
}

export default async function LeaderboardPage() {
  const authorsRaw = await db.user.findMany({
    where: { role: "AUTHOR" },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      point: {
        select: { totalPoint: true }
      },
      _count: {
        select: {
          skills: {
            where: { status: "PUBLISHED" }
          }
        }
      }
    },
    orderBy: {
      point: { totalPoint: "desc" }
    },
    take: 50 // Fetch more to accurately sort ties in memory
  });

  // Sort by Points DESC, then by Published Skills DESC
  const topAuthors = authorsRaw.sort((a, b) => {
    const pointsA = a.point?.totalPoint || 0;
    const pointsB = b.point?.totalPoint || 0;
    
    if (pointsB !== pointsA) {
      return pointsB - pointsA;
    }
    
    return b._count.skills - a._count.skills;
  }).slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="w-full relative border-b border-[var(--search-border)] pt-12 pb-16 md:pt-16 md:pb-20 flex flex-col items-center flex-grow">
        <div className="skills-hero-bg"></div>
        <h1 className="dashboard-title mb-2 mt-0 text-center relative z-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <Trophy className="text-[var(--primary)] shrink-0 mb-1 md:mb-0" size={36} />
          <span>Top Authors Leaderboard</span>
        </h1>
        <p className="text-center text-[var(--dash-text-muted)] max-w-2xl px-4 relative z-10 mb-10">
          Celebrating the most active and impactful contributors in our community.
        </p>

        <div className="w-full max-w-4xl px-4 relative z-20">
          <div className="bg-[var(--card-bg)] border border-[var(--table-border)] rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto w-full">
            <table className="categories-table min-w-[500px] md:min-w-[700px]" style={{ margin: 0, border: 'none', minWidth: 'unset', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th className="categories-th whitespace-nowrap" style={{ width: '15%', textAlign: 'center' }}>Rank</th>
                  <th className="categories-th whitespace-nowrap" style={{ width: '45%' }}>Author</th>
                  <th className="categories-th whitespace-nowrap text-center" style={{ width: '20%' }}>Published Skills</th>
                  <th className="categories-th whitespace-nowrap text-right" style={{ width: '20%' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {topAuthors.map((author, index) => {
                  const rank = index + 1;
                  const pointScore = author.point?.totalPoint || 0;
                  const skillsCount = author._count.skills;
                  
                  let rankDisplay = <span className="font-bold text-zinc-500">#{rank}</span>;
                  if (rank === 1) {
                    rankDisplay = <Trophy size={22} className="text-yellow-500 drop-shadow-sm mx-auto" fill="currentColor" />;
                  } else if (rank === 2) {
                    rankDisplay = <Medal size={22} className="text-slate-400 drop-shadow-sm mx-auto" fill="currentColor" />;
                  } else if (rank === 3) {
                    rankDisplay = <Medal size={22} className="text-amber-600 drop-shadow-sm mx-auto" fill="currentColor" />;
                  }

                  return (
                    <tr key={author.id} className={`categories-tr hover:bg-[var(--card-hover)] transition-colors ${rank <= 3 ? 'bg-zinc-50/50 dark:bg-zinc-900/50' : ''}`}>
                      <td className="categories-td text-center align-middle">
                        {rankDisplay}
                      </td>
                      <td className="categories-td">
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--foreground)] text-base">{author.name || 'Unknown User'}</span>
                          <span className="text-xs text-[var(--dash-text-muted)] mt-0.5">@{author.slug || author.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="categories-td text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                          <Code size={14} className="text-zinc-500" />
                          {skillsCount}
                        </span>
                      </td>
                      <td className="categories-td text-right whitespace-nowrap">
                        <span className="inline-flex items-center justify-end gap-2 font-bold text-lg text-[var(--primary)]">
                          {pointScore} <Award size={16} />
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {topAuthors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="categories-td text-center text-[var(--dash-text-muted)] py-12">
                      No authors found on the leaderboard yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
      
      <div className="mt-auto pt-12">
        <Footer />
      </div>
    </div>
  );
}
