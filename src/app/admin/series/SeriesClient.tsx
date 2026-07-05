"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, CheckCircle2, AlertCircle } from "lucide-react";
import { createSeries, updateSeries, deleteSeries } from "./actions";

type Series = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    docs: number;
  };
};

type SortConfig = {
  key: keyof Series | 'docsCount';
  direction: "asc" | "desc";
} | null;

export default function SeriesClient({ initialSeries }: { initialSeries: Series[] }) {
  const [series, setSeries] = useState<Series[]>(initialSeries);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeries(initialSeries);
  }, [initialSeries]);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingSeries(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Series) => {
    setEditingSeries(item);
    setIsModalOpen(true);
  };

  const processedSeries = useMemo(() => {
    let filtered = series;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.slug.toLowerCase().includes(q)
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number = sortConfig.key === 'docsCount' ? (a._count?.docs || 0) : (a[sortConfig.key as keyof Series] as string | number);
        let bVal: string | number = sortConfig.key === 'docsCount' ? (b._count?.docs || 0) : (b[sortConfig.key as keyof Series] as string | number);
        
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [series, searchQuery, sortConfig]);

  const totalRecords = processedSeries.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedSeries = processedSeries.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof Series | 'docsCount') => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: keyof Series | 'docsCount') => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedSeries.map(c => c.id)));
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

  const handleSubmitSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingSeries) {
      result = await updateSeries(editingSeries.id, formData);
    } else {
      result = await createSeries(formData);
    }
    
    setIsModalOpen(false);
    setIsSubmitting(false);

    if (result?.error) {
      setAlertConfig({ type: 'error', title: 'Action Failed', message: result.error });
    } else {
      setEditingSeries(null);
      setAlertConfig({ type: 'success', title: 'Success', message: 'Series record has been successfully saved.' });
    }
  };

  const handleDeleteSeries = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteSeries = async () => {
    if (!deleteConfirmId) return;
    setIsSubmitting(true);
    const result = await deleteSeries(deleteConfirmId);
    setDeleteConfirmId(null);
    setIsSubmitting(false);
    
    if (result?.error) {
      setAlertConfig({ type: 'error', title: 'Action Failed', message: result.error });
    } else {
      setAlertConfig({ type: 'success', title: 'Success', message: 'Series record has been successfully deleted.' });
    }
  };

  return (
    <>
      <div className="categories-controls">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--table-text)' }}>Series Management</h1>
        <div className="categories-actions-group">
          <button className="categories-btn categories-btn-outline"><Filter size={14}/> Filters</button>
          <button className="categories-btn categories-btn-outline"><Upload size={14}/> Import</button>
          <button className="categories-btn categories-btn-outline"><Download size={14}/> Export</button>
          <button className="categories-btn categories-btn-primary" onClick={openAddModal}>
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
              placeholder="Search Series" 
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
                    checked={paginatedSeries.length > 0 && selectedIds.size === paginatedSeries.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="categories-th sortable" style={{ width: '25%' }} onClick={() => handleSort('title')}>
                  <div className="categories-th-inner">Title {renderSortIcon("title")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '20%' }} onClick={() => handleSort('slug')}>
                  <div className="categories-th-inner">Slug {renderSortIcon("slug")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '25%' }} onClick={() => handleSort('description')}>
                  <div className="categories-th-inner">Description {renderSortIcon("description")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('docsCount')}>
                  <div className="categories-th-inner">Docs {renderSortIcon("docsCount")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('createdAt')}>
                  <div className="categories-th-inner">Created {renderSortIcon("createdAt")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('updatedAt')}>
                  <div className="categories-th-inner">Updated {renderSortIcon("updatedAt")}</div>
                </th>
                <th className="categories-th text-right" style={{ width: '10%' }}>#</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSeries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="categories-td text-center text-zinc-500 py-8">No series found.</td>
                </tr>
              ) : (
                paginatedSeries.map(c => (
                  <tr key={c.id} className="categories-tr">
                    <td className="categories-td categories-td-checkbox">
                      <input 
                        type="checkbox" 
                        className="categories-checkbox" 
                        checked={selectedIds.has(c.id)}
                        onChange={() => handleSelectRow(c.id)}
                      />
                    </td>
                    <td className="categories-td categories-td-name" title={c.title}>{c.title}</td>
                    <td className="categories-td" title={c.slug}>{c.slug}</td>
                    <td className="categories-td text-zinc-500" title={c.description || '-'}>{c.description || '-'}</td>
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>
                      <span className="categories-td-role">{c._count?.docs || 0}</span>
                    </td>
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>{new Date(c.updatedAt).toLocaleDateString()}</td>
                    <td className="categories-td text-right">
                      <button className="categories-table-action-btn" onClick={() => openEditModal(c)}>Edit</button>
                      <button className="categories-table-action-btn ml-2" style={{ color: 'var(--danger, #ef4444)' }} onClick={() => handleDeleteSeries(c.id)}>Delete</button>
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
              <h2 className="modal-title">{editingSeries ? "Edit Series Record" : "Add Series Record"}</h2>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitSeries}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-label">Title</label>
                  <input required type="text" name="title" defaultValue={editingSeries?.title || ""} className="modal-input" placeholder="e.g. NextJS Complete Guide" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group mb-0">
                  <label className="modal-label">Description (Optional)</label>
                  <textarea name="description" defaultValue={editingSeries?.description || ""} className="modal-input" placeholder="Brief description of this series" disabled={isSubmitting} style={{ resize: 'vertical', minHeight: '80px' }}></textarea>
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

      {alertConfig && (
        <div className="alert-overlay" onClick={() => setAlertConfig(null)}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <div className="alert-title-container">
                {alertConfig.type === 'success' ? (
                  <CheckCircle2 className="alert-icon alert-icon-success" />
                ) : (
                  <AlertCircle className="alert-icon alert-icon-error" />
                )}
                <h3 className="alert-title">{alertConfig.title}</h3>
              </div>
              <button type="button" className="alert-close-btn" onClick={() => setAlertConfig(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="alert-body">
              <p className="alert-message">{alertConfig.message}</p>
            </div>
            <div className="alert-footer">
              <button type="button" className="alert-btn alert-btn-primary" onClick={() => setAlertConfig(null)}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="alert-overlay" onClick={() => !isSubmitting && setDeleteConfirmId(null)}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <div className="alert-title-container">
                <AlertCircle className="alert-icon alert-icon-error" />
                <h3 className="alert-title">Confirm Deletion</h3>
              </div>
              <button type="button" className="alert-close-btn" onClick={() => !isSubmitting && setDeleteConfirmId(null)} disabled={isSubmitting}>
                <X size={16} />
              </button>
            </div>
            <div className="alert-body">
              <p className="alert-message">Are you sure you want to delete this series? This action cannot be undone.</p>
            </div>
            <div className="alert-footer flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                className="categories-btn categories-btn-outline" 
                onClick={() => setDeleteConfirmId(null)} 
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="categories-btn" 
                style={{ backgroundColor: 'var(--danger, #ef4444)', color: 'white', border: 'none' }} 
                onClick={confirmDeleteSeries} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
