"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { createCategory } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  _count?: {
    skills: number;
  };
};

type SortConfig = {
  key: keyof Category | 'skillsCount';
  direction: "asc" | "desc";
} | null;

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories(initialCategories);
  }, [initialCategories]);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const processedCategories = useMemo(() => {
    let filtered = categories;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.slug.toLowerCase().includes(q)
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = sortConfig.key === 'skillsCount' ? (a._count?.skills || 0) : a[sortConfig.key as keyof Category];
        let bVal: any = sortConfig.key === 'skillsCount' ? (b._count?.skills || 0) : b[sortConfig.key as keyof Category];
        
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [categories, searchQuery, sortConfig]);

  const totalRecords = processedCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedCategories = processedCategories.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof Category | 'skillsCount') => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: keyof Category | 'skillsCount') => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedCategories.map(c => c.id)));
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

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");

    const formData = new FormData(e.currentTarget);
    
    const result = await createCategory(formData);
    
    if (result?.error) {
      setModalError(result.error);
      setIsSubmitting(false);
    } else {
      setIsModalOpen(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="categories-controls">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--table-text)' }}>Categories</h1>
        <div className="categories-actions-group">
          <button className="categories-btn categories-btn-outline"><Filter size={14}/> Filters</button>
          <button className="categories-btn categories-btn-outline"><Upload size={14}/> Import</button>
          <button className="categories-btn categories-btn-outline"><Download size={14}/> Export</button>
          <button className="categories-btn categories-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={14}/> Add
          </button>
        </div>
      </div>

      <div className="categories-table-container">
        <div className="categories-table-top">
          <div className="categories-search-container" style={{ margin: 0, height: '2.25rem', flex: 1, maxWidth: '100%', marginRight: '1rem' }}>
            <Search size={14} className="categories-search-icon" />
            <input 
              type="text" 
              placeholder="Search Categories" 
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="categories-table">
            <thead>
              <tr>
                <th className="categories-th categories-th-checkbox">
                  <input 
                    type="checkbox" 
                    className="categories-checkbox" 
                    checked={paginatedCategories.length > 0 && selectedIds.size === paginatedCategories.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="categories-th sortable" style={{ width: '25%' }} onClick={() => handleSort('name')}>
                  <div className="categories-th-inner">Name {renderSortIcon("name")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '20%' }} onClick={() => handleSort('slug')}>
                  <div className="categories-th-inner">Slug {renderSortIcon("slug")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '25%' }} onClick={() => handleSort('description')}>
                  <div className="categories-th-inner">Description {renderSortIcon("description")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('skillsCount')}>
                  <div className="categories-th-inner">Skills {renderSortIcon("skillsCount")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('createdAt')}>
                  <div className="categories-th-inner">Created {renderSortIcon("createdAt")}</div>
                </th>
                <th className="categories-th text-right" style={{ width: '10%' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="categories-td text-center text-zinc-500 py-8">No categories found.</td>
                </tr>
              ) : (
                paginatedCategories.map(c => (
                  <tr key={c.id} className="categories-tr">
                    <td className="categories-td categories-td-checkbox">
                      <input 
                        type="checkbox" 
                        className="categories-checkbox" 
                        checked={selectedIds.has(c.id)}
                        onChange={() => handleSelectRow(c.id)}
                      />
                    </td>
                    <td className="categories-td categories-td-name" title={c.name}>{c.name}</td>
                    <td className="categories-td" title={c.slug}>{c.slug}</td>
                    <td className="categories-td text-zinc-500" title={c.description || '-'}>{c.description || '-'}</td>
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>
                      <span className="categories-td-role">{c._count?.skills || 0}</span>
                    </td>
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="categories-td text-right">
                      <button className="categories-table-action-btn">Edit</button>
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Category</h2>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="modal-body">
                {modalError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    {modalError}
                  </div>
                )}
                
                <div className="modal-form-group">
                  <label className="modal-label">Name</label>
                  <input required type="text" name="name" className="modal-input" placeholder="e.g. Frontend Development" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group mb-0">
                  <label className="modal-label">Description (Optional)</label>
                  <textarea name="description" className="modal-input" placeholder="Brief description of this category" disabled={isSubmitting} style={{ resize: 'vertical', minHeight: '80px' }}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="categories-btn categories-btn-outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="categories-btn categories-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
