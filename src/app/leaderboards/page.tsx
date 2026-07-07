import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { syncMissingPoints } from "@/lib/points";
import LeaderboardTable from "./LeaderboardTable";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Leaderboard | Top Authors - LibrarySkill",
    description: "Check out the top authors on LibrarySkill who have contributed the most published skills.",
  };
}

export default async function LeaderboardPage() {
  // Automatically generate any missing points
  await syncMissingPoints();

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
  }).slice(0, 10).map(author => ({
    id: author.id,
    name: author.name,
    slug: author.slug,
    pointScore: author.point?.totalPoint || 0,
    skillsCount: author._count.skills
  }));

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

        <LeaderboardTable topAuthors={topAuthors} />
      </div>
      
      <div className="mt-auto pt-12">
        <Footer />
      </div>
    </div>
  );
}
