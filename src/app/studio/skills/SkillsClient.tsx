"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Skill = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  slug: string;
  category?: { name: string } | null;
};

type SortConfig = {
  key: keyof Skill | 'categoryName';
  direction: "asc" | "desc";
} | null;

export default function SkillsClient({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSkills(initialSkills);
  }, [initialSkills]);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const processedSkills = useMemo(() => {
    let filtered = skills;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        (s.category?.name?.toLowerCase() || "").includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number | Date = sortConfig.key === 'categoryName' ? (a.category?.name || "") : (a[sortConfig.key as keyof Skill] as string | number | Date);
        let bVal: string | number | Date = sortConfig.key === 'categoryName' ? (b.category?.name || "") : (b[sortConfig.key as keyof Skill] as string | number | Date);
        
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [skills, searchQuery, sortConfig]);

  const totalRecords = processedSkills.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedSkills = processedSkills.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof Skill | 'categoryName') => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: keyof Skill | 'categoryName') => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedSkills.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteSkill = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/skills/${deleteConfirmId}`, { method: "DELETE" });
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== deleteConfirmId));
        router.refresh();
      } else {
        alert("Failed to delete skill");
      }
    } catch {
      alert("Error deleting skill");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <div className="skills-controls">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--table-text)' }}>My Skills</h1>
        <div className="skills-actions-group">
          <button className="skills-btn skills-btn-outline"><Filter size={14}/> Filters</button>
          <Link href="/studio/skills/new" className="skills-btn skills-btn-primary">
            <Plus size={14}/> New Draft
          </Link>
        </div>
      </div>

      <div className="skills-table-container">
        <div className="skills-table-top">
          <div className="skills-search-container" style={{ margin: 0, height: '2.25rem', flex: 1, maxWidth: '100%', marginRight: '1rem' }}>
            <Search size={14} className="skills-search-icon" />
            <input 
              type="text" 
              placeholder="Search Skills" 
              className="skills-search-input"
              style={{ fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="skills-pagination-top">
            <span className="mr-2">Show</span>
            <select 
              className="skills-per-page-select" 
              value={perPage} 
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="skills-table">
            <thead>
              <tr>
                <th className="skills-th skills-th-checkbox">
                  <input 
                    type="checkbox" 
                    className="skills-checkbox" 
                    checked={paginatedSkills.length > 0 && selectedIds.size === paginatedSkills.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="skills-th sortable" style={{ width: '35%' }} onClick={() => handleSort('title')}>
                  <div className="skills-th-inner">Title {renderSortIcon("title")}</div>
                </th>
                <th className="skills-th sortable" style={{ width: '20%' }} onClick={() => handleSort('categoryName')}>
                  <div className="skills-th-inner">Category {renderSortIcon("categoryName")}</div>
                </th>
                <th className="skills-th sortable" style={{ width: '15%' }} onClick={() => handleSort('status')}>
                  <div className="skills-th-inner">Status {renderSortIcon("status")}</div>
                </th>
                <th className="skills-th sortable" style={{ width: '15%', textOverflow: 'clip' }} onClick={() => handleSort('createdAt')}>
                  <div className="skills-th-inner">Created {renderSortIcon("createdAt")}</div>
                </th>
                <th className="skills-th text-right" style={{ width: '15%' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSkills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="skills-td text-center text-zinc-500 py-8">No skills found.</td>
                </tr>
              ) : (
                paginatedSkills.map(s => (
                  <tr key={s.id} className="skills-tr">
                    <td className="skills-td skills-td-checkbox">
                      <input 
                        type="checkbox" 
                        className="skills-checkbox" 
                        checked={selectedIds.has(s.id)}
                        onChange={() => handleSelectRow(s.id)}
                      />
                    </td>
                    <td className="skills-td skills-td-name" title={s.title}>{s.title}</td>
                    <td className="skills-td text-zinc-500" title={s.category?.name || "Uncategorized"}>{s.category?.name || "Uncategorized"}</td>
                    <td className="skills-td" style={{ textOverflow: 'clip' }}>
                      <span className={`review-badge ${
                        s.status === "ARCHIVED" ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" :
                        s.status.toLowerCase()
                      }`}>
                        {s.status === "IN_REVIEW" ? "IN REVIEW" : s.status}
                      </span>
                    </td>
                    <td className="skills-td" style={{ textOverflow: 'clip' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="skills-td text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/studio/skills/view/${s.slug}`} target="_blank" className="skills-table-action-btn">
                          View
                        </Link>
                        <Link href={`/studio/skills/edit/${s.slug}`} className="skills-table-action-btn">
                          Edit
                        </Link>
                        <button onClick={() => handleDeleteClick(s.id)} className="skills-table-action-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="skills-table-footer">
          <span>Showing {totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}</span>
          <div className="skills-pagination-controls">
            <button 
              className="skills-page-btn" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="skills-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="alert-overlay" onClick={() => !isDeleting && setDeleteConfirmId(null)}>
          <div className="alert-modal" onClick={e => e.stopPropagation()}>
            <div className="alert-header">
              <div className="alert-title-container">
                <AlertCircle className="alert-icon alert-icon-error" />
                <h3 className="alert-title">Delete Skill</h3>
              </div>
              <button type="button" className="alert-close-btn" onClick={() => !isDeleting && setDeleteConfirmId(null)} disabled={isDeleting}>
                <X size={16} />
              </button>
            </div>
            <div className="alert-body">
              <p className="alert-message">Are you sure you want to delete this skill? This action cannot be undone.</p>
            </div>
            <div className="alert-footer flex justify-end gap-3 mt-4">
              <button 
                type="button"
                className="skills-btn skills-btn-outline" 
                onClick={() => setDeleteConfirmId(null)} 
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="skills-btn" 
                style={{ backgroundColor: 'var(--danger, #ef4444)', color: 'white', border: 'none' }}
                onClick={confirmDeleteSkill} 
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
