"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, CheckCircle2, AlertCircle } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

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

  const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingCategory) {
      result = await updateCategory(editingCategory.id, formData);
    } else {
      result = await createCategory(formData);
    }
    
    setIsModalOpen(false);
    setIsSubmitting(false);

    if (result?.error) {
      setAlertConfig({ type: 'error', title: 'Action Failed', message: result.error });
    } else {
      setEditingCategory(null);
      setAlertConfig({ type: 'success', title: 'Success', message: 'Category record has been successfully saved.' });
    }
  };

  const handleDeleteCategory = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmId) return;
    setIsSubmitting(true);
    const result = await deleteCategory(deleteConfirmId);
    setDeleteConfirmId(null);
    setIsSubmitting(false);
    
    if (result?.error) {
      setAlertConfig({ type: 'error', title: 'Action Failed', message: result.error });
    } else {
      setAlertConfig({ type: 'success', title: 'Success', message: 'Category record has been successfully deleted.' });
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
                <th className="categories-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('updatedAt')}>
                  <div className="categories-th-inner">Updated {renderSortIcon("updatedAt")}</div>
                </th>
                <th className="categories-th text-right" style={{ width: '10%' }}>#</th>
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
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>{new Date(c.updatedAt).toLocaleDateString()}</td>
                    <td className="categories-td text-right">
                      <button className="categories-table-action-btn" onClick={() => openEditModal(c)}>Edit</button>
                      <button className="categories-table-action-btn ml-2" style={{ color: 'var(--danger, #ef4444)' }} onClick={() => handleDeleteCategory(c.id)}>Delete</button>
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
              <h2 className="modal-title">{editingCategory ? "Edit Category Record" : "Add Category Record"}</h2>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitCategory}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-label">Name</label>
                  <input required type="text" name="name" defaultValue={editingCategory?.name || ""} className="modal-input" placeholder="e.g. Frontend Development" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group mb-0">
                  <label className="modal-label">Description (Optional)</label>
                  <textarea name="description" defaultValue={editingCategory?.description || ""} className="modal-input" placeholder="Brief description of this category" disabled={isSubmitting} style={{ resize: 'vertical', minHeight: '80px' }}></textarea>
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
              <p className="alert-message">Are you sure you want to delete this category? This action cannot be undone.</p>
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
                onClick={confirmDeleteCategory} 
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
