"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
import Link from "next/link";

type PointHistoryRecord = {
  id: string;
  skillId: string | null;
  amount: number;
  status: "VALIDATED" | "INVALIDATED";
  createdAt: Date;
  skill?: { slug: string; title: string } | null;
};

type UserPointData = {
  id: string;
  userId: string;
  totalPoint: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
    email: string;
    pointHistory: PointHistoryRecord[];
  };
};

type SortConfig = {
  key: keyof UserPointData | 'userName';
  direction: "asc" | "desc";
} | null;

export default function PointsClient({ initialPoints }: { initialPoints: UserPointData[] }) {
  const [points, setPoints] = useState<UserPointData[]>(initialPoints);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPoints(initialPoints);
  }, [initialPoints]);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserPointData | null>(null);

  const openViewModal = (userPoint: UserPointData) => {
    setViewingUser(userPoint);
    setIsModalOpen(true);
  };

  const processedPoints = useMemo(() => {
    let filtered = points;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.user?.name || "").toLowerCase().includes(q) ||
        (p.user?.email || "").toLowerCase().includes(q)
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aRaw = sortConfig.key === 'userName' ? (a.user?.name || "") : a[sortConfig.key as keyof UserPointData];
        const bRaw = sortConfig.key === 'userName' ? (b.user?.name || "") : b[sortConfig.key as keyof UserPointData];
        
        const aCmp = aRaw instanceof Date ? aRaw.getTime() : (aRaw ?? "");
        const bCmp = bRaw instanceof Date ? bRaw.getTime() : (bRaw ?? "");
        
        if ((aCmp as string | number) < (bCmp as string | number)) return sortConfig.direction === "asc" ? -1 : 1;
        if ((aCmp as string | number) > (bCmp as string | number)) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [points, searchQuery, sortConfig]);

  const totalRecords = processedPoints.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedPoints = processedPoints.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof UserPointData | 'userName') => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: keyof UserPointData | 'userName') => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <>
      <div className="categories-controls">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--table-text)' }}>Author Points Leaderboard</h1>
        <div className="categories-actions-group">
          <button className="categories-btn categories-btn-outline"><Filter size={14}/> Filters</button>
          <button className="categories-btn categories-btn-outline"><Download size={14}/> Export</button>
        </div>
      </div>

      <div className="categories-table-container">
        <div className="categories-table-top">
          <div className="categories-search-container" style={{ margin: 0, height: '2.25rem', flex: 1, maxWidth: '100%', marginRight: '1rem' }}>
            <Search size={14} className="categories-search-icon" />
            <input 
              type="text" 
              placeholder="Search by Author Name or Email..." 
              className="categories-search-input"
              style={{ fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="categories-pagination-top">
            <span className="mr-2">Show</span>
            <select 
              className="categories-per-page-select" 
              value={perPage} 
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="categories-table">
            <thead>
              <tr>
                <th className="categories-th" style={{ width: '5%' }}>Rank</th>
                <th className="categories-th sortable" style={{ width: '25%' }} onClick={() => handleSort('userName')}>
                  <div className="categories-th-inner">Author {renderSortIcon("userName")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '20%' }} onClick={() => handleSort('totalPoint')}>
                  <div className="categories-th-inner">Total Points {renderSortIcon("totalPoint")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '25%' }} onClick={() => handleSort('updatedAt')}>
                  <div className="categories-th-inner">Last Updated {renderSortIcon("updatedAt")}</div>
                </th>
                <th className="categories-th text-right" style={{ width: '15%' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="categories-td text-center text-zinc-500 py-8">No points data found.</td>
                </tr>
              ) : (
                paginatedPoints.map((p, idx) => (
                  <tr key={p.id} className="categories-tr">
                    <td className="categories-td font-medium">
                      #{(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="categories-td">
                      <div className="flex flex-col">
                        <span className="font-medium" title={p.user?.email || 'N/A'}>{p.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-zinc-500">{p.user?.email}</span>
                      </div>
                    </td>
                    <td className="categories-td">
                      <span className="header-role-badge" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg)', border: 'none' }}>
                        {p.totalPoint} PTS
                      </span>
                    </td>
                    <td className="categories-td text-zinc-500" style={{ textOverflow: 'clip' }}>
                      {new Date(p.updatedAt).toLocaleString()}
                    </td>
                    <td className="categories-td text-right">
                      <button className="categories-table-action-btn" onClick={() => openViewModal(p)}>
                        <Eye size={14} className="inline mr-1" /> View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="categories-table-footer">
          <span>Showing {totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}</span>
          <div className="categories-pagination-controls">
            <button 
              className="categories-page-btn" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="categories-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && viewingUser && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Point History: {viewingUser.user.name}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body p-0">
              {viewingUser.user.pointHistory && viewingUser.user.pointHistory.length > 0 ? (
                <div className="overflow-x-auto w-full">
                  <table className="categories-table" style={{ margin: 0, border: 'none', minWidth: '750px' }}>
                    <thead>
                      <tr>
                        <th className="categories-th" style={{ width: '22%' }}>Date</th>
                        <th className="categories-th" style={{ width: '48%' }}>Action/Source</th>
                        <th className="categories-th" style={{ width: '15%' }}>Point</th>
                        <th className="categories-th text-right" style={{ width: '15%' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingUser.user.pointHistory.map(history => (
                        <tr key={history.id} className="categories-tr">
                          <td className="categories-td text-xs">
                            {new Date(history.createdAt).toLocaleString(undefined, { 
                              year: 'numeric', month: 'numeric', day: 'numeric', 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </td>
                          <td className="categories-td text-xs truncate max-w-[200px]" title={history.skill ? history.skill.title : ''}>
                            {history.skill ? (
                              <Link href={`/admin/skills/${history.skill.slug}`} className="hover:underline text-[var(--primary)] block truncate">
                                Published ({history.skill.slug})
                              </Link>
                            ) : history.skillId ? (
                              `Skill Published (${history.skillId.slice(0, 8)}...)`
                            ) : (
                              'System Award'
                            )}
                          </td>
                          <td className="categories-td text-xs font-medium" style={{ color: history.amount > 0 ? 'var(--primary)' : 'var(--danger, #ef4444)' }}>
                            {history.amount > 0 ? `+${history.amount}` : history.amount}
                          </td>
                          <td className="categories-td text-right">
                            <span className={`header-role-badge ${history.status === 'INVALIDATED' ? 'danger' : ''}`} style={{ fontSize: '0.65rem' }}>
                              {history.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {viewingUser.user.pointHistory.length === 20 && (
                    <div className="p-3 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border-t border-[var(--border)]">
                      Showing latest 20 records
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No point history recorded yet.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="categories-btn categories-btn-outline" 
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
