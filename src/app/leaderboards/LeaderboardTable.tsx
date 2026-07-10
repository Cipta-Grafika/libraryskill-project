"use client";

import { Trophy, Medal, Code, Award } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type TopAuthor = {
  id: string;
  name: string | null;
  slug: string | null;
  pointScore: number;
  skillsCount: number;
};

export default function LeaderboardTable({ topAuthors }: { topAuthors: TopAuthor[] }) {
  const [animationParent] = useAutoAnimate<HTMLTableSectionElement>();

  return (
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
            <tbody ref={animationParent}>
              {topAuthors.map((author, index) => {
                const rank = index + 1;
                
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
                        {author.skillsCount}
                      </span>
                    </td>
                    <td className="categories-td text-right whitespace-nowrap">
                      <span className="inline-flex items-center justify-end gap-2 font-bold text-lg text-[var(--primary)]">
                        {author.pointScore} <Award size={16} />
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
  );
}
